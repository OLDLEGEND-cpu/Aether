import { Sparkles, Lightbulb, Mail, Code2, Rocket } from "lucide-react";
import { AetherLogo } from "../common/AetherLogo";
import { useSettings } from "../../context/SettingsContext";

const SUGGESTIONS = [
  { icon: Sparkles, text: "Explain quantum computing simply" },
  { icon: Lightbulb, text: "Help me plan a project" },
  { icon: Mail, text: "Write a professional email" },
  { icon: Code2, text: "Debug this JavaScript function" },
  { icon: Rocket, text: "Give me ideas for a startup" },
];

export function ChatEmptyState({ onSelectPrompt }: { onSelectPrompt: (text: string) => void }) {
  const { settings } = useSettings();

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 pb-8">
      <AetherLogo size={40} showWordmark={false} />
      <h1 className="mt-5 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
        How can I help you today?
      </h1>
      <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
        Ask anything — Aether is powered by Google Gemini.
      </p>

      {settings.showSuggestedPrompts && (
        <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
          {SUGGESTIONS.map(({ icon: Icon, text }) => (
            <button
              key={text}
              onClick={() => onSelectPrompt(text)}
              className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--code-bg)]"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
            >
              <Icon size={16} style={{ color: "var(--accent)" }} className="shrink-0" />
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
