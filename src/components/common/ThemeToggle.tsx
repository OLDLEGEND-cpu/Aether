import { Sun, Moon, Monitor } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import type { ThemeMode } from "../../types/settings";

const OPTIONS: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export function ThemeToggle() {
  const { settings, updateSettings } = useSettings();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-1 rounded-xl border p-1"
      style={{ borderColor: "var(--border)", background: "var(--code-bg)" }}
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const isActive = settings.theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            onClick={() => updateSettings({ theme: value })}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95"
            style={{
              background: isActive ? "var(--surface)" : "transparent",
              color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: isActive ? "var(--shadow-xs)" : "none",
              border: isActive ? "1px solid var(--border)" : "1px solid transparent",
            }}
          >
            <Icon size={13} style={{ color: isActive ? "var(--accent)" : undefined }} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
