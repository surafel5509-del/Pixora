import { useCallback, useEffect, useRef, useState } from "react";
import { MediaApiError, fetchMedia } from "@/lib/media-api";
import type { MediaItem, MediaType } from "@shared/types";

export type FeedStatus = "loading" | "loading-more" | "ready" | "error";

export interface UseMediaFeedOptions {
  query?: string;
  type?: MediaType;
  category?: string;
  seed?: string;
  perPage?: number;
  enabled?: boolean;
}

export interface MediaFeedState {
  items: MediaItem[];
  status: FeedStatus;
  error: string | null;
  total: number;
  hasMore: boolean;
  source: "pixabay" | "demo";
  degraded: boolean;
  tookMs: number;
  loadMore: () => void;
  refresh: () => void;
  sentinelRef: (node: HTMLElement | null) => void;
}

function dedupe(items: MediaItem[]): MediaItem[] {
  const seen = new Set<string>();
  const output: MediaItem[] = [];
  for (const item of items) {
    const key = `${item.type}:${item.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

/**
 * Infinite, abort-safe discovery feed.
 *
 * Handles request cancellation on parameter changes, deduplicates paginated
 * results, exposes an infinite-scroll sentinel callback and never leaves a
 * stale response able to overwrite a newer one.
 */
export function useMediaFeed(options: UseMediaFeedOptions = {}): MediaFeedState {
  const {
    query = "",
    type = "image",
    category = "for-you",
    seed = "pixora",
    perPage = 24,
    enabled = true,
  } = options;

  const [items, setItems] = useState<MediaItem[]>([]);
  const [status, setStatus] = useState<FeedStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [source, setSource] = useState<"pixabay" | "demo">("demo");
  const [degraded, setDegraded] = useState(false);
  const [tookMs, setTookMs] = useState(0);

  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);

  const feedKey = `${query}|${type}|${category}|${seed}|${perPage}|${reloadToken}`;
  const feedKeyRef = useRef(feedKey);
  const hasMoreRef = useRef(false);
  const statusRef = useRef(status);
  hasMoreRef.current = hasMore;
  statusRef.current = status;

  useEffect(() => {
    if (!enabled) return;

    const isNewFeed = feedKeyRef.current !== feedKey;
    feedKeyRef.current = feedKey;
    const targetPage = isNewFeed ? 1 : page;

    if (isNewFeed && page !== 1) {
      setPage(1);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setStatus(targetPage === 1 ? "loading" : "loading-more");

    fetchMedia({ q: query, type, category, page: targetPage, perPage, seed, signal: controller.signal })
      .then((response) => {
        if (cancelled) return;
        setItems((previous) => dedupe(targetPage === 1 ? response.items : [...previous, ...response.items]));
        setTotal(response.total);
        setHasMore(response.hasMore);
        setSource(response.source);
        setDegraded(response.degraded);
        setTookMs(response.tookMs);
        setError(null);
        setStatus("ready");
      })
      .catch((cause: unknown) => {
        if (cancelled || (cause instanceof DOMException && cause.name === "AbortError")) return;
        setStatus("error");
        setError(
          cause instanceof MediaApiError
            ? cause.message
            : "We couldn't reach the Pixora media service. Check your connection and try again.",
        );
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedKey, page, enabled]);

  useEffect(() => {
    if (!enabled || !sentinel || !hasMore) return;
    if (status === "loading" || status === "loading-more") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && hasMoreRef.current) {
          if (statusRef.current === "loading" || statusRef.current === "loading-more") return;
          setPage((current) => current + 1);
        }
      },
      { rootMargin: "800px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, hasMore, status, enabled]);

  const loadMore = useCallback(() => {
    if (!hasMoreRef.current) return;
    if (statusRef.current === "loading" || statusRef.current === "loading-more") return;
    setPage((current) => current + 1);
  }, []);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return {
    items,
    status,
    error,
    total,
    hasMore,
    source,
    degraded,
    tookMs,
    loadMore,
    refresh,
    sentinelRef: setSentinel,
  };
}
