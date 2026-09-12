import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AetherLogo } from "../common/AetherLogo";
import { Button } from "../common/Button";
import { ThemeToggle } from "../common/ThemeToggle";

const LINKS = [
  { to: "/about", label: "About" },
  { to: "/explore", label: "Explore" },
  { to: "/prompts", label: "Prompts" },
  { to: "/help", label: "Help" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header
      className="glass-panel sticky top-0 z-50 border-b backdrop-blur-xl transition-all"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" aria-label="Aether home" className="outline-none">
          <AetherLogo size={28} showBadge={true} />
        </NavLink>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className="text-xs font-semibold tracking-wide transition-colors hover:text-[var(--accent)]"
              style={({ isActive }) => ({ color: isActive ? "var(--text-primary)" : "var(--text-secondary)" })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button variant="primary" size="md" onClick={() => navigate("/chat")}>
            Launch App
          </Button>
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl border md:hidden transition-colors hover:bg-[var(--code-bg)]"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div
          className="border-t px-4 py-3 md:hidden space-y-3"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--code-bg)]"
                style={{ color: "var(--text-secondary)" }}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Theme</span>
            <ThemeToggle />
          </div>
          <Button variant="primary" size="md" className="w-full" onClick={() => navigate("/chat")}>
            Launch App
          </Button>
        </div>
      )}
    </header>
  );
}
