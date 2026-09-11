import type { Conversation } from "../types/chat";
import type { PromptItem } from "../types/prompt";
import type { AetherSettings, LocalProfile } from "../types/settings";
import { DEFAULT_SETTINGS, DEFAULT_PROFILE } from "../types/settings";

/**
 * Storage abstraction. Everything funnels through this module so the
 * persistence layer (currently localStorage + Supabase sync) can be
 * swapped without touching UI code.
 */

const KEYS = {
  conversations: "aether:conversations",
  settings: "aether:settings",
  profile: "aether:profile",
  savedPrompts: "aether:saved-prompts",
  firstRun: "aether:first-run-complete",
  apiKey: "aether:gemini-api-key",
  activeModel: "aether:active-model",
} as const;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — fail silently, app remains usable.
  }
}

export const storage = {
  getConversations(): Conversation[] {
    return safeGet<Conversation[]>(KEYS.conversations, []);
  },
  saveConversations(conversations: Conversation[]): void {
    safeSet(KEYS.conversations, conversations);
  },

  getSettings(): AetherSettings {
    return { ...DEFAULT_SETTINGS, ...safeGet<Partial<AetherSettings>>(KEYS.settings, {}) };
  },
  saveSettings(settings: AetherSettings): void {
    safeSet(KEYS.settings, settings);
  },

  getProfile(): LocalProfile {
    return { ...DEFAULT_PROFILE, ...safeGet<Partial<LocalProfile>>(KEYS.profile, {}) };
  },
  saveProfile(profile: LocalProfile): void {
    safeSet(KEYS.profile, profile);
  },

  getSavedPromptIds(): string[] {
    return safeGet<string[]>(KEYS.savedPrompts, []);
  },
  saveSavedPromptIds(ids: string[]): void {
    safeSet(KEYS.savedPrompts, ids);
  },

  getFirstRunComplete(): boolean {
    return safeGet<boolean>(KEYS.firstRun, false);
  },
  setFirstRunComplete(): void {
    safeSet(KEYS.firstRun, true);
  },

  getApiKey(): string {
    try {
      return localStorage.getItem(KEYS.apiKey) ?? "";
    } catch {
      return "";
    }
  },
  saveApiKey(key: string): void {
    try {
      if (key) localStorage.setItem(KEYS.apiKey, key);
      else localStorage.removeItem(KEYS.apiKey);
    } catch {
      // ignore
    }
  },

  getActiveModel(): string {
    try {
      return localStorage.getItem(KEYS.activeModel) || DEFAULT_SETTINGS.defaultModel;
    } catch {
      return DEFAULT_SETTINGS.defaultModel;
    }
  },
  saveActiveModel(model: string): void {
    try {
      localStorage.setItem(KEYS.activeModel, model);
    } catch {
      // ignore
    }
  },

  clearConversations(): void {
    safeSet(KEYS.conversations, []);
  },
  clearAll(): void {
    try {
      Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  },
};

export interface StoredCustomPrompt extends PromptItem {
  custom: true;
}
