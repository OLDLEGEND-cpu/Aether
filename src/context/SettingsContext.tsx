import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AetherSettings, LocalProfile } from "../types/settings";
import { storage } from "../services/storage";

interface SettingsContextValue {
  settings: AetherSettings;
  updateSettings: (patch: Partial<AetherSettings>) => void;
  profile: LocalProfile;
  updateProfile: (patch: Partial<LocalProfile>) => void;
  resolvedTheme: "light" | "dark";
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeClass(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AetherSettings>(() => storage.getSettings());
  const [profile, setProfile] = useState<LocalProfile>(() => storage.getProfile());
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme());

  const resolvedTheme: "light" | "dark" =
    settings.theme === "system" ? systemTheme : settings.theme;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storage.saveProfile(profile);
  }, [profile]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
      profile,
      updateProfile: (patch) => setProfile((prev) => ({ ...prev, ...patch })),
      resolvedTheme,
    }),
    [settings, profile, resolvedTheme]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
