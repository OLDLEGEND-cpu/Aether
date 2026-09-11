import { GoogleGenAI } from "@google/genai";

export default async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      },
    });
  }

  // Health / info check
  if (req.method === "GET") {
    const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
    return new Response(
      JSON.stringify({ status: "ok", serverConfigured: hasKey }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
    const body = await req.json().catch(() => ({}));

    // Allow testing a specific key from settings
    const keyToUse = (body.apiKeyOverride || apiKey).trim();

    if (!keyToUse) {
      return new Response(
        JSON.stringify({
          error: "No GEMINI_API_KEY configured in Netlify environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const ai = new GoogleGenAI({ apiKey: keyToUse });

    // Handle lightweight ping/test
    if (body.action === "test") {
      const testModel = body.model || "gemini-3.6-flash";
      const pingRes = await ai.models.generateContent({
        model: testModel,
        contents: [{ role: "user", parts: [{ text: "ping" }] }],
      });
      return new Response(JSON.stringify({ ok: Boolean(pingRes.text) }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { history, model, systemInstruction, temperature } = body;
    const selectedModel = model || "gemini-3.6-flash";

    // Validate history
    const validHistory = (history || []).filter(
      (m: any) =>
        m.status !== "error" &&
        (m.content?.trim() || (m.attachments && m.attachments.length > 0))
    );

    if (validHistory.length === 0) {
      return new Response(
        JSON.stringify({ error: "Contents are required. Please provide a message." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Format contents
    const contents = validHistory.map((m: any) => {
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

    // Generate stream
    const stream = await ai.models.generateContentStream({
      model: selectedModel,
      contents,
      config: {
        systemInstruction:
          systemInstruction ||
          "You are Aether, an intelligent, calm, and sophisticated AI assistant. Deliver clear, accurate, and insightful responses.",
        temperature: typeof temperature === "number" ? temperature : 0.7,
      },
    });

    // Stream chunks back to client using modern ReadableStream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text ?? "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (streamErr: any) {
          controller.error(streamErr);
        }
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Failed to process request with Gemini API" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
