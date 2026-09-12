import { Sparkles, Code2, PenTool, Lightbulb, ArrowUpRight, Zap, Brain, Eye, Mic } from "lucide-react";
import { AetherLogo } from "../common/AetherLogo";
import { useSettings } from "../../context/SettingsContext";

interface PromptCard {
  category: string;
  title: string;
  description: string;
  prompt: string;
  icon: typeof Sparkles;
  gradient: string;
}

const PROMPT_CARDS: PromptCard[] = [
  {
    category: "Code Architecture",
    title: "Build scalable rate limiter",
    description: "Design a token-bucket middleware in TypeScript",
    prompt: "Design a high-performance token bucket rate-limiting middleware in TypeScript with Redis backing. Include edge case handling and TypeScript interfaces.",
    icon: Code2,
    gradient: "from-blue-500/20 to-indigo-500/20 text-blue-500",
  },
  {
    category: "Deep Analysis",
    title: "Deconstruct quantum computing",
    description: "Explain qubits and superposition with intuitive analogies",
    prompt: "Explain quantum computing, qubits, and superposition using clear physical analogies that a senior software engineer without a physics degree can immediately grasp.",
    icon: Brain,
    gradient: "from-purple-500/20 to-pink-500/20 text-purple-500",
  },
  {
    category: "Executive Writing",
    title: "Draft an executive pitch",
    description: "Compelling proposal for engineering leadership",
    prompt: "Draft an executive-ready proposal outlining why our organization should adopt an AI-assisted development workflow, detailing ROI, security posture, and rollout phases.",
    icon: PenTool,
    gradient: "from-amber-500/20 to-orange-500/20 text-amber-500",
  },
  {
    category: "Strategy & Ideation",
    title: "System security audit checklist",
    description: "Threat modeling for a cloud SaaS application",
    prompt: "Create a comprehensive threat-modeling checklist for a multi-tenant cloud SaaS app covering auth, API security, data isolation, and audit logging.",
    icon: Lightbulb,
    gradient: "from-emerald-500/20 to-teal-500/20 text-emerald-500",
  },
];

const CAPABILITIES = [
  { icon: Zap, label: "Real-time Flash Streaming" },
  { icon: Brain, label: "Deep Thinking Mode" },
  { icon: Eye, label: "Multimodal Vision" },
  { icon: Mic, label: "Speech Dictation & Audio" },
];

export function ChatEmptyState({ onSelectPrompt }: { onSelectPrompt: (text: string) => void }) {
  const { settings, profile } = useSettings();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const name = profile.displayName ? profile.displayName.split(" ")[0] : "";

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-8 sm:py-12 overflow-hidden">
      {/* Ambient Aurora Glow Background */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] rounded-full blur-3xl opacity-30 dark:opacity-20 animate-ambient-glow"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(168, 85, 247, 0.25) 50%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      {/* Hero Header */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
        <div className="mb-4 transform transition-transform duration-300 hover:scale-105">
          <AetherLogo size={46} showWordmark={false} />
        </div>

        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {getGreeting()}{name ? `, ${name}` : ""}
        </h1>

        <p
          className="mt-2 text-sm sm:text-base leading-relaxed max-w-md font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Where would you like to direct your focus today?
        </p>

        {/* Capability Badges */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {CAPABILITIES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border shadow-2xs transition-all"
              style={{
                borderColor: "var(--border)",
                background: "color-mix(in srgb, var(--surface) 75%, transparent)",
                color: "var(--text-secondary)",
              }}
            >
              <Icon size={12} style={{ color: "var(--accent)" }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Categorized Prompt Cards Grid */}
      {settings.showSuggestedPrompts && (
        <div className="relative z-10 mt-10 w-full max-w-2xl grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PROMPT_CARDS.map(({ category, title, description, prompt, icon: Icon, gradient }) => (
            <button
              key={title}
              onClick={() => onSelectPrompt(prompt)}
              className="group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--accent)]"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shrink-0`}
                >
                  <Icon size={18} />
                </div>
                <ArrowUpRight
                  size={15}
                  className="opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: "var(--accent)" }}
                />
              </div>

              <div className="mt-3">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: "var(--text-muted)" }}
                >
                  {category}
                </span>
                <span
                  className="mt-0.5 text-sm font-semibold block transition-colors group-hover:text-[var(--accent)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {title}
                </span>
                <span
                  className="mt-1 text-xs line-clamp-1 block"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {description}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
