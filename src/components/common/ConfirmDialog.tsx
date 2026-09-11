import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4"
      style={{ background: "rgba(10,10,12,0.45)" }}
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in w-full max-w-sm rounded-xl border p-5"
        style={{ background: "var(--surface-elevated)", borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}
      >
        <h2 id="confirm-dialog-title" className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
