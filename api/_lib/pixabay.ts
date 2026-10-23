/**
 * Pixabay provider client.
 *
 * The API key lives only in the server environment — it is never sent to the
 * browser. Any upstream failure resolves to `null` so callers can fall back to
 * the bundled demo library instead of showing users an error page.
 */

import type { MediaItem, MediaType } from "../../shared/types";

const IMAGE_ENDPOINT = "https://pixabay.com/api/";
const VIDEO_ENDPOINT = "https://pixabay.com/api/videos/";
const TIMEOUT_MS = 8000;

interface PixabayVideo {
  url?: string;
  width?: number;
  height?: number;
  thumbnail?: string;
}

interface PixabayVideoSizes {
  large?: PixabayVideo;
  medium?: PixabayVideo;
  small?: PixabayVideo;
  tiny?: PixabayVideo;
}

interface PixabayHit {
  id?: number | string;
  tags?: string;
  user?: string;
  likes?: number;
  views?: number;
  pageURL?: string;
  webformatURL?: string;
  largeImageURL?: string;
  previewURL?: string;
  imageWidth?: number;
  imageHeight?: number;
  videos?: PixabayVideoSizes;
}

interface PixabayResponse {
  hits?: PixabayHit[];
  totalHits?: number;
}

export interface ProviderQuery {
  q: string;
  type: MediaType;
  page: number;
  perPage: number;
  id?: string;
}

export interface ProviderResult {
  items: MediaItem[];
  total: number;
}

export function isProviderConfigured(): boolean {
  return Boolean(process.env.PIXABAY_API_KEY);
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.length ? value : fallback;
}

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function tagsFrom(raw: unknown): string[] {
  return text(raw)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function titleFrom(raw: unknown): string {
  const tags = tagsFrom(raw);
  if (!tags.length) return "Untitled inspiration";
  return tags
    .slice(0, 3)
    .join(", ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalise(hit: PixabayHit, type: MediaType): MediaItem | null {
  const isVideo = type === "video";
  const video = isVideo ? (hit.videos?.large ?? hit.videos?.medium ?? hit.videos?.small ?? null) : null;

  const image = isVideo
    ? text(video?.thumbnail, text(hit.videos?.tiny?.thumbnail, ""))
    : text(hit.largeImageURL, text(hit.webformatURL, text(hit.previewURL, "")));

  if (!image) return null;

  const thumbnail = isVideo
    ? text(video?.thumbnail, text(hit.videos?.tiny?.thumbnail, image))
    : text(hit.previewURL, text(hit.webformatURL, image));
  const tags = tagsFrom(hit.tags);
  const videoUrl = isVideo ? text(video?.url, "") : "";

  return {
    id: text(hit.id, `${type}-${Math.random().toString(36).slice(2)}`),
    type,
    title: titleFrom(hit.tags),
    description: text(hit.tags, "Creative inspiration").split(",").slice(0, 6).join(", "),
    tags,
    category: tags[0]?.toLowerCase() ?? (isVideo ? "film" : "photography"),
    creator: text(hit.user, "Pixabay creator"),
    thumbnail,
    preview: isVideo ? image : text(hit.webformatURL, image),
    full: image,
    ...(videoUrl ? { video: videoUrl } : {}),
    width: number(hit.imageWidth ?? video?.width),
    height: number(hit.imageHeight ?? video?.height),
    likes: number(hit.likes),
    views: number(hit.views),
    pageUrl: text(hit.pageURL, "https://pixabay.com/"),
    source: "pixabay",
    attribution: "Pixabay",
  };
}

export async function searchPixabay(query: ProviderQuery): Promise<ProviderResult | null> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return null;

  const params = new URLSearchParams({
    key,
    page: String(query.page),
    per_page: String(query.perPage),
    safesearch: "true",
  });

  if (query.id) params.set("id", query.id);
  else params.set("q", query.q || "creative inspiration");

  const isVideo = query.type === "video";
  if (!isVideo) {
    params.set("image_type", "photo");
    params.set("orientation", "all");
  }

  const endpoint = isVideo ? VIDEO_ENDPOINT : IMAGE_ENDPOINT;

  try {
    const upstream = await fetch(`${endpoint}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!upstream.ok) {
      console.warn(`[pixabay] provider responded ${upstream.status}`);
      return null;
    }

    const payload = (await upstream.json()) as PixabayResponse;
    const hits = Array.isArray(payload.hits) ? payload.hits : [];
    const items = hits
      .map((hit) => normalise(hit, query.type))
      .filter((item): item is MediaItem => item !== null);

    return { items, total: number(payload.totalHits) || items.length };
  } catch (error) {
    console.warn(`[pixabay] request failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return null;
  }
}
