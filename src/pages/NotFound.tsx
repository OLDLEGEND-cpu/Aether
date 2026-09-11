import { useNavigate } from "react-router-dom";
import { MessageSquare, Home } from "lucide-react";
import { AetherLogo } from "../components/common/AetherLogo";
import { Button } from "../components/common/Button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--bg)" }}
    >
      <AetherLogo size={32} showWordmark={false} />
      <p className="mt-6 text-sm font-semibold tracking-wide" style={{ color: "var(--accent)" }}>
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
        This page doesn't exist
      </h1>
      <p className="mt-2 max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>
        The page you're looking for may have been moved or never existed.
      </p>
      <div className="mt-7 flex gap-3">
        <Button variant="secondary" onClick={() => navigate("/")}>
          <Home size={15} /> Return to Aether
        </Button>
        <Button onClick={() => navigate("/chat")}>
          <MessageSquare size={15} /> Return to Chat
        </Button>
      </div>
    </div>
  );
}
