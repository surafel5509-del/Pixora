import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Heart, ImageOff, Play, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useLibrary } from "@/context/LibraryProvider";
import { cn, formatCompact } from "@/lib/utils";
import type { MediaItem } from "@shared/types";

export type CardDensity = "comfortable" | "compact";

interface MediaCardProps {
  item: MediaItem;
  density?: CardDensity;
  eager?: boolean;
  showStats?: boolean;
  className?: string;
}

function MediaCardBase({
  item,
  density = "comfortable",
  eager = false,
  showStats = true,
  className,
}: MediaCardProps) {
  const { isSaved, toggleSave, isLiked, toggleLike } = useLibrary();
  const [failed, setFailed] = useState(false);

  const saved = isSaved(item);
  const liked = isLiked(item);
  const ratio = item.width && item.height ? `${item.width} / ${item.height}` : "4 / 5";
  const compact = density === "compact";

  return (
    <article
      className={cn("group relative mb-4 break-inside-avoid animate-fade-up", compact && "mb-3", className)}
    >
      <Link
        to={`/media/${item.type}/${item.id}`}
        aria-label={`Open ${item.title} by ${item.creator}`}
        className="relative block overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-line/70 transition-shadow duration-300 group-hover:shadow-card"
        style={{ aspectRatio: ratio }}
      >
        {failed ? (
          <span className="absolute inset-0 grid place-items-center text-muted">
            <ImageOff size={26} aria-hidden />
          </span>
        ) : (
          <img
            src={item.thumbnail || item.preview}
            alt={item.title}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        )}

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
        />

        {item.type === "video" ? (
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition group-hover:scale-110">
              <Play size={18} fill="currentColor" aria-hidden />
            </span>
          </span>
        ) : null}

        <span className="pointer-events-none absolute bottom-2.5 left-2.5 rounded-md bg-black/45 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {item.type === "video" ? "Video" : "Photo"}
        </span>
      </Link>

      <div className="pointer-events-none absolute right-2.5 top-2.5 flex flex-col gap-2 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100 max-sm:opacity-100">
        <button
          type="button"
          onClick={() => toggleSave(item)}
          aria-label={saved ? `Remove ${item.title} from your library` : `Save ${item.title}`}
          aria-pressed={saved}
          className={cn(
            "pointer-events-auto grid h-9 w-9 place-items-center rounded-xl shadow-sm backdrop-blur transition hover:scale-105",
            saved ? "bg-brand text-brand-ink" : "bg-surface/90 text-ink hover:bg-surface",
          )}
        >
          {saved ? <BookmarkCheck size={16} aria-hidden /> : <Bookmark size={16} aria-hidden />}
        </button>

        <button
          type="button"
          onClick={() => toggleLike(item)}
          aria-label={liked ? `Unlike ${item.title}` : `Like ${item.title}`}
          aria-pressed={liked}
          className={cn(
            "pointer-events-auto grid h-9 w-9 place-items-center rounded-xl bg-surface/90 shadow-sm backdrop-blur transition hover:scale-105",
            liked ? "text-red-500" : "text-muted hover:text-ink",
          )}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} aria-hidden />
        </button>
      </div>

      <div className={cn("flex items-start gap-2", compact ? "px-0.5 pt-2" : "px-0.5 pt-3")}>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[0.8125rem] font-semibold text-ink">
            <Link to={`/media/${item.type}/${item.id}`} className="hover:underline">
              {item.title}
            </Link>
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-[0.6875rem] text-muted">
            <Avatar name={item.creator} size={compact ? 16 : 18} />
            <span className="truncate">{item.creator}</span>
            {showStats && item.likes > 0 ? (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <Heart size={10} aria-hidden /> {formatCompact(item.likes)}
                </span>
              </>
            ) : null}
          </div>
        </div>
        {item.source === "demo" ? (
          <Sparkles size={12} className="mt-1 shrink-0 text-muted/60" aria-label="Pixora sample library" />
        ) : null}
      </div>
    </article>
  );
}

export const MediaCard = memo(MediaCardBase);
