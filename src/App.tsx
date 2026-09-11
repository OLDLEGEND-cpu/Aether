import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ChatProvider } from "./context/ChatContext";
import { ToastProvider } from "./context/ToastContext";
import { AetherLogo } from "./components/common/AetherLogo";

// Chat is the core experience and loads eagerly; secondary pages are
// code-split so the initial bundle stays lean.
import Chat from "./pages/Chat";

const Home = lazy(() => import("./pages/Home"));
const History = lazy(() => import("./pages/History"));
const Explore = lazy(() => import("./pages/Explore"));
const PromptLibrary = lazy(() => import("./pages/PromptLibrary"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const Help = lazy(() => import("./pages/Help"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center" style={{ background: "var(--bg)" }}>
      <AetherLogo size={32} showWordmark={false} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <ChatProvider>
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/chat/:conversationId" element={<Chat />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/prompts" element={<PromptLibrary />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ChatProvider>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
