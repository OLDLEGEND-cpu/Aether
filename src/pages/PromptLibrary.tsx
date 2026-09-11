import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bookmark, BookmarkCheck } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Card, EmptyState, Badge } from "../components/common/Surfaces";
import { PROMPT_LIBRARY, CATEGORIES } from "../utils/promptData";
import { useChat } from "../context/ChatContext";
import { useToast } from "../context/ToastContext";
import { storage } from "../services/storage";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { PromptCategory } from "../types/prompt";

export default function PromptLibrary() {
  const navigate = useNavigate();
  const { sendUserMessage } = useChat();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PromptCategory | "All" | "Saved">("All");
  const [savedIds, setSavedIds] = useLocalStorage<string[]>(
    () => storage.getSavedPromptIds(),
    (ids) => storage.saveSavedPromptIds(ids)
  );

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const isSaved = prev.includes(id);
      showToast(isSaved ? "Removed from saved prompts" : "Prompt saved", "success");
      return isSaved ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  const filtered = useMemo(() => {
    let list = PROMPT_LIBRARY;
    if (activeCategory === "Saved") {
      list = list.filter((p) => savedIds.includes(p.id));
    } else if (activeCategory !== "All") {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }, [query, activeCategory, savedIds]);

  const handleUsePrompt = (prompt: string) => {
    navigate("/chat");
    setTimeout(() => sendUserMessage(prompt), 50);
  };

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Prompt Library
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            A curated set of prompts to get you started, or save your favorites.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <div
              className="flex items-center gap-2 rounded-lg border px-3 py-2 sm:max-w-sm"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <Search size={15} style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search prompts…"
                aria-label="Search prompts"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Prompt categories">
              {(["All", "Saved", ...CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    borderColor: activeCategory === cat ? "var(--accent)" : "var(--border)",
                    background: activeCategory === cat ? "var(--accent)" : "var(--surface)",
                    color: activeCategory === cat ? "var(--accent-contrast)" : "var(--text-secondary)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<Bookmark size={20} />}
                title={activeCategory === "Saved" ? "No saved prompts yet" : "No prompts found"}
                description={
                  activeCategory === "Saved"
                    ? "Save prompts you like by clicking the bookmark icon on any prompt card."
                    : "Try a different search term or category."
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => {
                  const isSaved = savedIds.includes(p.id);
                  return (
                    <Card key={p.id} className="flex flex-col justify-between transition-shadow hover:shadow-md">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Badge>{p.category}</Badge>
                          <button
                            onClick={() => toggleSave(p.id)}
                            aria-label={isSaved ? "Remove from saved prompts" : "Save prompt"}
                            aria-pressed={isSaved}
                            className="shrink-0"
                            style={{ color: isSaved ? "var(--accent)" : "var(--text-muted)" }}
                          >
                            {isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                          </button>
                        </div>
                        <h3 className="mt-2.5 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {p.title}
                        </h3>
                        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                          {p.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUsePrompt(p.prompt)}
                        className="mt-4 self-start text-xs font-medium hover:opacity-80"
                        style={{ color: "var(--accent)" }}
                      >
                        Use this prompt →
                      </button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
