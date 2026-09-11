import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";

export default function Privacy() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Privacy
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Last updated September 2026. This is placeholder text for a practice project, not a
          binding legal document.
        </p>

        <div className="prose-aether mt-8" style={{ color: "var(--text-secondary)" }}>
          <h2>How Aether handles your data</h2>
          <p>
            Aether is a frontend-only demo application. It does not operate its own backend server
            or database. Instead, your conversation history, settings, and saved prompts are stored
            directly in your browser's local storage.
          </p>

          <h2>Gemini API requests</h2>
          <p>
            When you send a message, Aether sends your conversation directly from your browser to
            Google's Gemini API to generate a response. That request is subject to Google's own
            privacy practices and terms, which are separate from Aether Labs.
          </p>

          <h2>Frontend API keys</h2>
          <p>
            Because Aether is a frontend-only application, your Gemini API key is stored in your
            browser and included in requests made from your browser. This means the key can
            potentially be exposed to anyone with access to this browser or its stored data.
            Production applications handling sensitive API access should proxy requests through a
            secure backend server — Aether intentionally does not do this, to keep the project
            focused on frontend engineering.
          </p>

          <h2>What we don't do</h2>
          <ul>
            <li>We don't operate servers that store your conversations.</li>
            <li>We don't sell or share your data, because we don't collect it.</li>
            <li>We don't provide enterprise-grade security guarantees — this is a demo project.</li>
          </ul>

          <h2>Clearing your data</h2>
          <p>
            You can clear your conversations or all local Aether data at any time from Settings →
            Privacy. Clearing your browser's site data will also remove everything Aether has stored.
          </p>

          <h2>Contact</h2>
          <p>Questions about this policy can be sent to hello@aetherlabs.example.</p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
