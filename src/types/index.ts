import type { MediaItem } from "@shared/types";

export type { MediaItem, MediaType, Suggestion, HealthResponse } from "@shared/types";

/** A media item captured into the visitor's personal library. */
export interface SavedItem {
  /** Provider id, prefixed by media type to stay unique across providers. */
  id: string;
  media: MediaItem;
  boardIds: string[];
  savedAt: number;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  accent: string;
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
}

export interface RecentSearch {
  term: string;
  at: number;
}

export type Density = "comfortable" | "compact";

export interface Preferences {
  density: Density;
  autoplayVideos: boolean;
  showAttribution: boolean;
  columns: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  density: "comfortable",
  autoplayVideos: true,
  showAttribution: true,
  columns: 0, // 0 = auto
};
