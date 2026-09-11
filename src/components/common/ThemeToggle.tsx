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
      className="inline-flex items-center gap-0.5 rounded-lg border p-1"
      style={{ borderColor: "var(--border)", background: "var(--code-bg)" }}
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={settings.theme === value}
          onClick={() => updateSettings({ theme: value })}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
          style={{
            background: settings.theme === value ? "var(--surface)" : "transparent",
            color: settings.theme === value ? "var(--text-primary)" : "var(--text-muted)",
            boxShadow: settings.theme === value ? "var(--shadow-sm)" : "none",
          }}
        >
          <Icon size={13} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
