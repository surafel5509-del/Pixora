/**
 * GET /api/media
 *
 * Query parameters:
 *   q          search term (optional, defaults to the category query)
 *   type       "image" | "video"
 *   category   taxonomy slug, e.g. "architecture"
 *   page       1-based page number (1..50)
 *   per_page   page size (6..30)
 *   seed       rotation seed for "For you" style feeds
 *   id         fetch a single item by provider id
 *
 * Always answers with a well-formed feed: when the upstream provider is
 * unavailable or unconfigured it transparently serves the bundled demo library
 * and flags the response with `source: "demo"` / `degraded: true`.
 */

import { TtlCache } from "./_lib/cache";
import { searchDemo, findDemoById } from "./_lib/demo";
import {
  applyBaseHeaders,
  ensureReadMethod,
  enumParam,
  intParam,
  sendError,
  sendJson,
  stringParam,
  type ApiRequest,
  type ApiResponse,
} from "./_lib/http";
import { isProviderConfigured, searchPixabay } from "./_lib/pixabay";
import { rateLimit } from "./_lib/rateLimit";
import type { MediaItem, MediaResponse } from "../shared/types";

const cache = new TtlCache<MediaResponse>(10 * 60 * 1000);
const MEDIA_TYPES = ["image", "video"] as const;

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const startedAt = Date.now();

  applyBaseHeaders(res);
  if (!ensureReadMethod(req, res)) return;

  const limit = rateLimit(req, 60, 60_000);
  res.setHeader("X-RateLimit-Remaining", String(limit.remaining));
  if (!limit.allowed) {
    res.setHeader("Retry-After", String(limit.retryAfterSeconds));
    sendError(res, 429, "Too many requests. Please slow down and try again shortly.");
    return;
  }

  const id = stringParam(req.query.id, "", 48);
  const type = enumParam(req.query.type, MEDIA_TYPES, "image");
  const rawQuery = stringParam(req.query.q, "", 80);
  const category = stringParam(req.query.category, "for-you", 40).toLowerCase();
  const page = intParam(req.query.page, 1, 1, 50);
  const perPage = intParam(req.query.per_page, 24, 6, 30);
  const seed = stringParam(req.query.seed, "pixora", 40);
  const query = rawQuery || category;

  const cacheKey = [id, type, query, category, page, perPage, seed].join("|");
  const cached = cache.get(cacheKey);
  if (cached) {
    sendJson(res, 200, { ...cached, tookMs: Date.now() - startedAt });
    return;
  }

  const providerReady = isProviderConfigured();
  let items: MediaItem[] = [];
  let total = 0;
  let usedProvider = false;

  if (id) {
    // Single item: prefer the demo library for demo ids, otherwise the provider.
    const demoItem = findDemoById(id);
    if (demoItem && (demoItem.type === type || !id.startsWith("demo-"))) {
      items = [demoItem];
      total = 1;
    } else if (providerReady) {
      const result = await searchPixabay({ q: "", type, page: 1, perPage: 1, id });
      if (result?.items.length) {
        items = result.items;
        total = result.total || 1;
        usedProvider = true;
      }
    }
  } else if (providerReady) {
    const result = await searchPixabay({ q: query, type, page, perPage });
    if (result && result.items.length) {
      items = result.items;
      total = result.total;
      usedProvider = true;
    }
  }

  let degraded = false;
  if (!items.length) {
    const demo = searchDemo({ q: rawQuery, type, category, page, perPage, seed });
    items = demo.items;
    total = demo.total;
    degraded = providerReady || Boolean(rawQuery);
  }

  if (!items.length && page === 1) {
    const fallback = searchDemo({ q: "", type, category: "for-you", page, perPage, seed });
    items = fallback.items;
    total = fallback.total;
    degraded = true;
  }

  const body: MediaResponse = {
    items,
    total,
    page,
    perPage,
    hasMore: page * perPage < total,
    source: usedProvider ? "pixabay" : "demo",
    degraded,
    query: rawQuery,
    tookMs: Date.now() - startedAt,
  };

  cache.set(cacheKey, body);
  res.setHeader("X-Provider-Mode", usedProvider ? "pixabay" : "demo");
  sendJson(res, 200, body);
}
