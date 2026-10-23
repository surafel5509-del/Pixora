/**
 * LocalStorage wrapper that never throws.
 *
 * Browsers can disable storage (private mode, quota, embedded webviews), and a
 * crash while persisting a preference should never take the app down.
 */

const PREFIX = "pixora:";

function memoryFallback(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const store = typeof window === "undefined" ? null : memoryFallback();

export function readJson<T>(key: string, fallback: T): T {
  if (!store) return fallback;
  try {
    const raw = store.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  if (!store) return;
  try {
    store.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota exceeded or storage unavailable — ignore */
  }
}

export function readString(key: string, fallback = ""): string {
  if (!store) return fallback;
  try {
    return store.getItem(PREFIX + key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeString(key: string, value: string): void {
  if (!store) return;
  try {
    store.setItem(PREFIX + key, value);
  } catch {
    /* ignore */
  }
}

export function removeKey(key: string): void {
  if (!store) return;
  try {
    store.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

/** Removes every Pixora-owned key. Used by "Reset local data" in Settings. */
export function clearPixoraStorage(): void {
  if (!store) return;
  try {
    const keys: string[] = [];
    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((key) => store.removeItem(key));
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = {
  theme: "theme",
  savedMedia: "saved-media",
  likedMedia: "liked-media",
  boards: "boards",
  recentSearches: "recent-searches",
  recentlyViewed: "recently-viewed",
  preferences: "preferences",
} as const;
