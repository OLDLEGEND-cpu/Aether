import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Zap,
  Code2,
  BookMarked,
  Lock,
  Cloud,
} from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Surfaces";
import { useChat } from "../context/ChatContext";

const EXAMPLE_PROMPTS = [
  "Explain quantum computing simply",
  "Help me plan a product launch",
  "Write a professional follow-up email",
  "Debug this JavaScript function",
  "Give me ideas for a weekend side project",
];

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time token streaming",
    description: "Watch responses stream dynamically character-by-character with blazing speed.",
  },
  {
    icon: Cloud,
    title: "Cloud sync & local-first",
    description: "Backed by Supabase with seamless local storage fallback and offline support.",
  },
  {
    icon: Code2,
    title: "Multimodal image vision",
    description: "Drag, drop, or paste screenshots and images for instant visual reasoning.",
  },
  {
    icon: MessagesSquare,
    title: "Voice input & read aloud",
    description: "Hands-free voice dictation and high-fidelity text-to-speech audio playback.",
  },
  {
    icon: BookMarked,
    title: "Curated prompt library",
    description: "A rich collection of prompts across coding, writing, research, and ideation.",
  },
  {
    icon: ShieldCheck,
    title: "Model selection & thinking",
    description: "Switch between Gemini 2.5 Flash, 2.5 Pro, and Deep Thinking reasoning models.",
  },
];

const STEPS = [
  { step: "01", title: "Add your Gemini API key", description: "Configure your key once in Settings — it stays in your browser." },
  { step: "02", title: "Start a conversation", description: "Ask questions, brainstorm, write, or get help with code." },
  { step: "03", title: "Keep your history", description: "Conversations are saved locally so you can pick up where you left off." },
];

export default function Home() {
  const navigate = useNavigate();
  const { sendUserMessage } = useChat();

  const handlePromptClick = (text: string) => {
    navigate("/chat");
    setTimeout(() => sendUserMessage(text), 50);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
        >
          <Sparkles size={12} style={{ color: "var(--accent)" }} />
          Powered by Google Gemini
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl" style={{ color: "var(--text-primary)" }}>
          A calm, intelligent AI assistant for your everyday thinking.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg" style={{ color: "var(--text-secondary)" }}>
          Aether is a premium chat interface for Gemini — built for clarity, speed, and focus.
          No clutter, no noise, just a great conversation.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={() => navigate("/chat")}>
            Start Chatting <ArrowRight size={16} />
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate("/about")}>
            Learn more
          </Button>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handlePromptClick(p)}
              className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--code-bg)] sm:text-sm"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
            Everything a modern AI chat needs
          </h2>
          <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
            Thoughtfully designed, genuinely useful.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="transition-shadow hover:shadow-md">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: "var(--code-bg)", color: "var(--accent)" }}
              >
                <Icon size={17} />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                {title}
              </h3>
              <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
                {description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t py-16" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
              How it works
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step}>
                <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                  {s.step}
                </span>
                <h3 className="mt-2 text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy note */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--code-bg)", color: "var(--accent)" }}
          >
            <Lock size={18} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
              Your conversations stay in your browser
            </h3>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Aether stores chat history locally using your browser's storage. Messages are sent directly
              to Google's Gemini API to generate responses. Aether has no backend server of its own.{" "}
              <button onClick={() => navigate("/privacy")} className="font-medium underline" style={{ color: "var(--accent)" }}>
                Read our privacy approach
              </button>
              .
            </p>
          </div>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-20 text-center sm:px-6">
        <h2 className="text-2xl font-semibold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          Ready to start a conversation?
        </h2>
        <div className="mt-6">
          <Button size="lg" onClick={() => navigate("/chat")}>
            Start Chatting <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
