import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Plus,
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
import type { Conversation } from "../../types/chat";

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

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const list = query.trim()
      ? conversations.filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()))
      : conversations;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfLastWeek = startOfToday - 86400000 * 7;

    const pinned: Conversation[] = [];
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const lastSevenDays: Conversation[] = [];
    const older: Conversation[] = [];

    // Sort descending by updatedAt
    const sorted = [...list].sort((a, b) => b.updatedAt - a.updatedAt);

    sorted.forEach((c) => {
      if (c.pinned) {
        pinned.push(c);
      } else if (c.updatedAt >= startOfToday) {
        today.push(c);
      } else if (c.updatedAt >= startOfYesterday) {
        yesterday.push(c);
      } else if (c.updatedAt >= startOfLastWeek) {
        lastSevenDays.push(c);
      } else {
        older.push(c);
      }
    });

    return [
      { label: "Pinned", items: pinned },
      { label: "Today", items: today },
      { label: "Yesterday", items: yesterday },
      { label: "Previous 7 Days", items: lastSevenDays },
      { label: "Older", items: older },
    ].filter((group) => group.items.length > 0);
  }, [conversations, query]);

  const handleNewChat = () => {
    const id = createConversation();
    navigate(`/chat/${id}`);
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
          className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[270px] shrink-0 flex-col border-r transition-transform duration-200 ease-out lg:static lg:translate-x-0 select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
        aria-label="Sidebar navigation"
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <NavLink to="/" className="rounded-lg outline-none" aria-label="Aether home">
            <AetherLogo size={26} showBadge={true} />
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

        {/* New Chat Action */}
        <div className="px-3 pt-3">
          <button
            onClick={handleNewChat}
            className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-150 active:scale-98 shadow-xs hover:shadow-sm"
            style={{
              background: "var(--accent)",
              color: "var(--accent-contrast)",
            }}
          >
            <span className="flex items-center gap-2">
              <Plus size={16} strokeWidth={2.5} />
              New Conversation
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-mono font-medium opacity-80"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              ⌘K
            </span>
          </button>
        </div>

        {/* Search Conversations Input */}
        <div className="px-3 pt-2.5">
          <div
            className="flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition-all focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)]"
            style={{ borderColor: "var(--border)", background: "var(--code-bg)" }}
          >
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats..."
              aria-label="Search conversations"
              className="w-full bg-transparent text-xs outline-none placeholder:text-[var(--text-muted)] font-normal"
              style={{ color: "var(--text-primary)" }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-2.5 flex flex-col gap-0.5 px-3" aria-label="Primary">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive ? "" : "hover:bg-[var(--code-bg)] opacity-75 hover:opacity-100"
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? "var(--code-bg)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              })}
            >
              <Icon size={15} style={{ color: "var(--accent)" }} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="my-2 border-b mx-3" style={{ borderColor: "var(--border)" }} />

        {/* Recent Conversations List Grouped by Date */}
        <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-3">
          {groupedConversations.length === 0 ? (
            <div className="px-2 py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              {query ? "No matching conversations." : "No chats yet."}
            </div>
          ) : (
            groupedConversations.map((group) => (
              <div key={group.label} className="space-y-0.5">
                <span
                  className="px-2 text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: "var(--text-muted)" }}
                >
                  {group.label}
                </span>

                <ul className="flex flex-col gap-0.5">
                  {group.items.map((c) => {
                    const isActive = activeId === c.id;
                    return (
                      <li key={c.id} className="group relative">
                        <button
                          onClick={() => handleOpenConversation(c.id)}
                          className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium transition-all ${
                            isActive
                              ? "font-semibold shadow-2xs"
                              : "hover:bg-[var(--code-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                          style={{
                            background: isActive ? "var(--code-bg)" : "transparent",
                            color: isActive ? "var(--text-primary)" : undefined,
                            borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                          }}
                        >
                          <MessageSquare
                            size={13}
                            className="shrink-0 transition-colors"
                            style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
                          />
                          <span className="flex-1 truncate">{c.title}</span>
                          {c.pinned && (
                            <Pin size={11} style={{ color: "var(--accent)" }} className="shrink-0" />
                          )}
                        </button>

                        {/* Action buttons on hover */}
                        <div className="absolute right-1 top-1/2 hidden -translate-y-1/2 gap-0.5 group-hover:flex group-focus-within:flex">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(c.id);
                            }}
                            aria-label={c.pinned ? "Unpin conversation" : "Pin conversation"}
                            className="rounded-md p-1 transition-colors hover:bg-[var(--surface-elevated)]"
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
                            className="rounded-md p-1 transition-colors hover:bg-[var(--surface-elevated)]"
                            style={{ background: "var(--surface)", color: "var(--error)" }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Footer Area with Supabase Cloud Status & Profile */}
        <div className="border-t p-2.5 space-y-1" style={{ borderColor: "var(--border)" }}>
          {/* Cloud Sync Status Pill */}
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--code-bg)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <div className="flex items-center gap-2">
              {user ? (
                <div className="relative flex items-center">
                  <Cloud size={14} className="text-emerald-500" />
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
              ) : (
                <CloudOff size={14} style={{ color: "var(--text-muted)" }} />
              )}
              <span className="truncate text-xs">{user ? user.email : "Cloud Sync (Supabase)"}</span>
            </div>
            {!user && <LogIn size={13} style={{ color: "var(--accent)" }} />}
          </button>

          {/* Settings Navlink */}
          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--code-bg)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <SettingsIcon size={14} />
            <span>Settings</span>
          </NavLink>

          {/* User Account / Profile */}
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-[var(--code-bg)]"
          >
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-2xs"
              style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              {user?.email ? user.email.slice(0, 2).toUpperCase() : profile.initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                {user?.email || profile.displayName}
              </span>
            </div>
          </NavLink>
        </div>
      </aside>

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete conversation?"
        description="This will permanently remove this conversation and its messages from your browser and cloud sync. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
