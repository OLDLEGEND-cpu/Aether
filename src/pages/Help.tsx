import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { EmptyState } from "../components/common/Surfaces";

const FAQS = [
  {
    q: "How do I get started with Aether?",
    a: "Add your Gemini API key in Settings, then head to the Chat page and start typing. Your first message will automatically create a new conversation.",
  },
  {
    q: "How do I send a message?",
    a: "Type in the composer at the bottom of the chat and press Enter to send (or click the send button). Use Shift+Enter to add a new line without sending.",
  },
  {
    q: "Where is my chat history stored?",
    a: "All conversations are saved locally in your browser's storage. Aether does not have a backend server, so nothing leaves your device except the messages sent directly to Gemini's API.",
  },
  {
    q: "What is the Prompt Library?",
    a: "A curated collection of ready-to-use prompts across categories like writing, coding, and research. You can search, filter by category, and save your favorites.",
  },
  {
    q: "How do I set up the Gemini API?",
    a: "Go to Settings → Gemini API and paste your API key. You can get a key from Google AI Studio. The key is stored only in your browser's local storage.",
  },
  {
    q: "Why am I seeing an API error?",
    a: "Common causes are a missing or invalid API key, a network issue, or hitting Gemini's rate limits. Each error message in Aether includes guidance on how to resolve it.",
  },
  {
    q: "What happens if I clear my browser data?",
    a: "Clearing your browser's local storage will remove your Aether conversations, settings, and saved prompts permanently.",
  },
  {
    q: "How do I clear my conversations?",
    a: "Go to Settings → Privacy and choose 'Clear all conversations' or 'Clear all local data' for a full reset.",
  },
  {
    q: "Does Aether support dark mode?",
    a: "Yes. Go to Settings → Appearance and choose Light, Dark, or System to match your device automatically.",
  },
  {
    q: "Are there keyboard shortcuts?",
    a: "Enter sends a message, Shift+Enter adds a new line, and Escape closes open dialogs. More shortcuts may be added over time.",
  },
];

export default function Help() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return FAQS;
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Help &amp; FAQ
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Search for answers or browse common questions below.
        </p>

        <div
          className="mt-6 flex items-center gap-2 rounded-lg border px-3.5 py-2.5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <Search size={16} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles…"
            aria-label="Search help articles"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        <div className="mt-6">
          {filtered.length === 0 ? (
            <EmptyState icon={<Search size={20} />} title="No results" description="Try a different search term." />
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
              {filtered.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {f.q}
                    <span className="ml-3 shrink-0 text-xs transition-transform group-open:rotate-180" style={{ color: "var(--text-muted)" }}>
                      ▾
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
