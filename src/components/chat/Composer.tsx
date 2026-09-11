import { useRef, useState, useEffect, type KeyboardEvent, type ClipboardEvent, type DragEvent } from "react";
import { ArrowUp, Square, Paperclip, Mic, MicOff, X } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useSettings } from "../../context/SettingsContext";
import type { ChatAttachment } from "../../types/chat";

interface ComposerProps {
  conversationId?: string;
}

const MAX_CHARS = 12000;

// Type declaration for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

export function Composer({ conversationId }: ComposerProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const { sendUserMessage, isGenerating, stopGeneration } = useChat();
  const { settings } = useSettings();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = "";
        for (let i = 0; i < Object.keys(event.results).length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setValue((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
      };

      recognition.onerror = (_e: SpeechRecognitionErrorEvent) => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setAttachments((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name: file.name,
              type: file.type,
              dataUrl,
              size: file.size,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      handleFiles(imageFiles);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if ((!trimmed && attachments.length === 0) || isGenerating) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const currentAttachments = [...attachments];
    setValue("");
    setAttachments([]);

    await sendUserMessage(trimmed, conversationId, currentAttachments);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && settings.enterToSend) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const nearLimit = value.length > MAX_CHARS * 0.9;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-2 sm:pb-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col gap-1.5 rounded-2xl border px-3.5 py-2.5 transition-all duration-200 focus-within:shadow-md ${
          isDragOver ? "ring-2 ring-[var(--accent)] border-[var(--accent)]" : ""
        }`}
        style={{
          borderColor: "var(--border-strong)",
          background: "var(--surface)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2 pt-1 border-b" style={{ borderColor: "var(--border)" }}>
            {attachments.map((att) => (
              <div
                key={att.id}
                className="group relative flex items-center gap-1.5 rounded-xl border p-1 pr-2"
                style={{ background: "var(--code-bg)", borderColor: "var(--border)" }}
              >
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  className="h-9 w-9 rounded-lg object-cover"
                />
                <span className="max-w-[100px] truncate text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  {att.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Remove image"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            isRecording
              ? "Listening to your voice..."
              : attachments.length > 0
              ? "Ask a question about this image..."
              : "Message Aether… (Paste images or press 🎙️ for voice)"
          }
          aria-label="Message Aether"
          rows={1}
          className="composer-textarea max-h-56 min-h-[26px] w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-[var(--text-muted)]"
          style={{ color: "var(--text-primary)" }}
        />

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--code-bg)]"
              style={{ color: "var(--text-muted)" }}
              title="Attach image (PNG, JPG, WebP)"
              aria-label="Attach image"
            >
              <Paperclip size={17} />
            </button>

            <button
              type="button"
              onClick={toggleRecording}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                isRecording
                  ? "bg-red-500/15 text-red-500 animate-pulse"
                  : "hover:bg-[var(--code-bg)] text-[var(--text-muted)]"
              }`}
              title={isRecording ? "Stop voice dictation" : "Voice dictation"}
              aria-label={isRecording ? "Stop voice dictation" : "Voice dictation"}
            >
              {isRecording ? <MicOff size={17} /> : <Mic size={17} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-mono"
              style={{
                color: nearLimit ? "var(--warning)" : "var(--text-muted)",
                visibility: value.length > 0 ? "visible" : "hidden",
              }}
            >
              {value.length}/{MAX_CHARS}
            </span>

            {isGenerating ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-transform active:scale-95"
                style={{ background: "var(--text-primary)", color: "var(--bg)" }}
                aria-label="Stop generating"
                title="Stop generation"
              >
                <Square size={13} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!value.trim() && attachments.length === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 shadow-sm"
                style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
                aria-label="Send message"
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
        <span>Aether may produce inaccurate info. Verify important facts.</span>
        <span className="hidden sm:inline">Shift + Return for new line</span>
      </div>
    </div>
  );
}
