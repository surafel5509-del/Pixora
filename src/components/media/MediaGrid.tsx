import type { ReactNode } from "react";
import { ArrowDown, Info, Loader2, RotateCw } from "lucide-react";
import { MediaCard } from "@/components/media/MediaCard";
import { MasonryGrid } from "@/components/media/MasonryGrid";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import type { FeedStatus } from "@/hooks/useMediaFeed";
import type { Density } from "@/types";
import type { MediaItem } from "@shared/types";

interface MediaGridProps {
  items: MediaItem[];
  status: FeedStatus;
  error?: string | null;
  hasMore: boolean;
  degraded?: boolean;
  total?: number;
  density?: Density;
  columns?: number;
  onLoadMore: () => void;
  onRetry?: () => void;
  sentinelRef?: (node: HTMLElement | null) => void;
  emptyState?: ReactNode;
  /** Hides the first N images from lazy loading for a faster LCP. */
  eagerCount?: number;
}

export function MediaGrid({
  items,
  status,
  error,
  hasMore,
  degraded,
  total,
  density = "comfortable",
  columns = 0,
  onLoadMore,
  onRetry,
  sentinelRef,
  emptyState,
  eagerCount = 6,
}: MediaGridProps) {
  const isInitialLoad = status === "loading" && items.length === 0;
  const isLoadingMore = status === "loading-more";

  if (isInitialLoad) return <SkeletonGrid count={10} />;

  if (status === "error" && items.length === 0) {
    return (
      <EmptyState
        tone="danger"
        icon={<Info size={22} aria-hidden />}
        title="We couldn't load this feed"
        description={error ?? "The Pixora media service is unreachable right now."}
        action={
          onRetry ? (
            <Button variant="primary" iconLeft={<RotateCw size={15} />} onClick={onRetry}>
              Try again
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (!isInitialLoad && items.length === 0) {
    return (
      emptyState ?? (
        <EmptyState
          icon={<Info size={22} aria-hidden />}
          title="Nothing here yet"
          description="Try a different search term or pick another category to keep exploring."
        />
      )
    );
  }

  return (
    <div>
      {degraded && status === "ready" ? (
        <p className="mb-4 flex items-start gap-2 rounded-xl border border-line bg-surface-2/60 px-4 py-3 text-xs text-muted">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            Showing the closest matches from the Pixora sample library
            {total ? ` (${total} items)` : ""}. Connect a media provider key for the full catalogue.
          </span>
        </p>
      ) : null}

      <MasonryGrid columns={columns}>
        {items.map((item, index) => (
          <MediaCard
            key={`${item.type}:${item.id}`}
            item={item}
            density={density}
            eager={index < eagerCount}
          />
        ))}
      </MasonryGrid>

      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      <div className="mt-8 flex flex-col items-center gap-4">
        {error && status === "error" ? <p className="text-xs text-danger">{error}</p> : null}

        {isLoadingMore ? (
          <p className="inline-flex items-center gap-2 text-xs text-muted">
            <Loader2 size={14} className="animate-spin" aria-hidden /> Loading more inspiration…
          </p>
        ) : hasMore ? (
          <Button variant="outline" iconLeft={<ArrowDown size={15} />} onClick={onLoadMore}>
            Load more
          </Button>
        ) : items.length > 0 ? (
          <p className="text-xs text-muted">You're all caught up — that's every match for now.</p>
        ) : null}
      </div>
    </div>
  );
}
