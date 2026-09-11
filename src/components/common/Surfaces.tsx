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
      className={clsx("rounded-xl border p-5", className)}
      style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)", ...style }}
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
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--code-bg)", color: "var(--text-muted)" }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton", className)} aria-hidden="true" />;
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "success" | "warning" | "error" }) {
  const colors: Record<string, { bg: string; text: string }> = {
    default: { bg: "var(--code-bg)", text: "var(--text-secondary)" },
    accent: { bg: "var(--accent-50, #eef1ff)", text: "var(--accent)" },
    success: { bg: "color-mix(in srgb, var(--success) 15%, transparent)", text: "var(--success)" },
    warning: { bg: "color-mix(in srgb, var(--warning) 15%, transparent)", text: "var(--warning)" },
    error: { bg: "color-mix(in srgb, var(--error) 15%, transparent)", text: "var(--error)" },
  };
  const c = colors[tone];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      {children}
    </span>
  );
}
