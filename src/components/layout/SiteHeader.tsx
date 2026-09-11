import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AetherLogo } from "../common/AetherLogo";
import { Button } from "../common/Button";

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
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--surface) 85%, transparent)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <NavLink to="/" aria-label="Aether home">
          <AetherLogo />
        </NavLink>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={({ isActive }) => ({ color: isActive ? "var(--text-primary)" : "var(--text-secondary)" })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="primary" size="md" onClick={() => navigate("/chat")}>
            Start Chatting
          </Button>
        </div>

        <button
          className="rounded-lg p-1.5 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div
          className="border-t px-4 py-3 md:hidden"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {l.label}
              </NavLink>
            ))}
            <Button variant="primary" size="md" className="mt-2 w-full" onClick={() => navigate("/chat")}>
              Start Chatting
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
