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
  // Return true if client key is configured, or if running in deployed environment
  return resolveApiKey().length > 0 || typeof window !== "undefined";
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
      message: "Your Gemini API key appears to be invalid. Please verify it in Settings or Netlify.",
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
  if (lower.includes("no gemini_api_key configured")) {
    return {
      kind: "missing_key",
      message: "No Gemini API key found. Add GEMINI_API_KEY to your Netlify Environment Variables or paste one in Settings.",
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
      message: "Couldn't connect to the AI service. Please check your internet connection.",
    };
  }
  return {
    kind: "unknown",
    message: message.length > 200 ? "Something went wrong generating a response. Please try again." : message,
  };
}

/**
 * Validates a Gemini API key by making a lightweight ping request.
 * Can test client-side key or serverless Netlify function.
 */
export async function testApiKey(key?: string): Promise<{ ok: boolean; error?: string }> {
  const cleaned = (key || resolveApiKey()).trim();

  // If a key is explicitly provided, test client-side
  if (cleaned) {
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

  // Otherwise, test serverless Netlify function
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test" }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      return { ok: true };
    }
    return { ok: false, error: data.error || "Server function could not reach Gemini API." };
  } catch (err) {
    const genErr = toGenerationError(err);
    return { ok: false, error: genErr.message };
  }
}

/**
 * Splits raw model output into reasoning thoughtProcess and final response content.
 */
export function extractThoughts(rawText: string): { content: string; thoughtProcess?: string } {
  const thoughtMatch = rawText.match(/<(?:thought|think)>([\s\S]*?)<\/(?:thought|think)>/i);
  if (thoughtMatch) {
    const thoughtProcess = thoughtMatch[1].trim();
    const content = rawText.replace(/<(?:thought|think)>[\s\S]*?<\/(?:thought|think)>/i, "").trim();
    return { content, thoughtProcess };
  }

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
 * Streams response tokens from Gemini.
 * Uses client-side SDK if client key is configured, or proxies through
 * Netlify serverless function (/api/gemini) when deployed to prevent exposing secrets.
 */
export async function streamMessage({
  history,
  model,
  systemInstruction,
  temperature,
  signal,
  onChunk,
}: StreamMessageParams): Promise<string> {
  const clientKey = resolveApiKey();
  const selectedModel = model || storage.getActiveModel() || DEFAULT_GEMINI_MODEL;
  const activeSettings = storage.getSettings();
  const sysInst =
    systemInstruction ||
    activeSettings.systemInstruction ||
    "You are Aether, an intelligent, calm, and sophisticated AI assistant. Deliver clear, accurate, and insightful responses. Use clean GitHub-flavored Markdown with code blocks, tables, and lists where appropriate.";

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

  // 1. If client key is available (e.g. entered in local settings or .env), use GoogleGenAI directly
  if (clientKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: clientKey });

      const contents = validHistory.map((m) => {
        const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

        if (m.attachments && m.attachments.length > 0) {
          for (const att of m.attachments) {
            if (att.dataUrl && att.dataUrl.includes(",")) {
              parts.push({
                inlineData: {
                  mimeType: att.type || "image/png",
                  data: att.dataUrl.split(",")[1],
                },
              });
            }
          }
        }

        if (m.content && m.content.trim()) {
          parts.push({ text: m.content.trim() });
        } else if (parts.length === 0) {
          parts.push({ text: "Hello" });
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
      if ((err as GenerationError).kind) throw err;
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      throw toGenerationError(err);
    }
  }

  // 2. Server-side proxy mode: Stream from Netlify serverless function (/api/gemini)
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: validHistory,
        model: selectedModel,
        systemInstruction: sysInst,
        temperature: temperature ?? activeSettings.temperature ?? 0.7,
      }),
      signal,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errJson.error || `Server request failed with code ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error("Unable to read response stream from server.");
    }

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (signal?.aborted) break;

      const delta = decoder.decode(value, { stream: true });
      if (delta) {
        fullText += delta;
        onChunk(fullText, delta);
      }
    }

    if (!fullText.trim()) {
      const err: GenerationError = {
        kind: "empty_response",
        message: "Gemini returned an empty response. Please try again.",
      };
      throw err;
    }

    return fullText;
  } catch (err) {
    if ((err as GenerationError).kind) throw err;
    if (err instanceof DOMException && err.name === "AbortError") throw err;
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
