import { NavLink } from "react-router-dom";
import { AetherLogo } from "../common/AetherLogo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { to: "/chat", label: "AI Chat" },
      { to: "/explore", label: "Explore" },
      { to: "/prompts", label: "Prompt Library" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Aether" },
      { to: "/help", label: "Help & FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <AetherLogo size={24} />
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
              A calm, premium AI assistant powered by Gemini.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {col.title}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <NavLink to={l.to} className="text-sm hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <p>© {new Date().getFullYear()} Aether Labs. All rights reserved.</p>
          <p>100 Innovation Avenue, San Francisco, CA 94105 · hello@aetherlabs.example</p>
        </div>
      </div>
    </footer>
  );
}
