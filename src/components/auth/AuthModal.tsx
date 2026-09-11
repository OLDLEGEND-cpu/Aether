import { useState } from "react";
import { X, Cloud, Lock, Mail, User as UserIcon, CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../common/Button";
import { useToast } from "../../context/ToastContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { user, isCloudConfigured, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    if (mode === "signin") {
      const res = await signInWithEmail(email, password);
      setLoading(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        showToast("Signed in successfully", "success");
        onClose();
      }
    } else {
      const res = await signUpWithEmail(email, password, displayName);
      setLoading(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        if (res.confirmationRequired) {
          showToast("Registration successful! Check your email to confirm.", "success");
        } else {
          showToast("Account created successfully!", "success");
        }
        onClose();
      }
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
    showToast("Signed out", "success");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "color-mix(in srgb, var(--accent) 15%, var(--surface))" }}
            >
              <Cloud size={18} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                {user ? "Cloud Account" : mode === "signin" ? "Sign In to Aether" : "Create Account"}
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Supabase Cloud Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-[var(--code-bg)]"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Supabase status pill */}
        <div
          className="mt-4 flex items-center justify-between rounded-xl px-3 py-2 text-xs border"
          style={{
            background: "var(--code-bg)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isCloudConfigured ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
              Supabase Project
            </span>
          </div>
          <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
            pagkktpafxzkyvekgrbr
          </span>
        </div>

        {user ? (
          <div className="mt-5 space-y-4">
            <div
              className="rounded-xl border p-4 space-y-2"
              style={{ borderColor: "var(--border)", background: "var(--code-bg)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Signed in as
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: "color-mix(in srgb, var(--success) 15%, var(--surface))", color: "var(--success)" }}
                >
                  <CheckCircle2 size={11} /> Connected
                </span>
              </div>
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {user.email}
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Chats and settings sync automatically across your browsers.
              </p>
            </div>

            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleSignOut}
              disabled={loading}
            >
              <LogOut size={16} /> Sign Out
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            {errorMessage && (
              <div
                className="flex items-center gap-2 rounded-xl border p-3 text-xs"
                style={{
                  borderColor: "color-mix(in srgb, var(--error) 30%, var(--border))",
                  background: "color-mix(in srgb, var(--error) 8%, var(--surface))",
                  color: "var(--error)",
                }}
              >
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Display Name
                </label>
                <div
                  className="flex items-center gap-2 rounded-xl border px-3 py-2"
                  style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
                >
                  <UserIcon size={15} style={{ color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Email Address
              </label>
              <div
                className="flex items-center gap-2 rounded-xl border px-3 py-2"
                style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
              >
                <Mail size={15} style={{ color: "var(--text-muted)" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div
                className="flex items-center gap-2 rounded-xl border px-3 py-2"
                style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
              >
                <Lock size={15} style={{ color: "var(--text-muted)" }} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
              {loading ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>

            <div className="pt-2 text-center">
              {mode === "signin" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMessage(null);
                  }}
                  className="text-xs hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  Don't have an account? Sign up
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMessage(null);
                  }}
                  className="text-xs hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
