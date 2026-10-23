/**
 * Minimal, dependency-free HTTP helpers shared by every Pixora endpoint.
 * Mirrors the small slice of the Vercel request/response contract we rely on,
 * so the same handlers also run inside `vite dev` (see vite/apiDevServer.ts).
 */

export type QueryValue = string | string[] | undefined;

export interface ApiRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, QueryValue>;
  body?: unknown;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  setHeader(key: string, value: string | number | readonly string[]): ApiResponse;
  json(body: unknown): void;
  send(body: string): void;
  end(body?: string): void;
}

const DEFAULT_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=3600",
};

export function applyBaseHeaders(res: ApiResponse, cacheControl?: string): void {
  for (const [key, value] of Object.entries(DEFAULT_HEADERS)) {
    res.setHeader(key, cacheControl && key === "Cache-Control" ? cacheControl : value);
  }
}

export function sendJson(res: ApiResponse, status: number, body: unknown): void {
  applyBaseHeaders(res);
  res.status(status).json(body);
}

export function sendError(res: ApiResponse, status: number, message: string, detail?: string): void {
  sendJson(res, status, detail ? { error: message, detail } : { error: message });
}

/** Returns false and writes a 405 when the request method is not GET/HEAD. */
export function ensureReadMethod(req: ApiRequest, res: ApiResponse): boolean {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;
  res.setHeader("Allow", "GET, HEAD, OPTIONS");
  sendError(res, 405, "Method not allowed.");
  return false;
}

export function stringParam(value: QueryValue, fallback = "", maxLength = 120): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return fallback;
  return raw.trim().slice(0, maxLength);
}

export function enumParam<T extends string>(value: QueryValue, allowed: readonly T[], fallback: T): T {
  const raw = stringParam(value).toLowerCase();
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

export function intParam(value: QueryValue, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(stringParam(value, String(fallback), 12), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function clientIp(req: ApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof value === "string" && value.length) return value.split(",")[0].trim();
  return "local";
}
