import { useMemo, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/common/Seo";
import { MediaCard } from "@/components/media/MediaCard";
import { MasonryGrid } from "@/components/media/MasonryGrid";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stat } from "@/components/ui/SectionHeading";
import { useLibrary } from "@/context/LibraryProvider";
import { useSettings } from "@/context/SettingsProvider";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
] as const;

export function SavedPage() {
  const { saved, stats, clearSaved, removeSaved, syncState } = useLibrary();
  const { preferences } = useSettings();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const items = useMemo(
    () =>
      saved
        .filter((entry) => (filter === "all" ? true : entry.media.type === filter))
        .map((entry) => entry.media),
    [saved, filter],
  );

  return (
    <>
      <Seo
        title="Saved ideas"
        description="Everything you've saved on Pixora, organised in one place."
        path="/saved"
      />

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your library</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Saved ideas
          </h1>
          <p className="mt-2 text-sm text-muted">
            {saved.length
              ? `${saved.length} piece${saved.length === 1 ? "" : "s"} kept on this device`
              : "Nothing saved yet"}
            {syncState === "synced" ? " · synced to your account" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink to="/boards" variant="outline" size="sm">
            Manage boards
          </ButtonLink>
          {saved.length ? (
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<Trash2 size={14} />}
              onClick={() => {
                if (window.confirm("Remove every saved item from this device?")) clearSaved();
              }}
            >
              Clear all
            </Button>
          ) : null}
        </div>
      </header>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Saved" value={stats.saved} hint="Across every board" icon={<Bookmark size={15} />} />
        <Stat label="Boards" value={stats.boards} hint="Collections you curate" />
        <Stat label="Images" value={stats.images} hint="Photos and stills" />
        <Stat label="Videos" value={stats.videos} hint="Clips and loops" />
      </div>

      {saved.length ? (
        <>
          <div className="mb-5 inline-flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
            {FILTERS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setFilter(entry.id)}
                aria-pressed={filter === entry.id}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition",
                  filter === entry.id ? "bg-ink text-canvas" : "text-muted hover:text-ink",
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <MasonryGrid columns={preferences.columns}>
            {items.map((media, index) => (
              <div key={`${media.type}:${media.id}`} className="group relative">
                <MediaCard item={media} density={preferences.density} eager={index < 6} />
                <button
                  type="button"
                  onClick={() => removeSaved(`${media.type}:${media.id}`)}
                  className="absolute bottom-14 right-2.5 rounded-lg border border-line bg-surface/90 px-2 py-1 text-[0.625rem] font-semibold text-muted transition hover:text-danger focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </MasonryGrid>
        </>
      ) : (
        <EmptyState
          icon={<Bookmark size={22} aria-hidden />}
          title="Your library is empty"
          description="Tap the bookmark on any card to keep it here. Sign in and your library follows you across devices."
          action={
            <>
              <ButtonLink to="/explore" variant="primary">
                Explore inspiration
              </ButtonLink>
              <Link
                to="/boards"
                className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
              >
                Create a board first
              </Link>
            </>
          }
        />
      )}
    </>
  );
}
