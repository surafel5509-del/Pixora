import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured, loadSupabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/env";
import { useToast } from "@/context/ToastProvider";

export type AuthStatus = "loading" | "authenticated" | "anonymous";
export type AuthMode = "supabase" | "local";

export interface AuthResult {
  ok: boolean;
  message: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  mode: AuthMode;
  isConfigured: boolean;
  email: string | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  sendMagicLink: (email: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const NOT_CONFIGURED: AuthResult = {
  ok: false,
  message: "Cloud accounts aren't connected yet. Your library is still saved on this device.",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>(isSupabaseConfigured ? "loading" : "anonymous");
  const toast = useToast();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus("anonymous");
      return;
    }

    let active = true;
    let subscription: { unsubscribe: () => void } | null = null;

    void loadSupabase().then(async (client) => {
      if (!active || !client) {
        if (active) setStatus("anonymous");
        return;
      }

      const { data } = await client.auth.getSession();
      if (!active) return;
      setSession(data.session);
      setStatus(data.session ? "authenticated" : "anonymous");

      const listener = client.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setStatus(nextSession ? "authenticated" : "anonymous");
      });
      subscription = listener.data.subscription;
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Surface the result of an email confirmation / password recovery link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const isVerification =
      params.get("verified") === "1" || hash.get("type") === "signup" || params.has("code");
    if (!isVerification) return;

    if (hash.get("type") === "recovery") {
      toast.info("Choose a new password", "Enter and confirm your new password to finish recovery.");
      return;
    }

    toast.success("Email confirmed", "Your Pixora account is verified — sign in to sync your library.");
    window.history.replaceState({}, "", window.location.pathname);
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const client = getSupabase() ?? (await loadSupabase());
    if (!client) return NOT_CONFIGURED;
    const { error } = await client.auth.signInWithPassword({ email, password });
    return error ? { ok: false, message: error.message } : { ok: true, message: "Welcome back to Pixora." };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const client = getSupabase() ?? (await loadSupabase());
    if (!client) return NOT_CONFIGURED;
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${SITE_URL}/auth?verified=1` },
    });
    if (error) return { ok: false, message: error.message };
    if (data.session) return { ok: true, message: "Account created. You're signed in." };
    return {
      ok: true,
      message: "Check your inbox to confirm your email, then sign in to sync your library.",
    };
  }, []);

  const sendMagicLink = useCallback(async (email: string): Promise<AuthResult> => {
    const client = getSupabase() ?? (await loadSupabase());
    if (!client) return NOT_CONFIGURED;
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${SITE_URL}/auth` },
    });
    return error
      ? { ok: false, message: error.message }
      : { ok: true, message: "Magic link sent. Open it on this device to sign in." };
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    const client = getSupabase() ?? (await loadSupabase());
    if (!client) return NOT_CONFIGURED;
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/auth?reset=1`,
    });
    return error
      ? { ok: false, message: error.message }
      : { ok: true, message: "If that email has an account, a reset link is on its way." };
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    const client = getSupabase() ?? (await loadSupabase());
    if (!client) return NOT_CONFIGURED;
    const { error } = await client.auth.updateUser({ password });
    return error ? { ok: false, message: error.message } : { ok: true, message: "Password updated." };
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabase() ?? (await loadSupabase());
    if (!client) return;
    await client.auth.signOut();
    toast.info("Signed out", "Your local library stayed on this device.");
  }, [toast]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      status,
      mode: isSupabaseConfigured ? "supabase" : "local",
      isConfigured: isSupabaseConfigured,
      email: session?.user?.email ?? null,
      signIn,
      signUp,
      sendMagicLink,
      resetPassword,
      updatePassword,
      signOut,
    }),
    [session, status, signIn, signUp, sendMagicLink, resetPassword, updatePassword, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
