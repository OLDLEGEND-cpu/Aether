import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((mod) => ({ default: mod.Prism }))
);

interface CodeBlockProps {
  className?: string;
  children?: ReactNode;
  inline?: boolean;
}

export function CodeBlock({ className, children }: CodeBlockProps) {
  const { resolvedTheme } = useSettings();
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState<Record<string, React.CSSProperties> | null>(null);
  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1] ?? "text";
  const codeString = String(children).replace(/\n$/, "");

  useEffect(() => {
    let cancelled = false;
    import("react-syntax-highlighter/dist/esm/styles/prism").then((mod) => {
      if (!cancelled) setStyle(resolvedTheme === "dark" ? mod.oneDark : mod.oneLight);
    });
    return () => {
      cancelled = true;
    };
  }, [resolvedTheme]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border shadow-xs transition-all" style={{ borderColor: "var(--border-strong)" }}>
      {/* macOS Style Code Header */}
      <div
        className="flex items-center justify-between border-b px-3.5 py-2 select-none"
        style={{ borderColor: "var(--border)", background: "var(--surface-subtle)" }}
      >
        <div className="flex items-center gap-2">
          {/* macOS Window Controls */}
          <div className="flex items-center gap-1.5 mr-1" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/75" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/75" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/75" />
          </div>

          <span
            className="rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)", background: "var(--code-bg)" }}
          >
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-all hover:bg-[var(--surface)] hover:shadow-2xs active:scale-95"
          style={{ color: "var(--text-secondary)" }}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-500" />
              <span className="text-emerald-500 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax Highlighting Container */}
      <Suspense
        fallback={
          <pre
            className="m-0 overflow-x-auto p-4 text-[0.85rem] font-mono leading-relaxed"
            style={{ background: "var(--code-bg)", color: "var(--text-secondary)" }}
          >
            {codeString}
          </pre>
        }
      >
        {style && (
          <SyntaxHighlighter
            language={language}
            style={style}
            customStyle={{
              margin: 0,
              padding: "1rem 1.1rem",
              fontSize: "0.85rem",
              fontFamily: "var(--font-mono)",
              lineHeight: "1.65",
              background: "var(--code-bg)",
            }}
            wrapLongLines
          >
            {codeString}
          </SyntaxHighlighter>
        )}
      </Suspense>
    </div>
  );
}
