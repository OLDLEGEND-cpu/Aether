import { useNavigate } from "react-router-dom";
import { Sparkles, Database, Cpu, Layers } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { Card } from "../components/common/Surfaces";
import { Button } from "../components/common/Button";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold sm:text-4xl" style={{ color: "var(--text-primary)" }}>
          About Aether
        </h1>
        <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Aether is a calm, focused chat interface built on top of Google's Gemini models. It was
          designed as a practice project to explore what a premium, production-quality AI product
          experience looks like — without the complexity of a full backend.
        </p>
        <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          The goal isn't to reinvent the AI assistant — it's to demonstrate careful frontend craft:
          thoughtful information architecture, responsive layouts, accessible components, and an
          interaction model that feels effortless.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <Sparkles size={18} style={{ color: "var(--accent)" }} />
            <h3 className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Core capabilities
            </h3>
            <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
              Natural conversation, markdown rendering, code highlighting, and a curated prompt library.
            </p>
          </Card>
          <Card>
            <Cpu size={18} style={{ color: "var(--accent)" }} />
            <h3 className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Gemini integration
            </h3>
            <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
              Aether talks directly to Google's Gemini API to generate responses in real time.
            </p>
          </Card>
          <Card>
            <Database size={18} style={{ color: "var(--accent)" }} />
            <h3 className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Local-first storage
            </h3>
            <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
              Conversations, settings, and saved prompts live in your browser's local storage.
            </p>
          </Card>
          <Card>
            <Layers size={18} style={{ color: "var(--accent)" }} />
            <h3 className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Technology
            </h3>
            <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
              React, TypeScript, Vite, and Tailwind CSS — a clean, modern frontend stack.
            </p>
          </Card>
        </div>

        <div className="mt-12">
          <Button onClick={() => navigate("/chat")}>Start Chatting</Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
