import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound, LogOut, Mail, Sparkles, Wand2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { useAuth, type AuthResult } from "@/context/AuthProvider";
import { useUI, type AuthView } from "@/context/UIProvider";
import { isEmail } from "@/lib/utils";

const TABS: { id: AuthView; label: string; short: string }[] = [
  { id: "signin", label: "Sign in", short: "Sign in" },
  { id: "signup", label: "Create account", short: "Sign up" },
  { id: "magic", label: "Magic link", short: "Magic" },
  { id: "reset", label: "Reset", short: "Reset" },
];

/** Shared authentication surface used by the modal and the standalone page. */
export function AuthPanel({ onDone }: { onDone?: () => void }) {
  const { authView, setAuthView } = useUI();
  const { signIn, signUp, sendMagicLink, resetPassword, signOut, user, isConfigured, status, mode } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    setMessage(null);
  }, [authView]);

  const finish = () => {
    setBusy(false);
    onDone?.();
  };

  const submit = async () => {
    if (!isEmail(email)) {
      setMessage({ tone: "error", text: "Enter a valid email address." });
      return;
    }

    setBusy(true);
    setMessage(null);

    let result: AuthResult;
    if (authView === "signup") result = await signUp(email, password);
    else if (authView === "magic") result = await sendMagicLink(email);
    else if (authView === "reset") result = await resetPassword(email);
    else result = await signIn(email, password);

    setBusy(false);
    setMessage({ tone: result.ok ? "ok" : "error", text: result.message });

    if (result.ok && authView === "signin") setTimeout(finish, 700);
  };

  if (user) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
          <p className="text-sm font-semibold text-ink">{user.email}</p>
          <p className="mt-1 text-xs text-muted">
            {mode === "supabase" ? "Cloud sync active" : "Local-only session"}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <ButtonLink to="/profile" variant="outline" fullWidth onClick={onDone}>
            Open profile
          </ButtonLink>
          <Button
            variant="ghost"
            fullWidth
            iconLeft={<LogOut size={15} />}
            onClick={() => {
              void signOut().then(() => finish());
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!isConfigured ? (
        <Badge tone="warning" icon={<Wand2 size={11} />}>
          Demo mode — accounts stay disabled until Supabase is configured
        </Badge>
      ) : null}

      <div
        role="tablist"
        aria-label="Authentication options"
        className="grid grid-cols-4 gap-1 rounded-xl bg-surface-2 p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={authView === tab.id}
            onClick={() => setAuthView(tab.id)}
            className={`rounded-lg px-2 py-1.5 text-[0.6875rem] font-semibold transition ${
              authView === tab.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.short}</span>
          </button>
        ))}
      </div>

      <TextInput
        label="Email address"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            void submit();
          }
        }}
      />

      {authView !== "magic" && authView !== "reset" ? (
        <div className="relative">
          <TextInput
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete={authView === "signup" ? "new-password" : "current-password"}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            onKeyDown={(event) => {
              if (event.key === "Enter") void submit();
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-[1.65rem] rounded-lg p-1.5 text-muted transition hover:text-ink"
          >
            {showPassword ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
          </button>
        </div>
      ) : null}

      <Button
        variant="brand"
        fullWidth
        size="lg"
        loading={busy || status === "loading"}
        disabled={!isConfigured}
        iconRight={authView === "reset" ? <KeyRound size={15} /> : <ArrowRight size={15} />}
        onClick={() => void submit()}
      >
        {authView === "signup"
          ? "Create free account"
          : authView === "reset"
            ? "Send reset link"
            : authView === "magic"
              ? "Send magic link"
              : "Sign in"}
      </Button>

      {message ? (
        <p
          role="status"
          className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
            message.tone === "error"
              ? "bg-danger/8 text-danger"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setAuthView(authView === "signin" ? "signup" : "signin")}
        className="text-left text-xs font-semibold text-accent underline-offset-2 hover:underline"
      >
        {authView === "signin" ? "New to Pixora? Create an account" : "Already have an account? Sign in"}
      </button>

      <p className="flex items-start gap-2 border-t border-line pt-3 text-[0.6875rem] leading-relaxed text-muted">
        <Sparkles size={13} className="mt-0.5 shrink-0 text-brand" aria-hidden />
        No account is required — browsing and saving work offline-first on this device. Authentication is
        handled by Supabase; Pixora never stores your password.
      </p>

      {authView === "magic" ? (
        <p className="inline-flex items-center gap-2 text-[0.6875rem] text-muted">
          <Mail size={12} aria-hidden /> Open the link on this device to finish signing in.
        </p>
      ) : null}
    </div>
  );
}
