import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import {
  supabase,
  checkSupabaseTables,
  SUPABASE_URL,
} from "../services/supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isTablesReady: boolean;
  isCloudConfigured: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<{ error?: string; confirmationRequired?: boolean }>;
  signOut: () => Promise<void>;
  checkTablesStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTablesReady, setIsTablesReady] = useState(false);

  const isCloudConfigured = Boolean(SUPABASE_URL);

  const checkTablesStatus = useCallback(async () => {
    const ready = await checkSupabaseTables();
    setIsTablesReady(ready);
    return ready;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    checkTablesStatus();

    return () => {
      subscription.unsubscribe();
    };
  }, [checkTablesStatus]);

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) return { error: error.message };
      return {};
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            display_name: name || email.split("@")[0],
          },
        },
      });
      if (error) return { error: error.message };
      const confirmationRequired = !data.session;
      return { confirmationRequired };
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isTablesReady,
        isCloudConfigured,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        checkTablesStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
