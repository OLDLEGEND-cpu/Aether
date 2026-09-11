import { useState } from "react";
import { Cloud, LogOut, CheckCircle2 } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/common/Surfaces";
import { Button } from "../components/common/Button";
import { AuthModal } from "../components/auth/AuthModal";
import { useSettings } from "../context/SettingsContext";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "GU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Profile() {
  const { profile, updateProfile } = useSettings();
  const { conversations } = useChat();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.email ? user.email.split("@")[0] : profile.displayName);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);

  const handleSave = () => {
    const trimmed = name.trim() || "User";
    updateProfile({ displayName: trimmed, initials: initialsFromName(trimmed) });
    showToast("Profile updated", "success");
  };

  const handleSignOut = async () => {
    await signOut();
    showToast("Signed out", "success");
  };

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            User Profile
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Manage your account identity and local/cloud storage preferences.
          </p>

          {/* Cloud Account Card */}
          <Card className="mt-6">
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ background: "color-mix(in srgb, var(--accent) 15%, var(--surface))" }}
                >
                  <Cloud size={20} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Supabase Cloud Sync
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Project: pagkktpafxzkyvekgrbr
                  </p>
                </div>
              </div>

              {user ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    background: "color-mix(in srgb, var(--success) 15%, var(--surface))",
                    color: "var(--success)",
                  }}
                >
                  <CheckCircle2 size={12} /> Connected
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    background: "var(--code-bg)",
                    color: "var(--text-muted)",
                  }}
                >
                  Guest (Local)
                </span>
              )}
            </div>

            <div className="pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: "var(--text-muted)" }}>Email Account:</span>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: "var(--text-muted)" }}>Account ID:</span>
                    <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {user.id}
                    </span>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleSignOut}
                      className="flex items-center gap-1.5"
                    >
                      <LogOut size={13} /> Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Sign in to sync conversations automatically across your browsers.
                  </p>
                  <Button size="sm" variant="primary" onClick={() => setAuthModalOpen(true)}>
                    Sign In / Register
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Profile Details */}
          <Card className="mt-6">
            <div className="flex items-center gap-4">
              <span
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold"
                style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
                aria-hidden="true"
              >
                {user?.email ? user.email.slice(0, 2).toUpperCase() : profile.initials}
              </span>
              <div className="flex-1">
                <label
                  htmlFor="display-name"
                  className="block text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Display Name
                </label>
                <input
                  id="display-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: "var(--border-strong)",
                    background: "var(--bg)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>
            <Button size="sm" className="mt-4" onClick={handleSave}>
              Save changes
            </Button>
          </Card>

          {/* Usage Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {conversations.length}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                Conversations
              </p>
            </Card>
            <Card>
              <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {totalMessages}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                Messages exchanged
              </p>
            </Card>
            <Card className="col-span-2 sm:col-span-1">
              <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                Gemini 2.5
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                Active AI Core
              </p>
            </Card>
          </div>
        </div>
      </div>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </AppShell>
  );
}
