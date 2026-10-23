import { Link } from "react-router-dom";
import { FileText, ShieldCheck } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { cn } from "@/lib/utils";

interface LegalSection {
  id: string;
  heading: string;
  body: string[];
}

interface LegalPageProps {
  kind: "privacy" | "terms";
}

const CONTENT: Record<
  "privacy" | "terms",
  { title: string; description: string; updated: string; icon: typeof FileText; sections: LegalSection[] }
> = {
  privacy: {
    title: "Privacy policy",
    description:
      "Pixora collects as little as possible. This page explains exactly what is stored, where it lives and how to remove it.",
    updated: "23 October 2026",
    icon: ShieldCheck,
    sections: [
      {
        id: "summary",
        heading: "The short version",
        body: [
          "Pixora works without an account. Everything you save stays in your browser's local storage on your own device until you choose to sign in.",
          "If you create an account, we store your email address (managed by Supabase Auth) plus the saved items and boards you explicitly add. Nothing else.",
          "There is no advertising network, no third-party analytics and no sale or sharing of your data.",
        ],
      },
      {
        id: "what-we-store",
        heading: "What we store",
        body: [
          "On your device: theme, layout preferences, saved media, boards, likes, recent searches and recently viewed items. All of it is removable from Settings → Your data.",
          "In the cloud (only when you sign in and only when the deployment has Supabase configured): your account email, and the media references you save — title, thumbnail URL, media URL, source page, media type and board assignment.",
          "Server logs: standard infrastructure request logs (URL, status, timestamp, coarse region) used for debugging and abuse prevention.",
        ],
      },
      {
        id: "security",
        heading: "Security",
        body: [
          "All traffic is served over HTTPS. Cloud rows are protected by Postgres row-level security policies so a signed-in user can only read and write their own records.",
          "Secrets — including the media provider API key — are read server-side only and are never exposed to the browser. Never place a service-role key in a VITE_-prefixed environment variable.",
          "Authentication is delegated to Supabase. Pixora never sees or stores your password.",
        ],
      },
      {
        id: "third-parties",
        heading: "Third parties",
        body: [
          "Media is delivered by the Pixabay API through a server-side proxy, or from the bundled sample library when no provider key is configured. Pixora links to original sources rather than re-hosting media.",
          "Fonts are loaded from Google Fonts. Deployments hosted on Vercel are subject to Vercel's infrastructure processing.",
        ],
      },
      {
        id: "your-rights",
        heading: "Your rights",
        body: [
          "Export your entire library as JSON from Settings → Your data at any time.",
          "Delete local data instantly from the same screen. Delete your cloud rows by removing items or contacting the deployment owner to delete the account.",
          "Questions about this policy can be raised as an issue on the public repository.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of use",
    description: "The rules for using Pixora, in plain language.",
    updated: "23 October 2026",
    icon: FileText,
    sections: [
      {
        id: "acceptance",
        heading: "Acceptance",
        body: [
          "By using Pixora you agree to these terms. If you disagree with any part, please stop using the service.",
          "Pixora is provided free of charge and may change or be discontinued at any time without notice.",
        ],
      },
      {
        id: "your-content",
        heading: "Your content",
        body: [
          "You keep ownership of everything you save or contribute. By submitting media you confirm you hold the rights or a licence that permits reuse and sharing.",
          "Public boards may be visible to others. Keep private or unlicensed material out of public collections.",
        ],
      },
      {
        id: "acceptable-use",
        heading: "Acceptable use",
        body: [
          "Do not attempt to disrupt the service, scrape it aggressively, or circumvent rate limits.",
          "Do not upload or submit unlawful, infringing, or harmful content. Reports can be filed through the public repository.",
        ],
      },
      {
        id: "media-licensing",
        heading: "Media licensing",
        body: [
          "Pixora surfaces media from third-party providers and links to the original source. Licence terms of the original provider apply to any download or reuse.",
          "The bundled sample library is for demonstration purposes and should be replaced with your own licensed media before a production launch.",
        ],
      },
      {
        id: "liability",
        heading: "Liability",
        body: [
          "Pixora is provided “as is” without warranties of any kind. The maintainers are not liable for indirect or consequential damages arising from use of the service.",
          "Nothing in these terms limits rights you have under applicable consumer law.",
        ],
      },
    ],
  },
};

export function LegalPage({ kind }: LegalPageProps) {
  const content = CONTENT[kind];

  return (
    <>
      <Seo title={content.title} description={content.description} path={`/${kind}`} />

      <div className="grid gap-10 py-6 lg:grid-cols-[1fr_3fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {content.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{content.description}</p>
          <p className="mt-4 text-xs text-muted">Last updated {content.updated}</p>

          <nav aria-label="On this page" className="mt-6 flex flex-col gap-1.5">
            {content.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm text-muted transition hover:text-ink"
              >
                {section.heading}
              </a>
            ))}
          </nav>

          <div className="mt-6 flex flex-col gap-1.5 text-sm">
            <Link
              to="/privacy"
              className={cn(kind === "privacy" ? "font-semibold text-ink" : "text-muted hover:text-ink")}
            >
              Privacy policy
            </Link>
            <Link
              to="/terms"
              className={cn(kind === "terms" ? "font-semibold text-ink" : "text-muted hover:text-ink")}
            >
              Terms of use
            </Link>
          </div>
        </aside>

        <div className="flex flex-col gap-8">
          {content.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                <content.icon size={17} aria-hidden className="text-brand" />
                {section.heading}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="text-sm leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
