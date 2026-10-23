/**
 * Supabase persistence for the personal library.
 *
 * Every function degrades quietly: the local library is always the source of
 * truth for the UI, and the cloud copy is a best-effort mirror that lets a
 * signed-in visitor pick up where they left off on another device.
 */

import { loadSupabase } from "@/lib/supabase";
import type { Board, SavedItem } from "@/types";
import type { MediaItem, MediaType } from "@shared/types";

export function itemKey(media: MediaItem): string {
  return `${media.type}:${media.id}`;
}

export function parseItemKey(key: string): { type: MediaType; id: string } {
  const [type, ...rest] = key.split(":");
  return { type: type === "video" ? "video" : "image", id: rest.join(":") };
}

function mediaFromRow(row: {
  external_id: string;
  media_type: MediaType;
  title: string;
  media_url: string;
  thumbnail_url: string;
  page_url: string;
}): MediaItem {
  return {
    id: row.external_id,
    type: row.media_type,
    title: row.title || "Saved inspiration",
    description: "",
    tags: [],
    category: row.media_type === "video" ? "film" : "photography",
    creator: "Saved item",
    thumbnail: row.thumbnail_url || row.media_url,
    preview: row.media_url,
    full: row.media_url,
    ...(row.media_type === "video" ? { video: row.media_url } : {}),
    width: 0,
    height: 0,
    likes: 0,
    views: 0,
    pageUrl: row.page_url || "",
    source: "demo",
    attribution: "Pixora library",
  };
}

export interface CloudLibrary {
  saved: SavedItem[];
  boards: Board[];
}

export async function pullLibrary(userId: string): Promise<CloudLibrary | null> {
  const supabase = await loadSupabase();
  if (!supabase) return null;

  try {
    const [{ data: savedRows, error: savedError }, { data: boardRows, error: boardError }] =
      await Promise.all([
        supabase
          .from("pixora_saved_media")
          .select("*")
          .eq("owner_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("pixora_boards")
          .select("*")
          .eq("owner_id", userId)
          .order("created_at", { ascending: true }),
      ]);

    if (savedError || boardError) return null;

    const saved: SavedItem[] = (savedRows ?? []).map((row) => ({
      id: `${row.media_type}:${row.external_id}`,
      media: mediaFromRow(row),
      boardIds: row.board_id ? [row.board_id] : [],
      savedAt: new Date(row.created_at).getTime(),
    }));

    const boards: Board[] = (boardRows ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description ?? "",
      accent: row.accent ?? "lime",
      createdAt: new Date(row.created_at).getTime(),
      updatedAt: new Date(row.updated_at).getTime(),
      isPublic: row.is_public ?? false,
    }));

    return { saved, boards };
  } catch {
    return null;
  }
}

export async function pushSavedItem(userId: string, item: SavedItem): Promise<boolean> {
  const supabase = await loadSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("pixora_saved_media").upsert(
      {
        owner_id: userId,
        external_id: item.media.id,
        provider: item.media.source,
        media_type: item.media.type,
        title: item.media.title,
        media_url: item.media.full || item.media.preview,
        thumbnail_url: item.media.thumbnail,
        page_url: item.media.pageUrl,
        board_id: item.boardIds[0] ?? null,
      },
      { onConflict: "owner_id,provider,external_id,media_type" },
    );
    return !error;
  } catch {
    return false;
  }
}

export async function removeSavedItem(userId: string, key: string): Promise<boolean> {
  const supabase = await loadSupabase();
  if (!supabase) return false;
  const { type, id } = parseItemKey(key);
  try {
    const { error } = await supabase
      .from("pixora_saved_media")
      .delete()
      .eq("owner_id", userId)
      .eq("external_id", id)
      .eq("media_type", type);
    return !error;
  } catch {
    return false;
  }
}

export async function pushBoard(userId: string, board: Board): Promise<boolean> {
  const supabase = await loadSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("pixora_boards").upsert({
      id: board.id,
      owner_id: userId,
      name: board.name,
      description: board.description,
      accent: board.accent,
      is_public: board.isPublic,
      updated_at: new Date(board.updatedAt).toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function removeBoard(userId: string, boardId: string): Promise<boolean> {
  const supabase = await loadSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("pixora_boards").delete().eq("owner_id", userId).eq("id", boardId);
    return !error;
  } catch {
    return false;
  }
}
