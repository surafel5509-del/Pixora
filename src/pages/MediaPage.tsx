import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Download,
  ExternalLink,
  Heart,
  Maximize2,
  Share2,
  Sparkles,
  Tag,
} from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { DiscoveryFeed } from "@/components/media/DiscoveryFeed";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useLibrary } from "@/context/LibraryProvider";
import { useUI } from "@/context/UIProvider";
import { useToast } from "@/context/ToastProvider";
import { fetchMediaById } from "@/lib/media-api";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { SITE_URL } from "@/lib/env";
import { formatCompact, formatNumber } from "@/lib/utils";
import type { MediaItem, MediaType } from "@shared/types";

export function MediaPage() {
  const { type: rawType, id } = useParams<{ type: string; id: string }>();
  const type: MediaType = rawType === "video" ? "video" : "image";
  const navigate = useNavigate();
  const toast = useToast();
  const { copy, copied } = useCopyToClipboard();
  const { isSaved, toggleSave, isLiked, toggleLike, recordView } = useLibrary();
  const { openSaveDialog } = useUI();

  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);

    void fetchMediaById(id, type)
      .then((result) => {
        if (!active) return;
        if (!result) {
          setError("That piece isn't available any more.");
          return;
        }
        setItem(result);
        recordView(result);
      })
      .catch(() => active && setError("We couldn't load this piece. Check your connection and try again."))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id, type, recordView]);

  const goBack = useCallback(() => {
    if (window.history.length > 2) {
      void navigate(-1);
      return;
    }
    void navigate("/explore");
  }, [navigate]);

  useKeyboardShortcuts({ escape: () => goBack() });

  const share = useCallback(async () => {
    const url = `${SITE_URL}/media/${type}/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item?.title ?? "Pixora", text: item?.title, url });
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    const ok = await copy(url);
    toast.notify({
      title: ok ? "Link copied" : "Copy this page URL to share",
      variant: ok ? "success" : "info",
    });
  }, [copy, id, item?.title, toast, type]);

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <EmptyState
        tone="danger"
        icon={<Sparkles size={22} aria-hidden />}
        title={error ?? "Not found"}
        description="The piece may have been removed, or the link is incomplete."
        action={
          <Button
            variant="primary"
            iconLeft={<ArrowLeft size={15} />}
            onClick={() => {
              void navigate("/explore");
            }}
          >
            Back to explore
          </Button>
        }
      />
    );
  }

  const saved = isSaved(item);
  const liked = isLiked(item);
  const permalink = `/media/${item.type}/${item.id}`;

  return (
    <>
      <Seo
        title={item.title}
        description={`${item.title} by ${item.creator} on Pixora — ${item.tags.slice(0, 5).join(", ")}.`}
        path={permalink}
        image={item.preview || item.thumbnail}
        type="article"
        jsonLd={{
          "@type": item.type === "video" ? "VideoObject" : "ImageObject",
          name: item.title,
          description: item.description,
          contentUrl: item.type === "video" ? (item.video ?? item.full) : item.full,
          thumbnailUrl: item.thumbnail,
          author: { "@type": "Person", name: item.creator },
        }}
      />

      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden /> Back
        </button>
        <a
          href={item.full}
          target="_blank"
          rel="noreferrer"
          aria-label="Open full size in a new tab"
          title="Open full size"
          className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          <Maximize2 size={16} aria-hidden />
        </a>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div className="overflow-hidden rounded-3xl border border-line bg-surface-2 shadow-card">
          {item.type === "video" ? (
            <video
              controls
              autoPlay
              muted
              loop
              playsInline
              poster={item.preview || item.thumbnail}
              className="h-full w-full bg-black"
            >
              <source src={item.video ?? item.full} type="video/mp4" />
              Your browser can't play this video.
            </video>
          ) : (
            <img
              src={item.preview || item.full}
              alt={item.title}
              className="h-full w-full object-contain"
              style={{ maxHeight: "78vh" }}
            />
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone={item.type === "video" ? "accent" : "brand"}>
                {item.type === "video" ? "Video" : "Photo"}
              </Badge>
              {item.source === "demo" ? <Badge icon={<Sparkles size={11} />}>Sample library</Badge> : null}
            </div>
            <h1 className="font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
              {item.title}
            </h1>
            {item.description ? (
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5">
            <Avatar name={item.creator} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{item.creator}</p>
              <p className="text-xs text-muted">{item.attribution}</p>
            </div>
            <Button variant="outline" size="sm">
              Follow
            </Button>
          </div>

          <dl className="grid grid-cols-3 gap-3">
            {[
              { label: "Likes", value: formatCompact(item.likes) },
              { label: "Views", value: formatCompact(item.views) },
              {
                label: "Dimensions",
                value: item.width && item.height ? `${item.width}×${item.height}` : "—",
              },
            ].map((entry) => (
              <div key={entry.label} className="rounded-2xl border border-line bg-surface p-3 text-center">
                <dt className="text-[0.625rem] font-semibold uppercase tracking-wide text-muted">
                  {entry.label}
                </dt>
                <dd className="mt-1 text-sm font-bold tabular-nums text-ink">{entry.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                variant={saved ? "secondary" : "brand"}
                size="lg"
                fullWidth
                iconLeft={saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                onClick={() => toggleSave(item)}
              >
                {saved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" size="lg" onClick={() => openSaveDialog(item)}>
                Add to board
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                fullWidth
                iconLeft={<Heart size={15} fill={liked ? "currentColor" : "none"} />}
                onClick={() => toggleLike(item)}
              >
                {liked ? "Liked" : "Like"}
              </Button>
              <Button
                variant="outline"
                fullWidth
                iconLeft={<Share2 size={15} />}
                onClick={() => void share()}
              >
                {copied ? "Copied" : "Share"}
              </Button>
              <a
                href={item.type === "video" ? (item.video ?? item.full) : item.full}
                target="_blank"
                rel="noreferrer"
                download={`pixora-${item.id}`}
                className="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-line px-4 text-sm font-semibold text-ink transition hover:bg-surface-2"
              >
                <Download size={15} aria-hidden /> Download
              </a>
            </div>
          </div>

          {item.tags.length ? (
            <div>
              <p className="eyebrow mb-2.5 flex items-center gap-1.5">
                <Tag size={12} aria-hidden /> Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted transition hover:border-brand hover:text-ink"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {item.pageUrl ? (
            <a
              href={item.pageUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-ink"
            >
              <ExternalLink size={13} aria-hidden /> View original source
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}

          <p className="border-t border-line pt-4 text-[0.6875rem] leading-relaxed text-muted">
            {formatNumber(item.views)} views · Saved {formatCompact(item.likes)} times · Free to use under the{" "}
            {item.attribution} licence. Pixora links to the original source and never re-hosts media without
            permission.
          </p>
        </div>
      </div>

      <DiscoveryFeed
        className="mt-20"
        query={item.tags[0] ?? item.title.split(" ")[0]}
        initialType={item.type}
        allowTypeSwitch={false}
        allowRefresh
        perPage={12}
        heading="More like this"
        description={`Pieces that share the mood of “${item.tags[0] ?? item.title}”.`}
      />
    </>
  );
}
