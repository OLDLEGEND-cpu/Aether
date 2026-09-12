import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import { useToast } from "../../context/ToastContext";

export function GlobalShortcuts() {
  const navigate = useNavigate();
  const { createConversation } = useChat();
  const { showToast } = useToast();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        // Only prevent default if not inside an input where Ctrl+K is used for something else
        e.preventDefault();
        const id = createConversation();
        navigate(`/chat/${id}`);
        showToast("New conversation started (⌘K)", "success");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createConversation, navigate, showToast]);

  return null;
}
