import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: "text-white shadow-xs hover:shadow-sm font-semibold",
  secondary: "border shadow-2xs font-semibold hover:border-[var(--border-strong)]",
  ghost: "font-medium hover:bg-[var(--code-bg)]",
  danger: "text-white shadow-xs font-semibold",
};

const sizeStyles: Record<Size, string> = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5 rounded-lg",
  md: "text-xs sm:text-sm px-3.5 py-2 gap-2 rounded-xl",
  lg: "text-sm sm:text-base px-5 py-2.5 gap-2 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className, children, disabled, style, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {};
    if (variant === "primary") {
      baseStyle.backgroundColor = "var(--accent)";
      baseStyle.color = "var(--accent-contrast)";
    } else if (variant === "danger") {
      baseStyle.backgroundColor = "var(--error)";
    } else if (variant === "secondary") {
      baseStyle.backgroundColor = "var(--surface)";
      baseStyle.borderColor = "var(--border)";
      baseStyle.color = "var(--text-primary)";
    } else {
      baseStyle.color = "var(--text-secondary)";
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          "inline-flex items-center justify-center transition-all duration-150 select-none",
          "hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        style={{ ...baseStyle, ...style }}
        {...props}
      >
        {isLoading ? (
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
