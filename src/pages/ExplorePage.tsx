import { useSearchParams } from "react-router-dom";
import { Seo } from "@/components/common/Seo";
import { DiscoveryFeed } from "@/components/media/DiscoveryFeed";
import { CATEGORIES, categoryBySlug } from "@shared/taxonomy";
import { cn } from "@/lib/utils";

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category") ?? "for-you";
  const category = categoryBySlug(categorySlug) ?? CATEGORIES[0];

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug === "for-you") next.delete("category");
    else next.set("category", slug);
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <Seo
        title={`Explore ${category.label}`}
        description={`Browse ${category.label.toLowerCase()} inspiration on Pixora — ${category.blurb.toLowerCase()}.`}
        path={`/explore${categorySlug === "for-you" ? "" : `?category=${categorySlug}`}`}
      />

      <header className="mb-6">
        <p className="eyebrow">Explore</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {category.label}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {categorySlug === "for-you"
            ? "Everything, mixed fresh. Switch between images and video, or narrow it down to a single discipline."
            : category.blurb}
        </p>
      </header>

      <div className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {CATEGORIES.map((entry) => (
          <button
            key={entry.slug}
            type="button"
            onClick={() => setCategory(entry.slug)}
            aria-pressed={entry.slug === categorySlug}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition",
              entry.slug === categorySlug
                ? "border-transparent bg-ink text-canvas"
                : "border-line bg-surface text-muted hover:border-brand hover:text-ink",
            )}
          >
            <span aria-hidden className="mr-1.5">
              {entry.emoji}
            </span>
            {entry.label}
          </button>
        ))}
      </div>

      <DiscoveryFeed
        key={categorySlug}
        category={categorySlug}
        perPage={24}
        heading={`${category.label} inspiration`}
        description="Scroll for more — new results load automatically as you reach the end."
      />
    </>
  );
}
