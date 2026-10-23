/**
 * Fixed-window rate limiter keyed by client IP.
 *
 * Protects the free-tier media quota and the provider API key from abuse.
 * State is per instance, which is the right trade-off for a free-first product:
 * it is cheap, has no external dependency, and degrades to "no limiting" (never
 * "blocked for everyone") when instances are recycled.
 */

import { clientIp, type ApiRequest } from "./http";

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(req: ApiRequest, limit = 60, windowMs = 60_000): RateLimitResult {
  const key = clientIp(req);
  const now = Date.now();
  const current = windows.get(key);

  if (!current || current.resetAt < now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    if (windows.size > 5000) {
      for (const [entryKey, entry] of windows) {
        if (entry.resetAt < now) windows.delete(entryKey);
      }
    }
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  current.count += 1;
  const remaining = Math.max(0, limit - current.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return { allowed: current.count <= limit, remaining, retryAfterSeconds };
}
