import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Check,
  Copy,
  Pencil,
  RefreshCw,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
  Brain,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { ChatMessage } from "../../types/chat";
import { CodeBlock } from "./CodeBlock";
import { AetherLogo } from "../common/AetherLogo";
import { useToast } from "../../context/ToastContext";
import { useChat } from "../../context/ChatContext";

interface MessageBubbleProps {
  message: ChatMessage;
  isLast: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const { showToast } = useToast();
  const { regenerateLast, editAndResend, isGenerating } = useChat();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isThoughtsOpen, setIsThoughtsOpen] = useState(false);

  const isUser = message.role === "user";

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (isPlayingSpeech) {
        window.speechSynthesis?.cancel();
      }
    };
  }, [isPlayingSpeech]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      showToast("Copied to clipboard", "success");
    } catch {
      showToast("Couldn't copy to clipboard", "error");
    }
  };

  const handleSaveEdit = async () => {
    setIsEditing(false);
    if (draft.trim() && draft.trim() !== message.content) {
      await editAndResend(message.id, draft);
    }
  };

  const handleToggleSpeech = () => {
    if (!("speechSynthesis" in window)) {
      showToast("Text-to-speech not supported in this browser", "error");
      return;
    }

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
    } else {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const plainText = message.content
        .replace(/```[\s\S]*?```/g, "code block omitted.")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/[*_#>[\]()]/g, "");

      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.onend = () => setIsPlayingSpeech(false);
      utterance.onerror = () => setIsPlayingSpeech(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingSpeech(true);
    }
  };

  if (message.status === "error") {
    return (
      <div className="animate-fade-in mx-auto w-full max-w-3xl px-3 sm:px-4">
        <div
          className="flex items-start gap-3.5 rounded-2xl border p-4 shadow-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--error) 35%, var(--border))",
            background: "color-mix(in srgb, var(--error) 6%, var(--surface))",
          }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "color-mix(in srgb, var(--error) 15%, transparent)" }}
          >
            <AlertTriangle size={18} style={{ color: "var(--error)" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Unable to generate response
            </p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {message.errorMessage || "Something went wrong communicating with the AI service."}
            </p>
            {isLast && (
              <button
                onClick={() => regenerateLast()}
                disabled={isGenerating}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all hover:opacity-85 active:scale-95 disabled:opacity-40"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--accent)" }}
              >
                <RefreshCw size={12} className={isGenerating ? "animate-spin" : ""} />
                Retry request
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`animate-fade-in group mx-auto w-full max-w-3xl px-3 sm:px-4 ${
        isUser ? "flex justify-end" : ""
      }`}
    >
      <div className={isUser ? "max-w-[90%] sm:max-w-[80%]" : "w-full"}>
        {/* Assistant Header Avatar and Name */}
        {!isUser && (
          <div className="mb-2 flex items-center gap-2 select-none">
            <AetherLogo size={20} showWordmark={false} />
            <span className="text-xs font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Aether
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.2 text-[10px] font-medium"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
              }}
            >
              <Sparkles size={10} /> AI
            </span>
          </div>
        )}

        {isEditing ? (
          <div
            className="rounded-2xl border p-4 shadow-sm"
            style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="composer-textarea w-full resize-none bg-transparent text-sm leading-relaxed outline-none"
              style={{ color: "var(--text-primary)" }}
              rows={3}
              autoFocus
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setDraft(message.content);
                }}
                className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--code-bg)]"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                <X size={12} /> Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-transform active:scale-95"
                style={{ background: "var(--accent)" }}
              >
                Save &amp; Resubmit
              </button>
            </div>
          </div>
        ) : (
          <div
            className={
              isUser
                ? "rounded-2xl rounded-tr-xs px-4 py-3 shadow-md"
                : "px-0 py-1"
            }
            style={
              isUser
                ? {
                    background: "var(--accent)",
                    color: "var(--accent-contrast)",
                  }
                : undefined
            }
          >
            {/* User uploaded attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {message.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="overflow-hidden rounded-xl border shadow-xs"
                    style={{ borderColor: isUser ? "rgba(255,255,255,0.25)" : "var(--border)" }}
                  >
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="max-h-60 max-w-full rounded-xl object-contain sm:max-h-72"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Thinking Process Accordion for Reasoning Models */}
            {message.thoughtProcess && (
              <div
                className="mb-3.5 overflow-hidden rounded-xl border text-xs shadow-2xs transition-all"
                style={{
                  borderColor: "var(--border-strong)",
                  background: "var(--surface)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsThoughtsOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between px-3.5 py-2.5 text-left font-semibold transition-colors hover:bg-[var(--code-bg)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <div className="flex items-center gap-2">
                    <Brain size={15} className="text-purple-500" />
                    <span>Thought Process</span>
                    <span
                      className="rounded px-1.5 py-0.2 text-[10px] font-mono font-normal"
                      style={{ background: "var(--code-bg)", color: "var(--text-muted)" }}
                    >
                      trace
                    </span>
                  </div>
                  {isThoughtsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isThoughtsOpen && (
                  <div
                    className="border-t px-4 py-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                      background: "var(--code-bg)",
                    }}
                  >
                    {message.thoughtProcess}
                  </div>
                )}
              </div>
            )}

            {isUser ? (
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed font-normal">{message.content}</p>
            ) : message.status === "streaming" && !message.content ? (
              <div className="flex items-center gap-1.5 px-1 py-3" aria-label="Aether is generating">
                <span
                  className="typing-dot h-2.5 w-2.5 rounded-full"
                  style={{ background: "var(--accent)", animationDelay: "0ms" }}
                />
                <span
                  className="typing-dot h-2.5 w-2.5 rounded-full"
                  style={{ background: "var(--accent)", animationDelay: "180ms" }}
                />
                <span
                  className="typing-dot h-2.5 w-2.5 rounded-full"
                  style={{ background: "var(--accent)", animationDelay: "360ms" }}
                />
              </div>
            ) : (
              <div className="prose-aether relative">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                      return <CodeBlock className={className}>{children}</CodeBlock>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>

                {/* Real-time Streaming Blinking Cursor */}
                {message.status === "streaming" && (
                  <span
                    className="inline-block h-4 w-1.5 translate-y-0.5 ml-1 animate-pulse rounded-xs shadow-xs"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Message Action Footer Toolbar */}
        {!isEditing && (message.content || (message.attachments && message.attachments.length > 0)) && (
          <div
            className={`mt-2 flex items-center gap-1 transition-opacity duration-150 ${
              isUser
                ? "justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                : "justify-start opacity-60 group-hover:opacity-100 focus-within:opacity-100"
            }`}
          >
            {isUser ? (
              <div className="flex items-center gap-1">
                <CopyButton onCopy={handleCopy} />
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors hover:bg-[var(--code-bg)] hover:text-[var(--text-primary)]"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Edit message"
                >
                  <Pencil size={12} /> Edit
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-xl p-0.5" style={{ background: "transparent" }}>
                <CopyButton onCopy={handleCopy} />

                {message.content && (
                  <button
                    onClick={handleToggleSpeech}
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                      isPlayingSpeech ? "text-[var(--accent)] font-semibold bg-[var(--accent-subtle)]" : "text-[var(--text-muted)] hover:bg-[var(--code-bg)] hover:text-[var(--text-primary)]"
                    }`}
                    aria-label={isPlayingSpeech ? "Stop reading aloud" : "Read aloud"}
                    title={isPlayingSpeech ? "Stop reading aloud" : "Read aloud"}
                  >
                    {isPlayingSpeech ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    <span className="hidden sm:inline">{isPlayingSpeech ? "Stop" : "Read Aloud"}</span>
                  </button>
                )}

                {isLast && (
                  <button
                    onClick={() => regenerateLast()}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors hover:bg-[var(--code-bg)] hover:text-[var(--text-primary)] disabled:opacity-40"
                    style={{ color: "var(--text-muted)" }}
                    aria-label="Regenerate response"
                  >
                    <RefreshCw size={12} className={isGenerating ? "animate-spin" : ""} />
                    <span className="hidden sm:inline">Regenerate</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CopyButton({ onCopy }: { onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        onCopy();
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors hover:bg-[var(--code-bg)] hover:text-[var(--text-primary)]"
      style={{ color: "var(--text-muted)" }}
      aria-label="Copy response"
    >
      {copied ? (
        <>
          <Check size={12} className="text-emerald-500" />
          <span className="hidden sm:inline text-emerald-500 font-medium">Copied</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          <span className="hidden sm:inline">Copy</span>
        </>
      )}
    </button>
  );
}
