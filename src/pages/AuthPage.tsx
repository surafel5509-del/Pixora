import { Check, Cloud, Lock, Sparkles } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { AuthPanel } from "@/components/auth/AuthPanel";

const BENEFITS = [
  {
    icon: Cloud,
    title: "Sync across devices",
    body: "Your saved ideas and boards follow you to any browser.",
  },
  { icon: Lock, title: "Secured by Supabase", body: "Row-level security means only you can read your rows." },
  {
    icon: Sparkles,
    title: "Still free, still local",
    body: "Signing in is optional — the local library always works.",
  },
];

export function AuthPage() {
  return (
    <>
      <Seo
        title="Sign in"
        description="Sign in to Pixora to sync your library across devices."
        path="/auth"
      />

      <div className="mx-auto grid max-w-5xl gap-10 py-6 lg:grid-cols-[1fr_1fr] lg:py-14">
        <div className="flex flex-col justify-center">
          <p className="eyebrow">Account</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            Keep your inspiration close.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Pixora works without an account. Signing in simply mirrors the library you've already built, so
            it's waiting for you on the next device.
          </p>

          <ul className="mt-8 flex flex-col gap-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="flex gap-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/20 text-ink">
                  <benefit.icon size={17} aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{benefit.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted">{benefit.body}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-8 inline-flex items-center gap-2 text-xs text-muted">
            <Check size={13} className="text-brand" aria-hidden /> No credit card, no trial timer, no
            marketing emails.
          </p>
        </div>

        <div className="surface-card h-fit p-6 shadow-card sm:p-8">
          <AuthPanel />
        </div>
      </div>
    </>
  );
}
