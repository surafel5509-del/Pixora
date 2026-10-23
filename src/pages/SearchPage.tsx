import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { DiscoveryFeed } from "@/components/media/DiscoveryFeed";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/Button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLibrary } from "@/context/LibraryProvider";
import { CATEGORIES, TRENDING_TOPICS } from "@shared/taxonomy";
import { pluralise } from "@/lib/utils";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawQuery = searchParams.get("q") ?? "";
  const { recentSearches, clearSearches, recordSearch } = useLibrary();
  const debouncedQuery = useDebouncedValue(rawQuery, 300);

  useEffect(() => {
    if (rawQuery.trim().length >= 2) recordSearch(rawQuery);
  }, [rawQuery, recordSearch]);

  const suggestions = useMemo(
    () => TRENDING_TOPICS.filter((topic) => topic.toLowerCase() !== rawQuery.toLowerCase()).slice(0, 8),
    [rawQuery],
  );

  return (
    <>
      <Seo
        title={rawQuery ? `“${rawQuery}” — Pixora search` : "Search Pixora"}
        description={`Search results for ${rawQuery || "visual inspiration"} on Pixora.`}
        path={`/search?q=${encodeURIComponent(rawQuery)}`}
        noIndex
      />

      <header className="mb-6">
        <p className="eyebrow">Search</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {rawQuery ? (
            <>
              Results for <span className="display-gradient">“{rawQuery}”</span>
            </>
          ) : (
            "What are you looking for?"
          )}
        </h1>
      </header>

      <div className="mb-8 max-w-2xl">
        <SearchBar
          defaultValue={rawQuery}
          autoFocus
          onSubmitted={(term) => setSearchParams({ q: term }, { replace: true })}
        />
        {recentSearches.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted">Recent</span>
            {recentSearches.slice(0, 6).map((entry) => (
              <Link
                key={entry.term}
                to={`/search?q=${encodeURIComponent(entry.term)}`}
                className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted transition hover:border-brand hover:text-ink"
              >
                {entry.term}
              </Link>
            ))}
            <button
              type="button"
              onClick={clearSearches}
              className="text-xs font-semibold text-accent underline-offset-2 hover:underline"
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>

      {rawQuery ? (
        <DiscoveryFeed
          key={debouncedQuery}
          query={debouncedQuery}
          perPage={24}
          heading={`${pluralise(0, "Match").replace("0 ", "")}es for “${rawQuery}”`}
          emptyState={
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
              <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-muted">
                <SearchX size={22} aria-hidden />
              </span>
              <h3 className="text-lg font-bold text-ink">No matches for “{rawQuery}”</h3>
              <p className="mt-2 max-w-md text-sm text-muted">
                Try a broader word, switch between images and video, or start from one of these directions.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestions.slice(0, 5).map((topic) => (
                  <Button
                    key={topic}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchParams({ q: topic })}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.slice(1).map((category) => (
            <Link
              key={category.slug}
              to={`/explore?category=${category.slug}`}
              className="surface-card flex items-start gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <span aria-hidden className="text-xl">
                {category.emoji}
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">{category.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">{category.blurb}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
