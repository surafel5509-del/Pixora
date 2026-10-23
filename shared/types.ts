/**
 * Types shared by the browser app (src/) and the serverless API (api/).
 * Keeping one contract here means the client never has to guess the payload.
 */

export type MediaType = "image" | "video";

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  tags: string[];
  category: string;
  creator: string;
  /** Small, fast preview used inside the masonry grid. */
  thumbnail: string;
  /** Mid-size render used on detail pages. */
  preview: string;
  /** Best available still (poster for videos). */
  full: string;
  /** Direct MP4 source — only present for `type: "video"`. */
  video?: string;
  width: number;
  height: number;
  likes: number;
  views: number;
  pageUrl: string;
  /** Which provider produced this record. */
  source: "pixabay" | "demo";
  attribution: string;
}

export interface MediaQuery {
  q: string;
  type: MediaType;
  category: string;
  page: number;
  perPage: number;
  seed: string;
  id?: string;
}

export interface MediaResponse {
  items: MediaItem[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
  /** `demo` means the bundled library served the request (no provider key). */
  source: "pixabay" | "demo";
  degraded: boolean;
  query: string;
  tookMs: number;
}

export interface Suggestion {
  label: string;
  kind: "topic" | "tag" | "creator";
  category?: string;
}

export interface SuggestResponse {
  suggestions: Suggestion[];
  source: "pixabay" | "demo";
}

export interface HealthResponse {
  ok: boolean;
  service: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  provider: {
    name: string;
    configured: boolean;
    mode: "live" | "demo";
  };
  timestamp: string;
}

export interface ApiError {
  error: string;
  detail?: string;
}
