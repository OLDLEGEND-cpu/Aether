import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { AetherLogo } from "../common/AetherLogo";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center gap-3 border-b px-4 py-3 lg:hidden"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="rounded-lg p-1.5"
            style={{ color: "var(--text-primary)" }}
          >
            <Menu size={20} />
          </button>
          <AetherLogo size={22} />
        </header>
        <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
