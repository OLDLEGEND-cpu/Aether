import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { AetherLogo } from "../common/AetherLogo";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className="glass-panel flex items-center justify-between border-b px-4 py-2.5 lg:hidden z-20"
        >
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-xl border transition-colors hover:bg-[var(--code-bg)]"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <Menu size={18} />
            </button>
            <AetherLogo size={24} showBadge={false} />
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
