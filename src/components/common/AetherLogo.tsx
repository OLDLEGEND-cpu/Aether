interface AetherLogoProps {
  size?: number;
  showWordmark?: boolean;
  showBadge?: boolean;
  className?: string;
}

export function AetherLogo({
  size = 28,
  showWordmark = true,
  showBadge = false,
  className = "",
}: AetherLogoProps) {
  return (
    <div className={`group flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center shrink-0">
        {/* Ambient Glow Halo */}
        <div
          className="absolute -inset-1 rounded-full opacity-40 blur-md transition-opacity duration-300 group-hover:opacity-75"
          style={{ background: "var(--accent-gradient)" }}
          aria-hidden="true"
        />

        {/* Logo Mark SVG */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative transform transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="aetherGrad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="aetherCore" x1="12" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#c7d2fe" />
            </linearGradient>
            <filter id="coreGlow" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Rounded Container with subtle border */}
          <rect
            width="36"
            height="36"
            rx="11"
            fill="url(#aetherGrad)"
            className="shadow-sm"
          />

          {/* Ethereal Orbital Ring 1 */}
          <ellipse
            cx="18"
            cy="18"
            rx="11"
            ry="4.5"
            transform="rotate(-30 18 18)"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.25"
            strokeDasharray="1.5 2.5"
          />

          {/* Ethereal Orbital Ring 2 */}
          <ellipse
            cx="18"
            cy="18"
            rx="11"
            ry="4.5"
            transform="rotate(40 18 18)"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="1.25"
          />

          {/* Celestial Central Starburst Core */}
          <path
            d="M18 10.5C18 14.5 14.5 18 10.5 18C14.5 18 18 21.5 18 25.5C18 21.5 21.5 18 25.5 18C21.5 18 18 14.5 18 10.5Z"
            fill="url(#aetherCore)"
            filter="url(#coreGlow)"
          />

          {/* Satellite Sparkles */}
          <circle cx="26" cy="11" r="1.25" fill="#ffffff" />
          <circle cx="10" cy="25" r="1" fill="#ffffff" opacity="0.8" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex items-center gap-1.5">
          <span
            className="text-[17px] font-bold tracking-tight transition-colors group-hover:text-[var(--accent)]"
            style={{ color: "var(--text-primary)" }}
          >
            Aether
          </span>
          {showBadge && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase"
              style={{
                background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                color: "var(--accent)",
                border: "1px solid var(--border)",
              }}
            >
              2.5 Pro
            </span>
          )}
        </div>
      )}
    </div>
  );
}
