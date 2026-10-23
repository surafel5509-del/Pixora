import type {
  HealthResponse,
  MediaItem,
  MediaResponse,
  MediaType,
  SuggestResponse,
  Suggestion,
} from "@shared/types";

const API_BASE = "/api";

export class MediaApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "MediaApiError";
    this.status = status;
  }
}

export interface FetchMediaParams {
  q?: string;
  type?: MediaType;
  category?: string;
  page?: number;
  perPage?: number;
  seed?: string;
  id?: string;
  signal?: AbortSignal;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  return search.toString();
}

function extractError(body: unknown): string | null {
  if (body && typeof body === "object" && "error" in body) {
    const value: unknown = body.error;
    if (typeof value === "string" && value.length) return value;
  }
  return null;
}

async function getJson<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<T> {
  const query = buildQuery(params);
  const response = await fetch(`${API_BASE}${path}${query ? `?${query}` : ""}`, {
    headers: { Accept: "application/json" },
    ...(signal ? { signal } : {}),
  });

  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = extractError(body) ?? `Request failed with status ${response.status}`;
    throw new MediaApiError(message, response.status);
  }

  return body as T;
}

/** Search the discovery feed (or fetch a single item when `id` is provided). */
export async function fetchMedia(params: FetchMediaParams = {}): Promise<MediaResponse> {
  return getJson<MediaResponse>(
    "/media",
    {
      q: params.q,
      type: params.type ?? "image",
      category: params.category,
      page: params.page ?? 1,
      per_page: params.perPage ?? 24,
      seed: params.seed,
      id: params.id,
    },
    params.signal,
  );
}

export async function fetchMediaById(
  id: string,
  type: MediaType,
  signal?: AbortSignal,
): Promise<MediaItem | null> {
  const response = await fetchMedia({ id, type, page: 1, perPage: 1, signal });
  return response.items[0] ?? null;
}

export async function fetchSuggestions(query: string, signal?: AbortSignal): Promise<Suggestion[]> {
  if (query.trim().length < 2) return [];
  const body = await getJson<SuggestResponse>("/suggest", { q: query }, signal);
  return body.suggestions ?? [];
}

export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse | null> {
  try {
    return await getJson<HealthResponse>("/health", {}, signal);
  } catch {
    return null;
  }
}
