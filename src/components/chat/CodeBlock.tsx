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
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="my-1 overflow-hidden rounded-lg">
      <div
        className="flex items-center justify-between border-b px-3.5 py-1.5"
        style={{ borderColor: "var(--border)", background: "var(--code-bg)" }}
      >
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
          aria-label="Copy code"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <Suspense
        fallback={
          <pre
            className="m-0 overflow-x-auto px-4 py-3.5 text-[0.825rem]"
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
              padding: "0.9rem 1rem",
              fontSize: "0.825rem",
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
