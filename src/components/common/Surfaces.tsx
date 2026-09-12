import type { ReactNode } from "react";
import clsx from "clsx";

export function Card({
  children,
  className,
  as: Component = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
  style?: React.CSSProperties;
}) {
  return (
    <Component
      className={clsx("rounded-2xl border p-5 shadow-2xs transition-all", className)}
      style={{ background: "var(--surface)", borderColor: "var(--border)", ...style }}
    >
      {children}
    </Component>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-2xs"
        style={{ background: "var(--code-bg)", borderColor: "var(--border)", color: "var(--accent)" }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton", className)} aria-hidden="true" />;
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "success" | "warning" | "error";
}) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    default: { bg: "var(--code-bg)", text: "var(--text-secondary)", border: "var(--border)" },
    accent: { bg: "var(--accent-subtle)", text: "var(--accent)", border: "var(--border-glow)" },
    success: { bg: "color-mix(in srgb, var(--success) 12%, transparent)", text: "var(--success)", border: "color-mix(in srgb, var(--success) 30%, transparent)" },
    warning: { bg: "color-mix(in srgb, var(--warning) 12%, transparent)", text: "var(--warning)", border: "color-mix(in srgb, var(--warning) 30%, transparent)" },
    error: { bg: "color-mix(in srgb, var(--error) 12%, transparent)", text: "var(--error)", border: "color-mix(in srgb, var(--error) 30%, transparent)" },
  };
  const c = colors[tone];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide border shadow-2xs"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {children}
    </span>
  );
}
