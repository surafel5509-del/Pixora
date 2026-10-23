import { Link } from "react-router-dom";
import { Compass, Github, Rocket, Sparkles } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FEATURES, CHANGELOG } from "@/data/content";

const STACK = [
  {
    name: "React 19 + TypeScript",
    detail: "Strict types, component isolation, zero-prop-drilling via context.",
  },
  { name: "Vite", detail: "Instant dev server, optimised production bundles and SSR-ready routing." },
  {
    name: "Tailwind CSS 4",
    detail: "Tokenised design system with first-class dark mode and reduced motion.",
  },
  {
    name: "Serverless API layer",
    detail: "Edge cacheable media endpoints with rate limiting and graceful fallback.",
  },
  { name: "Supabase", detail: "Optional auth, Postgres and row-level security for cross-device sync." },
  { name: "Vitest + Testing Library", detail: "Unit and component tests wired into CI on every push." },
];

export function AboutPage() {
  return (
    <>
      <Seo
        title="About Pixora"
        description="Pixora is a free, privacy-first visual discovery platform built for photographers, designers and the endlessly curious."
        path="/about"
      />

      <section className="mesh-bg -mx-4 mb-16 border-b border-line px-4 py-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="max-w-3xl">
          <Badge tone="brand" icon={<Sparkles size={11} />}>
            Our story
          </Badge>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Inspiration deserves a quieter home.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Most discovery platforms are built to keep you scrolling, not making. Pixora takes the opposite
            approach: a fast, deliberate space where you search with intent, save only what earns it, and
            leave with something you can actually build. No feed ranking for engagement, no ads, no
            subscription walls.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/explore" variant="primary" size="lg" iconLeft={<Compass size={16} />}>
              Start exploring
            </ButtonLink>
            <a
              href="https://github.com/surafel5509-del/Pixora"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-surface px-6 text-[0.9375rem] font-semibold text-ink transition hover:bg-surface-2"
            >
              <Github size={16} aria-hidden /> View the source
            </a>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <SectionHeading
          eyebrow="Principles"
          title="What we optimise for"
          description="Four commitments shape every feature decision in the product."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Speed is a feature",
              body: "Edge-cached responses, progressive imagery and a masonry layout that never blocks the main thread.",
            },
            {
              title: "Privacy is the default",
              body: "Your library lives on your device. Cloud sync is opt-in, encrypted in transit and scoped by row-level security.",
            },
            {
              title: "Free first, always",
              body: "No paid APIs, no premium tier, no upsells. The whole product runs on free-tier infrastructure.",
            },
            {
              title: "Open and inspectable",
              body: "The codebase is public, the data model is documented and your library can be exported at any time.",
            },
          ].map((item) => (
            <article key={item.title} className="surface-card p-6">
              <h3 className="text-base font-bold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <SectionHeading eyebrow="Capabilities" title="Everything in the box" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="surface-card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/20 text-ink">
                <feature.icon size={18} aria-hidden />
              </span>
              <h3 className="mt-4 text-sm font-bold text-ink">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-20 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div id="stack">
          <SectionHeading eyebrow="Engineering" title="How it's built" />
          <dl className="mt-6 flex flex-col divide-y divide-line">
            {STACK.map((entry) => (
              <div key={entry.name} className="py-4">
                <dt className="text-sm font-bold text-ink">{entry.name}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">{entry.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div id="changelog" className="scroll-mt-24">
          <SectionHeading eyebrow="Changelog" title="Release notes" />
          <ol className="mt-6 flex flex-col gap-4">
            {CHANGELOG.map((entry) => (
              <li key={entry.version} className="surface-card p-6">
                <div className="flex items-center gap-3">
                  <Badge tone="brand">v{entry.version}</Badge>
                  <span className="text-xs text-muted">{entry.date}</span>
                </div>
                <h3 className="mt-3 text-base font-bold text-ink">{entry.title}</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {entry.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                      <Rocket size={14} className="mt-1 shrink-0 text-brand" aria-hidden />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-ink px-6 py-14 text-center">
        <h2 className="font-display text-3xl font-extrabold text-canvas sm:text-4xl">
          Go find something worth keeping.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-canvas/70">
          Pixora is free, private and ready right now — no account required.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink to="/explore" variant="brand" size="lg">
            Open Explore
          </ButtonLink>
          <Link
            to="/help"
            className="text-sm font-semibold text-canvas/80 underline-offset-4 hover:underline"
          >
            Read the help centre
          </Link>
        </div>
      </section>
    </>
  );
}
