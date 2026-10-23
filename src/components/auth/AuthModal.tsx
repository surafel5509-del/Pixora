import { Modal } from "@/components/ui/Modal";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { useAuth } from "@/context/AuthProvider";
import { useUI } from "@/context/UIProvider";

export function AuthModal() {
  const { authOpen, authView, closeAuth } = useUI();
  const { user } = useAuth();

  const copy =
    authView === "signup"
      ? { title: "Create your account", description: "Free forever. No card, no trial timer." }
      : authView === "magic"
        ? {
            title: "Sign in with a magic link",
            description: "We'll email a one-time link that signs you in instantly.",
          }
        : authView === "reset"
          ? {
              title: "Reset your password",
              description: "We'll email a secure link to choose a new password.",
            }
          : {
              title: "Welcome back to Pixora",
              description: "Sign in to sync your saved ideas across devices.",
            };

  return (
    <Modal
      open={authOpen}
      onClose={closeAuth}
      size="sm"
      title={user ? "Your account" : copy.title}
      description={user ? "Your library syncs to this account." : copy.description}
    >
      <AuthPanel onDone={closeAuth} />
    </Modal>
  );
}
