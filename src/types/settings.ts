export type ThemeMode = "light" | "dark" | "system";

export interface AetherSettings {
  theme: ThemeMode;
  enterToSend: boolean;
  showSuggestedPrompts: boolean;
  language: string;
  defaultModel: string;
  systemInstruction: string;
  temperature: number;
  autoSpeech: boolean;
  streamResponse: boolean;
}

export interface LocalProfile {
  displayName: string;
  initials: string;
  email?: string;
  avatarUrl?: string;
}

export const DEFAULT_SETTINGS: AetherSettings = {
  theme: "system",
  enterToSend: true,
  showSuggestedPrompts: true,
  language: "en",
  defaultModel: "gemini-3.6-flash",
  systemInstruction:
    "You are Aether, an intelligent, calm, and sophisticated AI assistant. Deliver clear, accurate, and insightful responses. Use clean GitHub-flavored Markdown with code blocks, tables, and lists where appropriate.",
  temperature: 0.7,
  autoSpeech: false,
  streamResponse: true,
};

export const DEFAULT_PROFILE: LocalProfile = {
  displayName: "Guest User",
  initials: "GU",
};
