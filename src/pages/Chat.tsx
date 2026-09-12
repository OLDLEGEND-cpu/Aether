import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  KeyRound,
  WifiOff,
  ShieldAlert,
  Clock,
  Download,
  Cloud,
  CloudOff,
  Plus,
  ArrowDown,
  FileText,
  FileCode,
  FileSpreadsheet,
} from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { ChatEmptyState } from "../components/chat/ChatEmptyState";
import { MessageBubble } from "../components/chat/MessageBubble";
import { Composer } from "../components/chat/Composer";
import { ModelSelector } from "../components/chat/ModelSelector";
import { AuthModal } from "../components/auth/AuthModal";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { hasApiKey } from "../services/gemini";
import { Button } from "../components/common/Button";

const ERROR_ICONS: Record<string, typeof AlertCircle> = {
  missing_key: KeyRound,
  invalid_key: KeyRound,
  network: WifiOff,
  rate_limit: Clock,
  safety: ShieldAlert,
  empty_response: AlertCircle,
  unknown: AlertCircle,
};

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const {
    activeConversation,
    conversations,
    currentModel,
    setCurrentModel,
    setActiveId,
    createConversation,
    sendUserMessage,
    lastError,
    clearError,
    exportConversation,
  } = useChat();

  const { user, isCloudConfigured } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  useEffect(() => {
    if (conversationId) {
      const exists = conversations.some((c) => c.id === conversationId);
      if (exists) {
        setActiveId(conversationId);
      } else {
        navigate("/chat", { replace: true });
      }
    } else {
      setActiveId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (!userScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages, userScrolledUp]);

  useEffect(() => {
    setUserScrolledUp(false);
  }, [activeConversation?.id]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setUserScrolledUp(distanceFromBottom > 120);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setUserScrolledUp(false);
  };

  const handleSelectPrompt = (text: string) => {
    sendUserMessage(text);
  };

  const handleNewChat = () => {
    const id = createConversation();
    navigate(`/chat/${id}`);
  };

  const messages = activeConversation?.messages ?? [];
  const keyMissing = !hasApiKey();

  return (
    <AppShell>
      <div className="relative flex h-full flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header
          className="glass-panel sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b px-4 transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <ModelSelector
              currentModel={activeConversation?.model || currentModel}
              onSelectModel={(m) => setCurrentModel(m)}
            />
            {activeConversation && (
              <div className="hidden md:flex items-center gap-2 min-w-0">
                <span className="text-zinc-400 dark:text-zinc-600">/</span>
                <span
                  className="truncate text-xs font-semibold max-w-[200px] sm:max-w-[280px]"
                  style={{ color: "var(--text-secondary)" }}
                  title={activeConversation.title}
                >
                  {activeConversation.title}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Supabase Cloud Status Pill */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all hover:bg-[var(--code-bg)] shadow-2xs active:scale-95"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              title={user ? `Signed in as ${user.email} (Supabase Cloud)` : "Supabase Cloud Sync - Click to manage"}
            >
              {user ? (
                <>
                  <div className="relative flex items-center">
                    <Cloud size={14} className="text-emerald-500" />
                    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="hidden sm:inline">Synced</span>
                </>
              ) : (
                <>
                  <CloudOff size={14} style={{ color: "var(--text-muted)" }} />
                  <span className="hidden sm:inline">{isCloudConfigured ? "Local / Sync" : "Local"}</span>
                </>
              )}
            </button>

            {/* Export Menu */}
            {activeConversation && activeConversation.messages.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExportMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1 rounded-xl border p-2 text-xs font-medium transition-all hover:bg-[var(--code-bg)] active:scale-95 shadow-2xs"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  title="Export conversation"
                  aria-label="Export conversation"
                >
                  <Download size={14} />
                </button>

                {exportMenuOpen && (
                  <div
                    className="animate-fade-in absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-2xl border p-1.5 shadow-xl backdrop-blur-xl"
                    style={{ background: "var(--surface-elevated)", borderColor: "var(--border-strong)" }}
                  >
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      Export Chat
                    </div>
                    <button
                      onClick={() => {
                        exportConversation(activeConversation.id, "markdown");
                        setExportMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold hover:bg-[var(--code-bg)] transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <FileText size={13} style={{ color: "var(--accent)" }} />
                      Markdown (.md)
                    </button>
                    <button
                      onClick={() => {
                        exportConversation(activeConversation.id, "json");
                        setExportMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold hover:bg-[var(--code-bg)] transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <FileCode size={13} style={{ color: "var(--accent)" }} />
                      JSON (.json)
                    </button>
                    <button
                      onClick={() => {
                        exportConversation(activeConversation.id, "text");
                        setExportMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold hover:bg-[var(--code-bg)] transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <FileSpreadsheet size={13} style={{ color: "var(--accent)" }} />
                      Plain Text (.txt)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick New Chat Button */}
            <button
              type="button"
              onClick={handleNewChat}
              className="flex items-center gap-1 rounded-xl border p-2 text-xs font-medium transition-all hover:bg-[var(--code-bg)] active:scale-95 shadow-2xs"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              title="Start new conversation"
              aria-label="Start new conversation"
            >
              <Plus size={14} />
            </button>
          </div>
        </header>

        {keyMissing && (
          <div
            className="flex items-center justify-center gap-2 border-b px-4 py-2 text-center text-xs sm:text-sm font-medium"
            style={{
              borderColor: "var(--border)",
              background: "color-mix(in srgb, var(--warning) 12%, var(--surface))",
              color: "var(--text-secondary)",
            }}
          >
            <KeyRound size={14} style={{ color: "var(--warning)" }} className="shrink-0" />
            No Gemini API key configured.
            <button
              onClick={() => navigate("/settings")}
              className="font-bold underline text-indigo-500 hover:text-indigo-600"
            >
              Configure in Settings
            </button>
          </div>
        )}

        {/* Message Stream Scroll Area */}
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto relative">
          {messages.length === 0 ? (
            <ChatEmptyState onSelectPrompt={handleSelectPrompt} />
          ) : (
            <div className="flex flex-col gap-6 py-6">
              {messages.map((m, idx) => (
                <MessageBubble key={m.id} message={m} isLast={idx === messages.length - 1} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Floating Scroll to Bottom Button */}
          {userScrolledUp && (
            <div className="sticky bottom-4 flex justify-center pointer-events-none z-30">
              <button
                type="button"
                onClick={scrollToBottom}
                className="pointer-events-auto flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border-strong)",
                  color: "var(--text-primary)",
                }}
              >
                <ArrowDown size={13} style={{ color: "var(--accent)" }} />
                <span>Scroll to latest</span>
              </button>
            </div>
          )}
        </div>

        {lastError && (
          <div className="mx-auto w-full max-w-3xl px-4 pb-1">
            <ErrorBanner
              kind={lastError.kind}
              message={lastError.message}
              onDismiss={clearError}
              onGoToSettings={() => navigate("/settings")}
            />
          </div>
        )}

        {/* Composer */}
        <Composer conversationId={activeConversation?.id} />

        {/* Supabase Auth Modal */}
        <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    </AppShell>
  );
}

function ErrorBanner({
  kind,
  message,
  onDismiss,
  onGoToSettings,
}: {
  kind: string;
  message: string;
  onDismiss: () => void;
  onGoToSettings: () => void;
}) {
  const Icon = ERROR_ICONS[kind] ?? AlertCircle;
  const showSettingsAction = kind === "missing_key" || kind === "invalid_key";

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xs"
      style={{
        borderColor: "color-mix(in srgb, var(--error) 30%, var(--border))",
        background: "color-mix(in srgb, var(--error) 6%, var(--surface))",
      }}
    >
      <Icon size={16} style={{ color: "var(--error)" }} className="shrink-0" />
      <p className="flex-1 text-xs sm:text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        {message}
      </p>
      {showSettingsAction && (
        <Button variant="secondary" size="sm" onClick={onGoToSettings}>
          Check API Configuration
        </Button>
      )}
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="text-xs font-semibold"
        style={{ color: "var(--text-muted)" }}
      >
        Dismiss
      </button>
    </div>
  );
}
