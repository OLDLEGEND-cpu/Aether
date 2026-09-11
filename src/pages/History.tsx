import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageSquare, Trash2, Pencil, Pin, SortDesc } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { useChat } from "../context/ChatContext";
import { EmptyState } from "../components/common/Surfaces";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { useToast } from "../context/ToastContext";

type SortMode = "recent" | "oldest" | "alphabetical";

export default function History() {
  const navigate = useNavigate();
  const { conversations, deleteConversation, renameConversation, togglePin, setActiveId } = useChat();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const filtered = useMemo(() => {
    let list = query.trim()
      ? conversations.filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()))
      : [...conversations];

    list = [...list].sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      if (sortMode === "recent") return b.updatedAt - a.updatedAt;
      if (sortMode === "oldest") return a.updatedAt - b.updatedAt;
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [conversations, query, sortMode]);

  const handleOpen = (id: string) => {
    setActiveId(id);
    navigate(`/chat/${id}`);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      deleteConversation(pendingDeleteId);
      showToast("Conversation deleted", "success");
    }
    setPendingDeleteId(null);
  };

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
  };

  const saveEdit = (id: string) => {
    renameConversation(id, editValue);
    setEditingId(null);
    showToast("Conversation renamed", "success");
  };

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Chat History
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            All conversations are stored locally in this browser.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <Search size={15} style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations…"
                aria-label="Search conversations"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
            <div
              className="flex items-center gap-2 rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <SortDesc size={14} style={{ color: "var(--text-muted)" }} />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                aria-label="Sort conversations"
                className="bg-transparent text-sm outline-none"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="recent">Most recent</option>
                <option value="oldest">Oldest first</option>
                <option value="alphabetical">A–Z</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            {conversations.length === 0 ? (
              <EmptyState
                icon={<MessageSquare size={20} />}
                title="No conversations yet"
                description="Start a new chat and it will show up here automatically."
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Search size={20} />}
                title="No matching conversations"
                description="Try a different search term."
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {filtered.map((c) => (
                  <li
                    key={c.id}
                    className="group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-[var(--code-bg)]"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  >
                    <MessageSquare size={16} style={{ color: "var(--text-muted)" }} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      {editingId === c.id ? (
                        <input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(c.id)}
                          onBlur={() => saveEdit(c.id)}
                          autoFocus
                          aria-label="Rename conversation"
                          className="w-full rounded-md border px-2 py-1 text-sm outline-none"
                          style={{ borderColor: "var(--accent)", color: "var(--text-primary)", background: "var(--bg)" }}
                        />
                      ) : (
                        <button onClick={() => handleOpen(c.id)} className="block truncate text-left text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {c.title}
                        </button>
                      )}
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        {c.messages.length} messages · {new Date(c.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <button
                        onClick={() => togglePin(c.id)}
                        aria-label={c.pinned ? "Unpin" : "Pin"}
                        className="rounded-md p-1.5"
                        style={{ color: c.pinned ? "var(--accent)" : "var(--text-muted)" }}
                      >
                        <Pin size={14} />
                      </button>
                      <button
                        onClick={() => startEdit(c.id, c.title)}
                        aria-label="Rename conversation"
                        className="rounded-md p-1.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(c.id)}
                        aria-label="Delete conversation"
                        className="rounded-md p-1.5"
                        style={{ color: "var(--error)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete conversation?"
        description="This will permanently remove this conversation from this browser. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </AppShell>
  );
}
