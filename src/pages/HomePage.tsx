import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, Compass, Sparkles, TrendingUp, Wand2 } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { DiscoveryFeed } from "@/components/media/DiscoveryFeed";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLibrary } from "@/context/LibraryProvider";
import { useUI } from "@/context/UIProvider";
import { CATEGORIES, TRENDING_TOPICS } from "@shared/taxonomy";
import { DEMO_LIBRARY } from "@shared/demo-library";
import { FEATURES } from "@/data/content";
import { SearchBar } from "@/components/search/SearchBar";
import { formatCompact } from "@/lib/utils";

const HERO_COLLAGE = DEMO_LIBRARY.filter((item) => item.type === "image").slice(0, 6);

export function HomePage() {
  const { stats } = useLibrary();
  const { openAuth } = useUI();

  return (
    <>
      <Seo
        title="Pixora — find your next big idea"
        description="Pixora is a fast, private visual discovery platform. Search photography, design, architecture and film, save what moves you, and build boards that follow your taste."
        path="/"
      />

      {/* Hero ------------------------------------------------------------- */}
      <section className="mesh-bg relative -mx-4 overflow-hidden border-b border-line px-4 pb-16 pt-10 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-2xl animate-fade-up">
            <Badge tone="brand" icon={<Sparkles size={11} />}>
              Free first · No subscription required
            </Badge>

            <h1 className="mt-5 font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[4.25rem]">
              Find your next
              <span className="display-gradient"> big idea</span>,
              <br className="hidden sm:block" /> then build the board.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Pixora is a calm, fast home for visual research — search photography, design, architecture and
              film, save what moves you, and let your library grow into something you can actually make from.
            </p>

            <div className="mt-7 max-w-xl">
              <SearchBar size="md" placeholder="Try “brutalist concrete” or “golden hour”" />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <TrendingUp size={13} aria-hidden /> Trending
                </span>
                {TRENDING_TOPICS.slice(0, 4).map((topic) => (
                  <Link
                    key={topic}
                    to={`/search?q=${encodeURIComponent(topic)}`}
                    className="rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-muted transition hover:border-brand hover:text-ink"
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink to="/explore" size="lg" variant="primary" iconRight={<ArrowRight size={16} />}>
                Start exploring
              </ButtonLink>
              <Button
                variant="outline"
                size="lg"
                iconLeft={<Compass size={16} />}
                onClick={() => openAuth("signup")}
              >
                Create a free account
              </Button>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                { label: "Curated pieces", value: `${formatCompact(12400)}+` },
                { label: "Categories", value: String(CATEGORIES.length) },
                { label: "In your library", value: String(stats.saved) },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-muted">{item.label}</dt>
                  <dd className="mt-1 font-display text-xl font-extrabold text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden lg:block">
            <div className="grid grid-cols-3 gap-3">
              {HERO_COLLAGE.map((item, index) => (
                <Link
                  key={item.id}
                  to={`/media/${item.type}/${item.id}`}
                  className={`group relative overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-card transition-transform duration-500 hover:z-10 hover:scale-[1.03] ${
                    index % 3 === 1 ? "mt-8" : index % 3 === 2 ? "mt-4" : ""
                  } ${index === 0 ? "animate-float" : ""}`}
                  style={{ aspectRatio: "4 / 5" }}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    loading="eager"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-[0.6875rem] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand/25 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Categories ------------------------------------------------------- */}
      <section className="border-b border-line py-10">
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              to={`/explore?category=${category.slug}`}
              className="group flex min-w-[13rem] shrink-0 items-start gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-brand hover:shadow-card"
            >
              <span aria-hidden className="text-xl leading-none">
                {category.emoji}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink">{category.label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">{category.blurb}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Feed ------------------------------------------------------------- */}
      <DiscoveryFeed
        className="pt-10"
        heading="Fresh for you"
        description="A rotating selection from across the catalogue. Shuffle whenever you want a new perspective."
        category="for-you"
        perPage={18}
      />

      {/* Features --------------------------------------------------------- */}
      <section className="mt-20">
        <SectionHeading
          eyebrow="Why Pixora"
          title="Built like a studio tool, priced like a hobby"
          description="Every decision favours speed, clarity and privacy — so the tool disappears and the work stays in front of you."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="surface-card group p-6 transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/20 text-ink">
                <feature.icon size={19} aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA -------------------------------------------------------------- */}
      <section className="relative mt-20 overflow-hidden rounded-3xl border border-line bg-ink px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <Badge tone="brand" icon={<Wand2 size={11} />}>
            Boards are live
          </Badge>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-canvas sm:text-4xl">
            Turn scattered saves into a direction.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-canvas/70 sm:text-base">
            Group references into colour-coded boards, reorder by instinct and share a single link when the
            concept is ready.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink to="/boards" size="lg" variant="brand" iconLeft={<Bookmark size={16} />}>
              Open your boards
            </ButtonLink>
            <ButtonLink
              to="/about"
              size="lg"
              variant="outline"
              className="border-canvas/25 bg-transparent text-canvas hover:bg-canvas/10"
            >
              Read the story
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
