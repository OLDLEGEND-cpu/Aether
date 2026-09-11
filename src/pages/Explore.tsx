import { useNavigate } from "react-router-dom";
import { PenLine, Code2, GraduationCap, Lightbulb, ListChecks, Search, CalendarClock, Palette } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/common/Surfaces";
import { PROMPT_LIBRARY } from "../utils/promptData";
import { useChat } from "../context/ChatContext";
import type { PromptCategory } from "../types/prompt";

const CATEGORY_META: Record<PromptCategory, { icon: typeof PenLine; description: string }> = {
  Writing: { icon: PenLine, description: "Emails, essays, and polished prose." },
  Coding: { icon: Code2, description: "Debugging, reviews, and building." },
  Learning: { icon: GraduationCap, description: "Explanations and study plans." },
  Brainstorming: { icon: Lightbulb, description: "Fresh ideas and new angles." },
  Productivity: { icon: ListChecks, description: "Systems to stay organized." },
  Research: { icon: Search, description: "Summaries and comparisons." },
  Planning: { icon: CalendarClock, description: "Timelines and roadmaps." },
  "Creative Work": { icon: Palette, description: "Stories, concepts, and art direction." },
};

export default function Explore() {
  const navigate = useNavigate();
  const { sendUserMessage } = useChat();

  const handleUsePrompt = (prompt: string) => {
    navigate("/chat");
    setTimeout(() => sendUserMessage(prompt), 50);
  };

  const categories = Object.keys(CATEGORY_META) as PromptCategory[];

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Explore
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Discover what Aether can help you with, organized by task.
          </p>

          <div className="mt-8 flex flex-col gap-10">
            {categories.map((category) => {
              const { icon: Icon, description } = CATEGORY_META[category];
              const prompts = PROMPT_LIBRARY.filter((p) => p.category === category);
              return (
                <section key={category} aria-labelledby={`cat-${category}`}>
                  <div className="mb-3 flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: "var(--code-bg)", color: "var(--accent)" }}
                    >
                      <Icon size={15} />
                    </div>
                    <div>
                      <h2 id={`cat-${category}`} className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                        {category}
                      </h2>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {description}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {prompts.map((p) => (
                      <Card key={p.id} className="flex flex-col justify-between transition-shadow hover:shadow-md">
                        <div>
                          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {p.title}
                          </h3>
                          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                            {p.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleUsePrompt(p.prompt)}
                          className="mt-3 self-start text-xs font-medium hover:opacity-80"
                          style={{ color: "var(--accent)" }}
                        >
                          Try this prompt →
                        </button>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
