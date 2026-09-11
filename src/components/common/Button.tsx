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
  primary: "text-white shadow-sm",
  secondary: "border",
  ghost: "",
  danger: "text-white shadow-sm",
};

const sizeStyles: Record<Size, string> = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5",
  md: "text-sm px-3.5 py-2 gap-2",
  lg: "text-[15px] px-5 py-2.5 gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className, children, disabled, style, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {};
    if (variant === "primary") {
      baseStyle.backgroundColor = "var(--accent)";
    } else if (variant === "danger") {
      baseStyle.backgroundColor = "var(--error)";
    } else if (variant === "secondary") {
      baseStyle.backgroundColor = "var(--surface)";
      baseStyle.borderColor = "var(--border-strong)";
      baseStyle.color = "var(--text-primary)";
    } else {
      baseStyle.color = "var(--text-secondary)";
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150",
          "hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
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
