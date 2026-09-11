import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ChatMessage, Conversation, GenerationError, ChatAttachment } from "../types/chat";
import { storage } from "../services/storage";
import {
  streamMessage,
  extractThoughts,
  generateTitleFromMessage,
  DEFAULT_GEMINI_MODEL,
} from "../services/gemini";
import {
  syncConversationToCloud,
  deleteRemoteConversation,
  fetchRemoteConversations,
} from "../services/supabase";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ChatContextValue {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeId: string | null;
  isGenerating: boolean;
  currentModel: string;
  lastError: GenerationError | null;
  setCurrentModel: (model: string) => void;
  setActiveId: (id: string | null) => void;
  createConversation: (modelOverride?: string) => string;
  sendUserMessage: (
    text: string,
    conversationIdOverride?: string,
    attachments?: ChatAttachment[]
  ) => Promise<void>;
  regenerateLast: () => Promise<void>;
  editAndResend: (messageId: string, newText: string) => Promise<void>;
  stopGeneration: () => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  togglePin: (id: string) => void;
  clearError: () => void;
  exportConversation: (id: string, format: "markdown" | "json" | "text") => void;
  syncFromCloud: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(() => storage.getConversations());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentModel, setCurrentModelState] = useState<string>(() => storage.getActiveModel());
  const [lastError, setLastError] = useState<GenerationError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync to local storage
  useEffect(() => {
    storage.saveConversations(conversations);
  }, [conversations]);

  const setCurrentModel = useCallback((model: string) => {
    setCurrentModelState(model);
    storage.saveActiveModel(model);
  }, []);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const createConversation = useCallback(
    (modelOverride?: string): string => {
      const id = makeId();
      const now = Date.now();
      const newConv: Conversation = {
        id,
        title: "New conversation",
        createdAt: now,
        updatedAt: now,
        messages: [],
        model: modelOverride || currentModel || DEFAULT_GEMINI_MODEL,
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(id);
      setLastError(null);

      // Async cloud sync
      syncConversationToCloud(newConv);

      return id;
    },
    [currentModel]
  );

  const updateConversation = useCallback(
    (id: string, updater: (c: Conversation) => Conversation) => {
      setConversations((prev) => {
        const next = prev.map((c) => (c.id === id ? updater(c) : c));
        const updatedTarget = next.find((c) => c.id === id);
        if (updatedTarget) {
          // Cloud sync in background
          syncConversationToCloud(updatedTarget);
        }
        return next;
      });
    },
    []
  );

  const runGeneration = useCallback(
    async (
      conversationId: string,
      historyForApi: ChatMessage[],
      assistantMessageId: string,
      modelToUse: string
    ) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsGenerating(true);
      setLastError(null);

      try {
        await streamMessage({
          history: historyForApi,
          model: modelToUse,
          signal: controller.signal,
          onChunk: (accumulated) => {
            const { content, thoughtProcess } = extractThoughts(accumulated);
            updateConversation(conversationId, (c) => ({
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content,
                      thoughtProcess,
                      status: "streaming",
                    }
                  : m
              ),
            }));
          },
        });

        // Mark as complete once stream ends
        updateConversation(conversationId, (c) => ({
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) =>
            m.id === assistantMessageId ? { ...m, status: "complete" } : m
          ),
        }));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          updateConversation(conversationId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, status: "complete", content: m.content || "*Generation stopped.*" }
                : m
            ),
          }));
          return;
        }
        const genErr = err as GenerationError;
        setLastError(genErr);
        updateConversation(conversationId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === assistantMessageId
              ? { ...m, status: "error", errorMessage: genErr.message, content: "" }
              : m
          ),
        }));
      } finally {
        setIsGenerating(false);
        abortRef.current = null;
      }
    },
    [updateConversation]
  );

  const sendUserMessage = useCallback(
    async (text: string, conversationIdOverride?: string, attachments?: ChatAttachment[]) => {
      const trimmed = text.trim();
      const hasAttachments = attachments && attachments.length > 0;
      if (!trimmed && !hasAttachments) return;

      const userMsg: ChatMessage = {
        id: makeId(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
        status: "complete",
        attachments: hasAttachments ? attachments : undefined,
      };

      const assistantMsg: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        status: "streaming",
      };

      let targetId = conversationIdOverride ?? activeId;
      let historyForApi: ChatMessage[] = [];
      let modelForCall = currentModel || DEFAULT_GEMINI_MODEL;

      if (!targetId || !conversations.some((c) => c.id === targetId)) {
        targetId = targetId || makeId();
        const now = Date.now();
        const newConv: Conversation = {
          id: targetId,
          title: generateTitleFromMessage(trimmed || "Image prompt"),
          createdAt: now,
          updatedAt: now,
          messages: [userMsg, assistantMsg],
          model: modelForCall,
        };
        historyForApi = [userMsg];
        setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== targetId)]);
        setActiveId(targetId);
        syncConversationToCloud(newConv);
      } else {
        const existingConv = conversations.find((c) => c.id === targetId);
        const prevMessages = existingConv?.messages.filter((m) => m.status !== "error") ?? [];
        modelForCall = existingConv?.model || currentModel || DEFAULT_GEMINI_MODEL;
        historyForApi = [...prevMessages, userMsg];

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetId) return c;
            const isFirst = c.messages.length === 0;
            return {
              ...c,
              title: isFirst ? generateTitleFromMessage(trimmed || "Image prompt") : c.title,
              updatedAt: Date.now(),
              messages: [...c.messages, userMsg, assistantMsg],
            };
          })
        );
      }

      await runGeneration(targetId, historyForApi, assistantMsg.id, modelForCall);
    },
    [activeId, conversations, currentModel, runGeneration]
  );

  const regenerateLast = useCallback(async () => {
    if (!activeConversation) return;
    const messages = activeConversation.messages;
    const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === "assistant");
    if (lastAssistantIdx === -1) return;
    const idx = messages.length - 1 - lastAssistantIdx;
    const assistantMessageId = messages[idx].id;
    const historyForApi = messages.slice(0, idx).filter((m) => m.status !== "error");
    if (historyForApi.length === 0) return;

    updateConversation(activeConversation.id, (c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.id === assistantMessageId
          ? { ...m, content: "", thoughtProcess: undefined, status: "streaming", errorMessage: undefined }
          : m
      ),
    }));

    await runGeneration(
      activeConversation.id,
      historyForApi,
      assistantMessageId,
      activeConversation.model || currentModel || DEFAULT_GEMINI_MODEL
    );
  }, [activeConversation, currentModel, runGeneration, updateConversation]);

  const editAndResend = useCallback(
    async (messageId: string, newText: string) => {
      if (!activeConversation) return;
      const trimmed = newText.trim();
      if (!trimmed) return;
      const idx = activeConversation.messages.findIndex((m) => m.id === messageId);
      if (idx === -1) return;

      const assistantMsg: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        status: "streaming",
      };

      const editedUserMsg: ChatMessage = {
        ...activeConversation.messages[idx],
        content: trimmed,
        timestamp: Date.now(),
      };

      const truncated = [...activeConversation.messages.slice(0, idx), editedUserMsg, assistantMsg];

      updateConversation(activeConversation.id, (c) => ({
        ...c,
        updatedAt: Date.now(),
        messages: truncated,
      }));

      const historyForApi = truncated.filter((m) => m.id !== assistantMsg.id);
      await runGeneration(
        activeConversation.id,
        historyForApi,
        assistantMsg.id,
        activeConversation.model || currentModel
      );
    },
    [activeConversation, currentModel, runGeneration, updateConversation]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
      deleteRemoteConversation(id);
    },
    [activeId]
  );

  const renameConversation = useCallback(
    (id: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      updateConversation(id, (c) => ({ ...c, title: trimmed, updatedAt: Date.now() }));
    },
    [updateConversation]
  );

  const togglePin = useCallback(
    (id: string) => {
      updateConversation(id, (c) => ({ ...c, pinned: !c.pinned }));
    },
    [updateConversation]
  );

  const clearError = useCallback(() => setLastError(null), []);

  const exportConversation = useCallback(
    (id: string, format: "markdown" | "json" | "text") => {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) return;

      let fileData = "";
      let mimeType = "text/plain";
      let extension = "txt";

      if (format === "markdown") {
        mimeType = "text/markdown";
        extension = "md";
        fileData = `# ${conv.title}\n\n*Created on ${new Date(conv.createdAt).toLocaleString()}*\n*Model: ${conv.model}*\n\n---\n\n`;
        conv.messages.forEach((m) => {
          fileData += `### ${m.role === "user" ? "User" : "Aether"}\n\n${m.content}\n\n`;
        });
      } else if (format === "json") {
        mimeType = "application/json";
        extension = "json";
        fileData = JSON.stringify(conv, null, 2);
      } else {
        fileData = `${conv.title}\n${"=".repeat(conv.title.length)}\n\n`;
        conv.messages.forEach((m) => {
          fileData += `[${m.role.toUpperCase()}]:\n${m.content}\n\n`;
        });
      }

      const blob = new Blob([fileData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${conv.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [conversations]
  );

  const syncFromCloud = useCallback(async () => {
    const remote = await fetchRemoteConversations();
    if (remote && remote.length > 0) {
      setConversations((prev) => {
        const map = new Map<string, Conversation>();
        prev.forEach((c) => map.set(c.id, c));
        remote.forEach((c) => map.set(c.id, c));
        return Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
      });
    }
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      activeConversation,
      activeId,
      isGenerating,
      currentModel,
      lastError,
      setCurrentModel,
      setActiveId,
      createConversation,
      sendUserMessage,
      regenerateLast,
      editAndResend,
      stopGeneration,
      deleteConversation,
      renameConversation,
      togglePin,
      clearError,
      exportConversation,
      syncFromCloud,
    }),
    [
      conversations,
      activeConversation,
      activeId,
      isGenerating,
      currentModel,
      lastError,
      setCurrentModel,
      createConversation,
      sendUserMessage,
      regenerateLast,
      editAndResend,
      stopGeneration,
      deleteConversation,
      renameConversation,
      togglePin,
      clearError,
      exportConversation,
      syncFromCloud,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
