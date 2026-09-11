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
        className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all hover:bg-[var(--code-bg)] disabled:opacity-50"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
          color: "var(--text-primary)",
        }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <IconComponent
          size={14}
          className="shrink-0"
          style={{
            color: selectedModelObj.isThinking
              ? "#a855f7"
              : selectedModelObj.badge === "Pro"
              ? "#3b82f6"
              : "var(--accent)",
          }}
        />
        <span>{selectedModelObj.name}</span>
        {selectedModelObj.badge && (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
            style={{
              background: "color-mix(in srgb, var(--accent) 15%, transparent)",
              color: "var(--accent)",
            }}
          >
            {selectedModelObj.badge}
          </span>
        )}
        <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
      </button>

      {open && (
        <div
          className="animate-fade-in absolute left-0 z-50 mt-1.5 w-72 origin-top-left rounded-2xl border p-1.5 shadow-xl"
          style={{
            background: "var(--surface-elevated)",
            borderColor: "var(--border-strong)",
            boxShadow: "var(--shadow-md)",
          }}
          role="menu"
        >
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Select AI Model
          </div>
          <div className="flex flex-col gap-0.5">
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
                  className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-[var(--code-bg)]"
                  style={{
                    background: isSelected ? "var(--code-bg)" : "transparent",
                  }}
                  role="menuitem"
                >
                  <ItemIcon
                    size={15}
                    className="mt-0.5 shrink-0"
                    style={{
                      color: model.isThinking
                        ? "#a855f7"
                        : model.badge === "Pro"
                        ? "#3b82f6"
                        : "var(--accent)",
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                        {model.name}
                      </span>
                      {model.badge && (
                        <span
                          className="rounded px-1.5 py-0.2 text-[9px] font-medium"
                          style={{
                            background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                            color: "var(--accent)",
                          }}
                        >
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-tight" style={{ color: "var(--text-secondary)" }}>
                      {model.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check size={14} className="shrink-0" style={{ color: "var(--accent)" }} />
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
