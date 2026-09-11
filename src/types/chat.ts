export type MessageRole = "user" | "assistant";

export type MessageStatus = "complete" | "streaming" | "error";

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  dataUrl: string; // base64 data url
  size?: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  status?: MessageStatus;
  errorMessage?: string;
  attachments?: ChatAttachment[];
  thoughtProcess?: string; // For reasoning / thinking models (e.g. Gemini 2.0 Flash Thinking)
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  model: string;
  pinned?: boolean;
  syncedToCloud?: boolean;
}

export interface GenerationError {
  kind:
    | "missing_key"
    | "invalid_key"
    | "network"
    | "rate_limit"
    | "safety"
    | "empty_response"
    | "unknown";
  message: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
  isThinking?: boolean;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    description: "Google's recommended high-speed model with multimodal vision & reasoning",
    badge: "Default",
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    description: "Frontier flash model with advanced coding and multimodal comprehension",
    badge: "Latest",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    description: "Deep reasoning, complex technical problem solving, and analysis",
    badge: "Pro",
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash Latest",
    description: "Always updated to the freshest Gemini Flash version",
    badge: "Fast",
  },
  {
    id: "gemini-pro-latest",
    name: "Gemini Pro Latest",
    description: "Always updated to the freshest Gemini Pro release",
    badge: "Pro",
  },
];
