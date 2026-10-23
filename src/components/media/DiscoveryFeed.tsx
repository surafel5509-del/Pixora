import { useMemo, useState, type ReactNode } from "react";
import { Image as ImageIcon, RefreshCw, Video } from "lucide-react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { Button } from "@/components/ui/Button";
import { useMediaFeed } from "@/hooks/useMediaFeed";
import { useSettings } from "@/context/SettingsProvider";
import { cn, formatCompact, formatNumber } from "@/lib/utils";
import type { MediaType } from "@shared/types";

interface DiscoveryFeedProps {
  query?: string;
  category?: string;
  initialType?: MediaType;
  perPage?: number;
  allowTypeSwitch?: boolean;
  allowRefresh?: boolean;
  heading?: string;
  description?: string;
  emptyState?: ReactNode;
  className?: string;
  eagerCount?: number;
}

const TYPE_OPTIONS: { value: MediaType; label: string; icon: typeof ImageIcon }[] = [
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "video", label: "Videos", icon: Video },
];

export function DiscoveryFeed({
  query = "",
  category = "for-you",
  initialType = "image",
  perPage = 24,
  allowTypeSwitch = true,
  allowRefresh = true,
  heading,
  description,
  emptyState,
  className,
  eagerCount = 6,
}: DiscoveryFeedProps) {
  const [type, setType] = useState<MediaType>(initialType);
  const [seed, setSeed] = useState(() => String(Date.now()));
  const { preferences } = useSettings();

  const feed = useMediaFeed({ query, type, category, perPage, seed });

  const summary = useMemo(() => {
    if (feed.status === "loading") return "Loading…";
    if (!feed.total) return "";
    return `${formatNumber(feed.total)} results · ${feed.tookMs}ms`;
  }, [feed.status, feed.total, feed.tookMs]);

  return (
    <section className={className} aria-label={heading ?? "Discovery feed"}>
      {(heading || allowTypeSwitch || allowRefresh) && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            {heading ? <h2 className="text-xl font-extrabold text-ink sm:text-2xl">{heading}</h2> : null}
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>

          <div className="flex items-center gap-2">
            {allowTypeSwitch ? (
              <div
                role="tablist"
                aria-label="Media type"
                className="flex items-center gap-1 rounded-xl border border-line bg-surface p-1"
              >
                {TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    role="tab"
                    type="button"
                    aria-selected={type === option.value}
                    onClick={() => setType(option.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                      type === option.value
                        ? "bg-ink text-canvas"
                        : "text-muted hover:bg-surface-2 hover:text-ink",
                    )}
                  >
                    <option.icon size={14} aria-hidden />
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {allowRefresh ? (
              <Button
                variant="outline"
                size="sm"
                iconLeft={<RefreshCw size={14} className={cn(feed.status === "loading" && "animate-spin")} />}
                onClick={() => setSeed(String(Date.now()))}
              >
                <span className="hidden sm:inline">Shuffle</span>
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {summary ? (
        <p className="mb-3 text-xs tabular-nums text-muted">
          {summary}
          {feed.total ? ` · ${formatCompact(feed.total)} total` : ""}
        </p>
      ) : null}

      <MediaGrid
        items={feed.items}
        status={feed.status}
        error={feed.error}
        hasMore={feed.hasMore}
        degraded={feed.degraded}
        total={feed.total}
        density={preferences.density}
        columns={preferences.columns}
        onLoadMore={feed.loadMore}
        onRetry={feed.refresh}
        sentinelRef={feed.sentinelRef}
        emptyState={emptyState}
        eagerCount={eagerCount}
      />
    </section>
  );
}
