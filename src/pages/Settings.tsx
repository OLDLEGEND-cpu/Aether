import { useState } from "react";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Trash2,
  Cloud,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/common/Surfaces";
import { ThemeToggle } from "../components/common/ThemeToggle";
import { Button } from "../components/common/Button";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { AuthModal } from "../components/auth/AuthModal";
import { useSettings } from "../context/SettingsContext";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { storage } from "../services/storage";
import { hasApiKey, testApiKey } from "../services/gemini";
import { SUPABASE_SQL_SCHEMA } from "../services/supabase";
import { AVAILABLE_MODELS } from "../types/chat";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
      style={{ background: checked ? "var(--accent)" : "var(--border-strong)" }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-semibold uppercase tracking-wider"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </h2>
  );
}

function Row({
  title,
  description,
  control,
}: {
  title: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {title}
        </p>
        {description && (
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {control}
    </div>
  );
}

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { deleteConversation, conversations } = useChat();
  const { user, isTablesReady, checkTablesStatus } = useAuth();
  const { showToast } = useToast();

  const [apiKeyInput, setApiKeyInput] = useState(storage.getApiKey());
  const [showKey, setShowKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [clearConvosOpen, setClearConvosOpen] = useState(false);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const handleSaveKey = () => {
    storage.saveApiKey(apiKeyInput.trim());
    showToast("Gemini API key saved", "success");
  };

  const handleTestKey = async () => {
    const key = apiKeyInput.trim();
    if (!key) {
      showToast("Please enter an API key first", "error");
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);

    const result = await testApiKey(key);
    setIsTestingKey(false);
    if (result.ok) {
      setTestResult({ ok: true, message: "Connection verified! Gemini API is responding." });
      storage.saveApiKey(key);
      showToast("Connection successful & key saved", "success");
    } else {
      setTestResult({ ok: false, message: result.error || "Connection failed." });
    }
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      showToast("SQL Schema copied to clipboard", "success");
      window.setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      showToast("Couldn't copy to clipboard", "error");
    }
  };

  const handleClearConversations = () => {
    conversations.forEach((c) => deleteConversation(c.id));
    setClearConvosOpen(false);
    showToast("All conversations cleared", "success");
  };

  const handleClearAll = () => {
    storage.clearAll();
    setClearAllOpen(false);
    showToast("All local data cleared", "success");
    window.setTimeout(() => window.location.reload(), 600);
  };

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Settings
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Customize Aether AI model, appearance, cloud sync, and conversation behavior.
          </p>

          <div className="mt-8 flex flex-col gap-8">
            {/* Supabase Cloud Sync Section */}
            <div>
              <SectionTitle>Supabase Cloud Sync</SectionTitle>
              <Card className="mt-3 divide-y" style={{ borderColor: "var(--border)" }}>
                <div className="py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cloud size={17} className="text-emerald-500" />
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        Supabase Project
                      </span>
                    </div>
                    <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      pagkktpafxzkyvekgrbr
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl p-3 border text-xs" style={{ background: "var(--code-bg)", borderColor: "var(--border)" }}>
                    <div>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                        {user ? `Connected as ${user.email}` : "Guest Mode (Local Storage Only)"}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {user
                          ? "Chats and preferences are synced with your Supabase account."
                          : "Sign in to back up and sync your chats across multiple devices."}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={user ? "secondary" : "primary"}
                      onClick={() => setAuthModalOpen(true)}
                    >
                      {user ? "Manage Account" : "Sign In / Register"}
                    </Button>
                  </div>
                </div>

                {/* Table Schema Migration Helper */}
                <div className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        Database Schema
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {isTablesReady ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                            <CheckCircle2 size={12} /> Supabase tables active
                          </span>
                        ) : (
                          "Tables can be created in your Supabase SQL Editor."
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const ready = await checkTablesStatus();
                          showToast(ready ? "Tables verified!" : "Tables not yet created", ready ? "success" : "info");
                        }}
                        className="text-xs underline"
                        style={{ color: "var(--accent)" }}
                      >
                        Check Status
                      </button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowSqlSchema((prev) => !prev)}
                      >
                        {showSqlSchema ? "Hide SQL" : "View SQL Schema"}
                      </Button>
                    </div>
                  </div>

                  {showSqlSchema && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                          Copy & paste into Supabase SQL Editor:
                        </span>
                        <div className="flex items-center gap-2">
                          <a
                            href="https://supabase.com/dashboard/project/pagkktpafxzkyvekgrbr/sql"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium underline"
                            style={{ color: "var(--accent)" }}
                          >
                            Open SQL Editor <ExternalLink size={11} />
                          </a>
                          <button
                            type="button"
                            onClick={handleCopySql}
                            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-[var(--code-bg)]"
                            style={{ borderColor: "var(--border)" }}
                          >
                            {copiedSql ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            {copiedSql ? "Copied!" : "Copy SQL"}
                          </button>
                        </div>
                      </div>
                      <pre
                        className="rounded-xl border p-3 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-52"
                        style={{ background: "var(--code-bg)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                      >
                        {SUPABASE_SQL_SCHEMA}
                      </pre>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* AI Model & Persona */}
            <div>
              <SectionTitle>AI Model &amp; Behavior</SectionTitle>
              <Card className="mt-3 divide-y" style={{ borderColor: "var(--border)" }}>
                <Row
                  title="Default AI Model"
                  description="Choose which Gemini model starts new conversations."
                  control={
                    <select
                      value={settings.defaultModel}
                      onChange={(e) => {
                        updateSettings({ defaultModel: e.target.value });
                        storage.saveActiveModel(e.target.value);
                        showToast("Default model updated", "success");
                      }}
                      className="rounded-xl border px-3 py-1.5 text-xs font-semibold outline-none"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--bg)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {AVAILABLE_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.badge ? `(${m.badge})` : ""}
                        </option>
                      ))}
                    </select>
                  }
                />

                <div className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      System Instruction (AI Persona)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        updateSettings({
                          systemInstruction:
                            "You are Aether, an intelligent, calm, and sophisticated AI assistant. Deliver clear, accurate, and insightful responses. Use clean GitHub-flavored Markdown with code blocks, tables, and lists where appropriate.",
                        });
                        showToast("Reset to default persona", "info");
                      }}
                      className="text-xs hover:underline"
                      style={{ color: "var(--accent)" }}
                    >
                      Reset default
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={settings.systemInstruction}
                    onChange={(e) => updateSettings({ systemInstruction: e.target.value })}
                    className="w-full rounded-xl border p-2.5 text-xs leading-relaxed outline-none"
                    style={{
                      borderColor: "var(--border-strong)",
                      background: "var(--bg)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Instructions for how Aether behaves..."
                  />
                </div>

                <div className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        Temperature ({settings.temperature})
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Lower values are more deterministic; higher values are more creative.
                      </p>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                      className="w-32 accent-[var(--accent)]"
                    />
                  </div>
                </div>

                <Row
                  title="Auto Read Aloud"
                  description="Automatically speak out responses using speech synthesis."
                  control={
                    <Toggle
                      checked={settings.autoSpeech}
                      onChange={(v) => {
                        updateSettings({ autoSpeech: v });
                        showToast("Settings updated", "success");
                      }}
                      label="Auto speech"
                    />
                  }
                />
              </Card>
            </div>

            {/* Gemini API Key */}
            <div>
              <SectionTitle>Gemini API Credentials</SectionTitle>
              <Card className="mt-3">
                <div className="flex items-center gap-2">
                  {hasApiKey() ? (
                    <>
                      <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        API Key Configured
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} style={{ color: "var(--error)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        No Key Set
                      </span>
                    </>
                  )}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-xs font-medium underline"
                    style={{ color: "var(--accent)" }}
                  >
                    Get free key from Google AI Studio <ExternalLink size={11} />
                  </a>
                </div>

                <label
                  htmlFor="api-key"
                  className="mt-4 block text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Gemini API key
                </label>
                <div
                  className="mt-1.5 flex items-center gap-2 rounded-xl border px-3 py-2"
                  style={{ borderColor: "var(--border-strong)", background: "var(--bg)" }}
                >
                  <input
                    id="api-key"
                    type={showKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    aria-label={showKey ? "Hide API key" : "Show API key"}
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`mt-2.5 rounded-xl border p-2.5 text-xs font-medium ${
                      testResult.ok ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20"
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="primary" onClick={handleSaveKey}>
                    Save key
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleTestKey}
                    disabled={isTestingKey}
                  >
                    {isTestingKey ? "Testing..." : "Test Connection"}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Appearance */}
            <div>
              <SectionTitle>Appearance</SectionTitle>
              <Card className="mt-3 divide-y" style={{ borderColor: "var(--border)" }}>
                <Row
                  title="Theme"
                  description="Choose light, dark, or follow system appearance."
                  control={<ThemeToggle />}
                />
              </Card>
            </div>

            {/* Chat Interaction */}
            <div>
              <SectionTitle>Chat Interaction</SectionTitle>
              <Card className="mt-3 divide-y" style={{ borderColor: "var(--border)" }}>
                <Row
                  title="Enter to send"
                  description="Press Enter to submit, Shift+Enter for a new line."
                  control={
                    <Toggle
                      checked={settings.enterToSend}
                      onChange={(v) => {
                        updateSettings({ enterToSend: v });
                        showToast("Settings updated", "success");
                      }}
                      label="Enter to send"
                    />
                  }
                />
                <Row
                  title="Suggested prompts"
                  description="Show inspiration prompts on the empty chat screen."
                  control={
                    <Toggle
                      checked={settings.showSuggestedPrompts}
                      onChange={(v) => {
                        updateSettings({ showSuggestedPrompts: v });
                        showToast("Settings updated", "success");
                      }}
                      label="Suggested prompts"
                    />
                  }
                />
              </Card>
            </div>

            {/* Data & Privacy */}
            <div>
              <SectionTitle>Data &amp; Storage</SectionTitle>
              <Card className="mt-3 divide-y" style={{ borderColor: "var(--border)" }}>
                <Row
                  title="Clear all conversations"
                  description="Remove conversation history from browser storage and cloud."
                  control={
                    <Button variant="secondary" size="sm" onClick={() => setClearConvosOpen(true)}>
                      <Trash2 size={13} /> Clear
                    </Button>
                  }
                />
                <Row
                  title="Clear all local data"
                  description="Reset all conversations, settings, API key, and cached items."
                  control={
                    <Button variant="danger" size="sm" onClick={() => setClearAllOpen(true)}>
                      <Trash2 size={13} /> Clear all
                    </Button>
                  }
                />
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={clearConvosOpen}
        title="Clear all conversations?"
        description="This permanently deletes every conversation stored in this browser. This cannot be undone."
        confirmLabel="Clear conversations"
        onConfirm={handleClearConversations}
        onCancel={() => setClearConvosOpen(false)}
      />
      <ConfirmDialog
        open={clearAllOpen}
        title="Clear all local data?"
        description="This permanently deletes all conversations, saved prompts, and preferences stored by Aether in this browser. The page will reload."
        confirmLabel="Clear everything"
        onConfirm={handleClearAll}
        onCancel={() => setClearAllOpen(false)}
      />

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </AppShell>
  );
}
