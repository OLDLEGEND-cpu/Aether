import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Code2,
  BookMarked,
  Lock,
  Cloud,
  Mic,
  Brain,
  Copy,
} from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Surfaces";
import { AetherLogo } from "../components/common/AetherLogo";
import { useChat } from "../context/ChatContext";

const EXAMPLE_PROMPTS = [
  "Explain quantum computing simply",
  "Design a rate limiter in TypeScript",
  "Write an executive summary for Q3",
  "Threat modeling checklist for cloud SaaS",
  "Brainstorm high-leverage AI workflows",
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Token Streaming",
    description: "Real-time responses streamed dynamically via Gemini 3.6 Flash with sub-second latency.",
    gradient: "from-blue-500/20 to-indigo-500/20 text-blue-500",
  },
  {
    icon: Brain,
    title: "Deep Thinking Reasoning",
    description: "Harness Gemini 3.1 Pro to trace complex multi-step reasoning before answering.",
    gradient: "from-purple-500/20 to-pink-500/20 text-purple-500",
  },
  {
    icon: Cloud,
    title: "Supabase Cloud Sync",
    description: "Seamless real-time synchronization across devices backed by Supabase with offline caching.",
    gradient: "from-emerald-500/20 to-teal-500/20 text-emerald-500",
  },
  {
    icon: Code2,
    title: "Multimodal Vision",
    description: "Drag-and-drop screenshots, charts, or images for immediate visual breakdown and analysis.",
    gradient: "from-amber-500/20 to-orange-500/20 text-amber-500",
  },
  {
    icon: Mic,
    title: "Speech Dictation & Audio",
    description: "Speak naturally using voice recognition and listen to generated responses aloud with TTS.",
    gradient: "from-rose-500/20 to-red-500/20 text-rose-500",
  },
  {
    icon: BookMarked,
    title: "Curated Prompt Library",
    description: "Over 40+ engineering, executive, and brainstorming prompts tailored for immediate execution.",
    gradient: "from-cyan-500/20 to-blue-500/20 text-cyan-500",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Connect in Seconds",
    description: "Use Netlify's secure serverless proxy or input your personal Gemini API key.",
  },
  {
    step: "02",
    title: "Direct Your Focus",
    description: "Engage with multimodal vision, reasoning thoughts, or voice dictation in real time.",
  },
  {
    step: "03",
    title: "Sync Anywhere",
    description: "Keep chats saved locally or enable Supabase cloud sync across your phone and desktop.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { sendUserMessage } = useChat();

  const handlePromptClick = (text: string) => {
    navigate("/chat");
    setTimeout(() => sendUserMessage(text), 50);
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <SiteHeader />

      {/* Ambient Aurora Background Glow */}
      <div
        className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[450px] rounded-full blur-3xl opacity-35 dark:opacity-20 animate-ambient-glow"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(168, 85, 247, 0.25) 50%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-5xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24 z-10">
        <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold shadow-2xs transition-all hover:scale-105"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}>
          <Sparkles size={13} style={{ color: "var(--accent)" }} />
          <span>Powered by Google Gemini 3.6 &amp; 3.1 Pro</span>
          <span className="rounded-full px-1.5 py-0.2 text-[10px] font-bold" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
            New
          </span>
        </div>

        <h1
          className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}
        >
          A calm, intelligent AI assistant for focused minds.
        </h1>

        <p
          className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Aether is a state-of-the-art conversational interface crafted for speed, multimodal depth, and absolute visual clarity.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={() => navigate("/chat")}>
            Launch Aether Chat <ArrowRight size={16} />
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate("/explore")}>
            Explore Capabilities
          </Button>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handlePromptClick(p)}
              className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all hover:border-[var(--accent)] hover:shadow-xs active:scale-95"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Live UI Mockup Preview */}
        <div className="mt-14 mx-auto max-w-4xl rounded-2xl sm:rounded-3xl border shadow-2xl p-2 sm:p-3 glass-panel-elevated text-left">
          {/* Mock Window Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b select-none" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <AetherLogo size={18} showWordmark={true} showBadge={true} />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg px-2 py-0.5 text-[11px] font-semibold border" style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-muted)" }}>
                ⚡ Gemini 3.6 Flash
              </span>
            </div>
          </div>

          {/* Mock Conversation Messages */}
          <div className="p-4 sm:p-6 space-y-4 font-sans">
            {/* User Message Mock */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-xs px-4 py-2.5 text-sm font-medium shadow-xs" style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}>
                Design a high-performance token-bucket rate limiter in TypeScript.
              </div>
            </div>

            {/* Assistant Message Mock */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 select-none">
                <AetherLogo size={18} showWordmark={false} />
                <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Aether</span>
                <span className="text-[10px] font-medium rounded px-1.5 py-0.2" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                  AI
                </span>
              </div>
              <div className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                Here is a clean, production-grade token bucket rate limiter implementation with atomic replenishment:
              </div>

              {/* Mock Code Block */}
              <div className="rounded-xl border overflow-hidden shadow-xs" style={{ borderColor: "var(--border-strong)", background: "var(--code-bg)" }}>
                <div className="flex items-center justify-between px-3 py-1.5 border-b select-none" style={{ borderColor: "var(--border)", background: "var(--surface-subtle)" }}>
                  <span className="text-[11px] font-mono font-semibold" style={{ color: "var(--text-muted)" }}>typescript</span>
                  <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                    <Copy size={11} /> Copy
                  </span>
                </div>
                <pre className="p-3 text-xs font-mono overflow-x-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
{`class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(private capacity: number, private refillRatePerSec: number) {
    this.tokens = capacity;
    this.lastRefill = performance.now();
  }

  take(cost = 1): boolean {
    this.refill();
    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    return false;
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 z-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight" style={{ color: "var(--text-primary)" }}>
            Engineered for precision and clarity
          </h2>
          <p className="mt-3 text-sm sm:text-base font-medium" style={{ color: "var(--text-muted)" }}>
            Everything you need for serious daily thinking and production development.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, gradient }) => (
            <Card key={title} className="group flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
              <div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="border-y py-20" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight" style={{ color: "var(--text-primary)" }}>
              Simple, transparent workflow
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className="flex flex-col">
                <span className="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md self-start" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                  STEP {s.step}
                </span>
                <h3 className="mt-3 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Guarantee Note */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-xs"
            style={{ background: "var(--code-bg)", borderColor: "var(--border)", color: "var(--accent)" }}
          >
            <Lock size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              Private &amp; Secure by Design
            </h3>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Aether stores chat history locally using browser storage with optional encrypted Supabase cloud backup.
              API keys are never stored on any intermediary servers.{" "}
              <button onClick={() => navigate("/privacy")} className="font-semibold underline" style={{ color: "var(--accent)" }}>
                Read our privacy manifesto
              </button>
              .
            </p>
          </div>
        </Card>
      </section>

      {/* Final Call to Action */}
      <section className="mx-auto max-w-4xl px-4 pb-24 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight" style={{ color: "var(--text-primary)" }}>
          Elevate your daily thinking now.
        </h2>
        <div className="mt-6 flex justify-center">
          <Button size="lg" onClick={() => navigate("/chat")}>
            Launch Aether Free <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
