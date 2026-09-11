import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLORS: Record<ToastVariant, string> = {
  success: "var(--success)",
  error: "var(--error)",
  info: "var(--accent)",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              className="animate-fade-in flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-md"
              style={{
                background: "var(--surface-elevated)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-md)",
                minWidth: "220px",
                maxWidth: "340px",
              }}
            >
              <Icon size={17} style={{ color: COLORS[t.variant] }} className="shrink-0" />
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                {t.message}
              </span>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="ml-auto shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
