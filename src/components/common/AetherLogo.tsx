interface AetherLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function AetherLogo({ size = 28, showWordmark = true, className = "" }: AetherLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="9" fill="var(--accent)" />
        <path
          d="M16 7L23 23H19.2L17.6 19H14.4L12.8 23H9L16 7Z"
          fill="var(--accent-contrast)"
        />
        <path
          d="M16 12.5L17.2 16H14.8L16 12.5Z"
          fill="var(--accent-contrast)"
        />
      </svg>
      {showWordmark && (
        <span className="text-[17px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Aether
        </span>
      )}
    </div>
  );
}
