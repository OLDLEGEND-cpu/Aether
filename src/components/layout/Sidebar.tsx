import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Search,
  MessageSquare,
  Compass,
  BookMarked,
  History,
  Settings as SettingsIcon,
  X,
  Pin,
  Trash2,
  Cloud,
  CloudOff,
  LogIn,
} from "lucide-react";
import { AetherLogo } from "../common/AetherLogo";
import { useChat } from "../../context/ChatContext";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { AuthModal } from "../auth/AuthModal";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/prompts", label: "Prompt Library", icon: BookMarked },
  { to: "/history", label: "Chat History", icon: History },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const {
    conversations,
    activeId,
    setActiveId,
    createConversation,
    deleteConversation,
    togglePin,
  } = useChat();
  const { profile } = useSettings();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = query.trim()
      ? conversations.filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()))
      : conversations;
    return [...list].sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [conversations, query]);

  const handleNewChat = () => {
    createConversation();
    navigate("/chat");
    onClose();
  };

  const handleOpenConversation = (id: string) => {
    setActiveId(id);
    navigate(`/chat/${id}`);
    onClose();
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      deleteConversation(pendingDeleteId);
      showToast("Conversation deleted", "success");
      if (activeId === pendingDeleteId) navigate("/chat");
    }
    setPendingDeleteId(null);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col border-r transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        aria-label="Sidebar navigation"
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between px-4 pt-4">
          <NavLink to="/" className="rounded-lg" aria-label="Aether home">
            <AetherLogo size={24} />
          </NavLink>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 lg:hidden transition-colors hover:bg-[var(--code-bg)]"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 pt-4">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all hover:bg-[var(--code-bg)] shadow-xs"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
          >
            <span className="flex items-center gap-2">
              <PlusCircle size={16} style={{ color: "var(--accent)" }} />
              New Chat
            </span>
            <span className="text-[10px] font-mono opacity-50">⌘K</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="px-3 pt-3">
          <div
            className="flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition-colors focus-within:border-[var(--accent)]"
            style={{ borderColor: "var(--border)", background: "var(--bg)" }}
          >
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
              className="w-full bg-transparent text-xs outline-none placeholder:text-[var(--text-muted)]"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-3 flex flex-col gap-0.5 px-3" aria-label="Primary">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive ? "" : "hover:bg-[var(--code-bg)]"
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? "var(--code-bg)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Recent Conversations List */}
        <div className="mt-3 flex-1 overflow-y-auto px-3 pb-2">
          <div className="flex items-center justify-between px-1 pb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Recent Chats
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {conversations.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="px-1 py-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              {query ? "No matching chats found." : "No conversations yet."}
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {filtered.map((c) => (
                <li key={c.id} className="group relative">
                  <button
                    onClick={() => handleOpenConversation(c.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-colors hover:bg-[var(--code-bg)]"
                    style={{
                      background: activeId === c.id ? "var(--code-bg)" : "transparent",
                      color: "var(--text-primary)",
                    }}
                  >
                    <MessageSquare size={13} className="shrink-0" style={{ color: "var(--text-muted)" }} />
                    <span className="flex-1 truncate">{c.title}</span>
                    {c.pinned && <Pin size={11} style={{ color: "var(--accent)" }} className="shrink-0" />}
                  </button>
                  <div className="absolute right-1 top-1/2 hidden -translate-y-1/2 gap-0.5 group-hover:flex group-focus-within:flex">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(c.id);
                      }}
                      aria-label={c.pinned ? "Unpin conversation" : "Pin conversation"}
                      className="rounded-md p-1 shadow-xs hover:bg-[var(--surface-elevated)]"
                      style={{ background: "var(--surface)", color: "var(--text-muted)" }}
                      title={c.pinned ? "Unpin" : "Pin"}
                    >
                      <Pin size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteId(c.id);
                      }}
                      aria-label="Delete conversation"
                      className="rounded-md p-1 shadow-xs hover:bg-[var(--surface-elevated)]"
                      style={{ background: "var(--surface)", color: "var(--error)" }}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer Area with Supabase Cloud Status & Profile */}
        <div className="border-t p-3 space-y-1" style={{ borderColor: "var(--border)" }}>
          {/* Cloud Sync Status Button */}
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--code-bg)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <div className="flex items-center gap-2">
              {user ? (
                <Cloud size={14} className="text-emerald-500" />
              ) : (
                <CloudOff size={14} style={{ color: "var(--text-muted)" }} />
              )}
              <span className="truncate">{user ? user.email : "Cloud Sync (Supabase)"}</span>
            </div>
            {!user && <LogIn size={13} style={{ color: "var(--accent)" }} />}
          </button>

          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium hover:bg-[var(--code-bg)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <SettingsIcon size={15} />
            Settings
          </NavLink>

          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-[var(--code-bg)]"
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              {user?.email ? user.email.slice(0, 2).toUpperCase() : profile.initials}
            </span>
            <span className="truncate text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              {user?.email || profile.displayName}
            </span>
          </NavLink>
        </div>
      </aside>

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete conversation?"
        description="This will permanently remove this conversation and its messages from this browser and cloud sync. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
