/**
 * Query engine over the bundled sample library (see shared/demo-library.ts).
 * Deterministic: the same query + seed always returns the same page, which keeps
 * client navigation stable and the response cacheable.
 */

import { DEMO_LIBRARY, hashString } from "../../shared/demo-library";
import type { MediaItem, MediaType } from "../../shared/types";

export interface DemoQuery {
  q: string;
  type: MediaType;
  category: string;
  page: number;
  perPage: number;
  seed: string;
}

export interface DemoResult {
  items: MediaItem[];
  total: number;
}

function tokenise(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

function score(item: MediaItem, tokens: string[]): number {
  const haystacks = [
    { text: item.title.toLowerCase(), weight: 6 },
    { text: item.tags.join(" ").toLowerCase(), weight: 4 },
    { text: item.category.toLowerCase(), weight: 3 },
    { text: item.creator.toLowerCase(), weight: 3 },
    { text: item.description.toLowerCase(), weight: 1 },
  ];

  let total = 0;
  for (const token of tokens) {
    for (const haystack of haystacks) {
      if (haystack.text.includes(token)) total += haystack.weight;
    }
  }
  return total;
}

function rotate(items: MediaItem[], offset: number): MediaItem[] {
  if (!items.length) return items;
  const start = offset % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

export function searchDemo(query: DemoQuery): DemoResult {
  const pool = DEMO_LIBRARY.filter((item) => item.type === query.type);
  const tokens = tokenise(query.q);
  const category = query.category.toLowerCase();

  let matches = pool;

  if (tokens.length) {
    matches = pool
      .map((item) => ({ item, value: score(item, tokens) }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value || a.item.id.localeCompare(b.item.id))
      .map((entry) => entry.item);
  } else if (category && category !== "for-you" && category !== "all") {
    const scoped = pool.filter((item) => item.category === category);
    matches = scoped.length ? scoped : pool;
  }

  // No textual match: rotate instead of showing an empty feed.
  if (!matches.length) matches = pool;

  const ordered =
    tokens.length || (category && category !== "for-you" && category !== "all")
      ? matches
      : rotate(matches, hashString(query.seed || "pixora"));

  const start = (query.page - 1) * query.perPage;
  return {
    items: ordered.slice(start, start + query.perPage),
    total: ordered.length,
  };
}

export function findDemoById(id: string): MediaItem | undefined {
  return DEMO_LIBRARY.find((item) => item.id === id);
}
