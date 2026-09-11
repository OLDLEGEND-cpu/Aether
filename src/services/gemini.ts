import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, GenerationError } from "../types/chat";
import { storage } from "./storage";

export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

export function resolveApiKey(): string {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const storedKey = storage.getApiKey();
  return (storedKey || envKey || "").trim();
}

export function hasApiKey(): boolean {
  return resolveApiKey().length > 0;
}

function toGenerationError(err: unknown): GenerationError {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (
    lower.includes("api key not valid") ||
    lower.includes("api_key_invalid") ||
    lower.includes("unregistered") ||
    lower.includes("invalid api key")
  ) {
    return {
      kind: "invalid_key",
      message: "Your Gemini API key appears to be invalid. Please verify it in Settings.",
    };
  }
  if (lower.includes("429") || lower.includes("quota") || lower.includes("rate limit") || lower.includes("resource_exhausted")) {
    return {
      kind: "rate_limit",
      message: "You have hit the Gemini API rate limit or quota. Please wait a moment and try again.",
    };
  }
  if (lower.includes("safety") || lower.includes("blocked") || lower.includes("harm")) {
    return {
      kind: "safety",
      message: "This prompt was blocked by Gemini's safety filters. Please try rephrasing your message.",
    };
  }
  if (lower.includes("contents are required") || lower.includes("content is required")) {
    return {
      kind: "unknown",
      message: "Please enter a message or question to send to Aether.",
    };
  }
  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("failed to fetch") ||
    lower.includes("timeout") ||
    lower.includes("offline")
  ) {
    return {
      kind: "network",
      message: "Couldn't connect to the Gemini API. Please check your internet connection.",
    };
  }
  return {
    kind: "unknown",
    message: message.length > 200 ? "Something went wrong generating a response. Please try again." : message,
  };
}

/**
 * Validates a Gemini API key by making a lightweight ping request.
 */
export async function testApiKey(key: string): Promise<{ ok: boolean; error?: string }> {
  const cleaned = key.trim();
  if (!cleaned) return { ok: false, error: "API key cannot be empty." };

  try {
    const ai = new GoogleGenAI({ apiKey: cleaned });
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts: [{ text: "ping" }] }],
    });
    if (response.text) {
      return { ok: true };
    }
    return { ok: false, error: "Received empty response from Gemini API." };
  } catch (err) {
    const genErr = toGenerationError(err);
    return { ok: false, error: genErr.message };
  }
}

/**
 * Splits raw model output into reasoning thoughtProcess and final response content.
 */
export function extractThoughts(rawText: string): { content: string; thoughtProcess?: string } {
  // Check for <thought>...</thought> or <think>...</think> tags
  const thoughtMatch = rawText.match(/<(?:thought|think)>([\s\S]*?)<\/(?:thought|think)>/i);
  if (thoughtMatch) {
    const thoughtProcess = thoughtMatch[1].trim();
    const content = rawText.replace(/<(?:thought|think)>[\s\S]*?<\/(?:thought|think)>/i, "").trim();
    return { content, thoughtProcess };
  }

  // Check if currently streaming inside an unclosed <thought> or <think> tag
  const openTagMatch = rawText.match(/<(?:thought|think)>([\s\S]*)$/i);
  if (openTagMatch) {
    return {
      content: "",
      thoughtProcess: openTagMatch[1].trim(),
    };
  }

  return { content: rawText };
}

interface StreamMessageParams {
  history: ChatMessage[];
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  signal?: AbortSignal;
  onChunk: (accumulatedText: string, delta: string) => void;
}

/**
 * Streams response tokens from Gemini using generateContentStream.
 * Handles both plain text and multimodal image parts.
 */
export async function streamMessage({
  history,
  model,
  systemInstruction,
  temperature,
  signal,
  onChunk,
}: StreamMessageParams): Promise<string> {
  const apiKey = resolveApiKey();

  if (!apiKey) {
    const err: GenerationError = {
      kind: "missing_key",
      message: "No Gemini API key configured. Enter your API key in Settings to start chatting.",
    };
    throw err;
  }

  const selectedModel = model || storage.getActiveModel() || DEFAULT_GEMINI_MODEL;
  const activeSettings = storage.getSettings();
  const sysInst =
    systemInstruction ||
    activeSettings.systemInstruction ||
    "You are Aether, an intelligent, calm, and sophisticated AI assistant. Deliver clear, accurate, and insightful responses. Use clean GitHub-flavored Markdown with code blocks, tables, and lists where appropriate.";

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Format conversation history for Gemini API
    const validHistory = history.filter(
      (m) => m.status !== "error" && (m.content?.trim() || (m.attachments && m.attachments.length > 0))
    );

    if (validHistory.length === 0) {
      const err: GenerationError = {
        kind: "unknown",
        message: "Please enter a message or question to send to Aether.",
      };
      throw err;
    }

    const contents = validHistory.map((m) => {
        const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

        // Add attachments (multimodal vision support)
        if (m.attachments && m.attachments.length > 0) {
          for (const att of m.attachments) {
            if (att.dataUrl.includes(",")) {
              const base64Data = att.dataUrl.split(",")[1];
              parts.push({
                inlineData: {
                  mimeType: att.type || "image/png",
                  data: base64Data,
                },
              });
            }
          }
        }

        // Add text prompt
        if (m.content) {
          parts.push({ text: m.content });
        } else if (parts.length === 0) {
          parts.push({ text: " " });
        }

        return {
          role: m.role === "user" ? "user" : "model",
          parts,
        };
      });

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: sysInst,
        temperature: temperature ?? activeSettings.temperature ?? 0.7,
        abortSignal: signal,
      },
    });

    let fullText = "";

    for await (const chunk of responseStream) {
      if (signal?.aborted) break;
      const delta = chunk.text ?? "";
      fullText += delta;
      onChunk(fullText, delta);
    }

    if (!fullText.trim()) {
      const err: GenerationError = {
        kind: "empty_response",
        message: "Gemini returned an empty response. Please try again or rephrase.",
      };
      throw err;
    }

    return fullText;
  } catch (err) {
    if ((err as GenerationError).kind) {
      throw err;
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    throw toGenerationError(err);
  }
}

/**
 * Generates a clean, concise title from the user's initial prompt.
 */
export function generateTitleFromMessage(message: string): string {
  const cleaned = message.trim().replace(/\s+/g, " ");
  if (!cleaned) return "New conversation";
  const words = cleaned.split(" ");
  const short = words.slice(0, 6).join(" ");
  return short.length < cleaned.length ? `${short}…` : short;
}
