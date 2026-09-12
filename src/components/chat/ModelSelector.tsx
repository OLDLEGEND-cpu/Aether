import { useState, useRef, useEffect } from "react";
import { ChevronDown, Sparkles, Zap, Brain, Check } from "lucide-react";
import { AVAILABLE_MODELS, type ModelOption } from "../../types/chat";

interface ModelSelectorProps {
  currentModel: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
}

const MODEL_ICONS: Record<string, typeof Sparkles> = {
  "gemini-3.6-flash": Zap,
  "gemini-3.8-flash": Sparkles,
  "gemini-3.1-pro-preview": Brain,
  "gemini-flash-latest": Zap,
  "gemini-pro-latest": Sparkles,
};

export function ModelSelector({ currentModel, onSelectModel, disabled }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModelObj =
    AVAILABLE_MODELS.find((m) => m.id === currentModel) || AVAILABLE_MODELS[0];

  const IconComponent = MODEL_ICONS[selectedModelObj.id] || Sparkles;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="group flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-xs active:scale-95 disabled:opacity-50"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
          color: "var(--text-primary)",
        }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div
          className="flex h-5 w-5 items-center justify-center rounded-md"
          style={{
            background: selectedModelObj.isThinking
              ? "rgba(168, 85, 247, 0.15)"
              : selectedModelObj.badge === "Pro"
              ? "rgba(59, 130, 246, 0.15)"
              : "var(--accent-subtle)",
          }}
        >
          <IconComponent
            size={13}
            className="shrink-0"
            style={{
              color: selectedModelObj.isThinking
                ? "#a855f7"
                : selectedModelObj.badge === "Pro"
                ? "#3b82f6"
                : "var(--accent)",
            }}
          />
        </div>

        <span className="font-semibold">{selectedModelObj.name}</span>

        {selectedModelObj.badge && (
          <span
            className="rounded px-1.5 py-0.2 text-[9px] font-bold tracking-wider uppercase"
            style={{
              background: "var(--accent-subtle)",
              color: "var(--accent)",
            }}
          >
            {selectedModelObj.badge}
          </span>
        )}

        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
        />
      </button>

      {open && (
        <div
          className="animate-fade-in absolute left-0 z-50 mt-2 w-80 origin-top-left rounded-2xl border p-2 shadow-xl backdrop-blur-xl"
          style={{
            background: "color-mix(in srgb, var(--surface-elevated) 95%, transparent)",
            borderColor: "var(--border-strong)",
            boxShadow: "var(--shadow-lg)",
          }}
          role="menu"
        >
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b mb-1" style={{ borderColor: "var(--border)" }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Model Architecture
            </span>
            <span className="text-[10px] font-mono" style={{ color: "var(--accent)" }}>
              Google Gemini
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {AVAILABLE_MODELS.map((model: ModelOption) => {
              const ItemIcon = MODEL_ICONS[model.id] || Sparkles;
              const isSelected = model.id === currentModel;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all hover:bg-[var(--code-bg)] group"
                  style={{
                    background: isSelected ? "var(--code-bg)" : "transparent",
                    border: isSelected ? "1px solid var(--border-glow)" : "1px solid transparent",
                  }}
                  role="menuitem"
                >
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: model.isThinking
                        ? "rgba(168, 85, 247, 0.15)"
                        : model.badge === "Pro"
                        ? "rgba(59, 130, 246, 0.15)"
                        : "var(--accent-subtle)",
                    }}
                  >
                    <ItemIcon
                      size={15}
                      style={{
                        color: model.isThinking
                          ? "#a855f7"
                          : model.badge === "Pro"
                          ? "#3b82f6"
                          : "var(--accent)",
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                        {model.name}
                      </span>
                      {model.badge && (
                        <span
                          className="rounded px-1.5 py-0.2 text-[9px] font-semibold"
                          style={{
                            background: "var(--accent-subtle)",
                            color: "var(--accent)",
                          }}
                        >
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug" style={{ color: "var(--text-secondary)" }}>
                      {model.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-full" style={{ background: "var(--accent)" }}>
                      <Check size={11} className="text-white shrink-0" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
