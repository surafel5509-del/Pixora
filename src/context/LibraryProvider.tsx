import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import {
  itemKey,
  pullLibrary,
  pushBoard,
  pushSavedItem,
  removeBoard,
  removeSavedItem,
  type CloudLibrary,
} from "@/lib/library-sync";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage";
import { unique } from "@/lib/utils";
import type { Board, Preferences, RecentSearch, SavedItem } from "@/types";
import type { MediaItem } from "@shared/types";

export type SyncState = "idle" | "syncing" | "synced" | "error" | "local";

interface BoardInput {
  name: string;
  description?: string;
  accent?: string;
}

interface LibraryContextValue {
  saved: SavedItem[];
  savedKeys: string[];
  isSaved: (media: MediaItem) => boolean;
  toggleSave: (media: MediaItem, boardId?: string) => void;
  removeSaved: (key: string) => void;
  clearSaved: () => void;

  likes: string[];
  isLiked: (media: MediaItem) => boolean;
  toggleLike: (media: MediaItem) => void;

  boards: Board[];
  createBoard: (input: BoardInput) => Board;
  updateBoard: (id: string, patch: Partial<BoardInput>) => void;
  deleteBoard: (id: string) => void;
  addToBoard: (key: string, boardId: string) => void;
  removeFromBoard: (key: string, boardId: string) => void;
  boardItems: (boardId: string) => SavedItem[];

  recentSearches: RecentSearch[];
  recordSearch: (term: string) => void;
  clearSearches: () => void;

  recentlyViewed: MediaItem[];
  recordView: (media: MediaItem) => void;

  stats: { saved: number; boards: number; likes: number; images: number; videos: number };
  syncState: SyncState;
  exportLibrary: () => string;
  resetLibrary: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

const BOARD_ACCENTS = ["lime", "indigo", "amber", "rose", "teal", "slate"];
const MAX_RECENT = 12;

function createId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
  return `${prefix}-${random}`.slice(0, 48);
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user, isConfigured } = useAuth();
  const toast = useToast();

  const [saved, setSaved] = useState<SavedItem[]>(() => readJson<SavedItem[]>(STORAGE_KEYS.savedMedia, []));
  const [likes, setLikes] = useState<string[]>(() => readJson<string[]>(STORAGE_KEYS.likedMedia, []));
  const [boards, setBoards] = useState<Board[]>(() => readJson<Board[]>(STORAGE_KEYS.boards, []));
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() =>
    readJson<RecentSearch[]>(STORAGE_KEYS.recentSearches, []),
  );
  const [recentlyViewed, setRecentlyViewed] = useState<MediaItem[]>(() =>
    readJson<MediaItem[]>(STORAGE_KEYS.recentlyViewed, []),
  );
  const [syncState, setSyncState] = useState<SyncState>("local");

  const userId = user?.id ?? null;
  const mergedFor = useRef<string | null>(null);

  useEffect(() => writeJson(STORAGE_KEYS.savedMedia, saved), [saved]);
  useEffect(() => writeJson(STORAGE_KEYS.likedMedia, likes), [likes]);
  useEffect(() => writeJson(STORAGE_KEYS.boards, boards), [boards]);
  useEffect(() => writeJson(STORAGE_KEYS.recentSearches, recentSearches), [recentSearches]);
  useEffect(() => writeJson(STORAGE_KEYS.recentlyViewed, recentlyViewed), [recentlyViewed]);

  // Merge the cloud library once per signed-in user.
  useEffect(() => {
    if (!isConfigured || !userId || mergedFor.current === userId) return;
    mergedFor.current = userId;
    setSyncState("syncing");

    let cancelled = false;
    void pullLibrary(userId).then((cloud: CloudLibrary | null) => {
      if (cancelled) return;
      if (!cloud) {
        setSyncState("error");
        return;
      }

      setSaved((current) => {
        const byKey = new Map(current.map((entry) => [entry.id, entry]));
        for (const entry of cloud.saved) if (!byKey.has(entry.id)) byKey.set(entry.id, entry);
        return [...byKey.values()].sort((a, b) => b.savedAt - a.savedAt);
      });

      setBoards((current) => {
        const byId = new Map(current.map((board) => [board.id, board]));
        for (const board of cloud.boards) if (!byId.has(board.id)) byId.set(board.id, board);
        return [...byId.values()].sort((a, b) => a.createdAt - b.createdAt);
      });

      setSyncState("synced");
    });

    return () => {
      cancelled = true;
    };
  }, [isConfigured, userId]);

  useEffect(() => {
    if (!isConfigured) setSyncState("local");
  }, [isConfigured]);

  const isSaved = useCallback(
    (media: MediaItem) => saved.some((entry) => entry.id === itemKey(media)),
    [saved],
  );

  const toggleSave = useCallback(
    (media: MediaItem, boardId?: string) => {
      const key = itemKey(media);
      let nextEntry: SavedItem | null = null;
      let removing = false;

      setSaved((current) => {
        const existing = current.find((entry) => entry.id === key);
        if (existing) {
          if (boardId && !existing.boardIds.includes(boardId)) {
            const updated: SavedItem = { ...existing, boardIds: [...existing.boardIds, boardId] };
            nextEntry = updated;
            return current.map((entry) => (entry.id === key ? updated : entry));
          }
          removing = true;
          return current.filter((entry) => entry.id !== key);
        }
        nextEntry = {
          id: key,
          media,
          boardIds: boardId ? [boardId] : [],
          savedAt: Date.now(),
        };
        return [nextEntry, ...current.filter((entry) => entry.id !== key)];
      });

      if (userId && !removing && nextEntry) void pushSavedItem(userId, nextEntry);
      if (userId && removing) void removeSavedItem(userId, key);

      toast.notify({
        title: removing ? "Removed from your library" : "Saved to Pixora",
        description: removing
          ? media.title
          : boardId
            ? "Added to your board."
            : "Find it anytime under Saved.",
        variant: removing ? "info" : "success",
      });
    },
    [toast, userId],
  );

  const removeSaved = useCallback(
    (key: string) => {
      setSaved((current) => current.filter((entry) => entry.id !== key));
      if (userId) void removeSavedItem(userId, key);
    },
    [userId],
  );

  const clearSaved = useCallback(() => {
    setSaved([]);
    toast.info("Library cleared", "Saved items were removed from this device.");
  }, [toast]);

  const isLiked = useCallback((media: MediaItem) => likes.includes(itemKey(media)), [likes]);

  const toggleLike = useCallback((media: MediaItem) => {
    const key = itemKey(media);
    setLikes((current) =>
      current.includes(key) ? current.filter((entry) => entry !== key) : [key, ...current],
    );
  }, []);

  const createBoard = useCallback(
    (input: BoardInput) => {
      const now = Date.now();
      const board: Board = {
        id: createId("board"),
        name: input.name.trim() || "Untitled board",
        description: input.description?.trim() ?? "",
        accent: input.accent ?? BOARD_ACCENTS[boards.length % BOARD_ACCENTS.length],
        createdAt: now,
        updatedAt: now,
        isPublic: false,
      };
      setBoards((current) => [...current, board]);
      if (userId) void pushBoard(userId, board);
      toast.success("Board created", `${board.name} is ready for ideas.`);
      return board;
    },
    [boards.length, toast, userId],
  );

  const updateBoard = useCallback(
    (id: string, patch: Partial<BoardInput>) => {
      setBoards((current) =>
        current.map((board) =>
          board.id === id
            ? {
                ...board,
                ...(patch.name !== undefined ? { name: patch.name } : {}),
                ...(patch.description !== undefined ? { description: patch.description } : {}),
                ...(patch.accent !== undefined ? { accent: patch.accent } : {}),
                updatedAt: Date.now(),
              }
            : board,
        ),
      );
      const board = boards.find((entry) => entry.id === id);
      if (userId && board) void pushBoard(userId, { ...board, ...patch, updatedAt: Date.now() });
    },
    [boards, userId],
  );

  const deleteBoard = useCallback(
    (id: string) => {
      setBoards((current) => current.filter((board) => board.id !== id));
      setSaved((current) =>
        current.map((entry) => ({ ...entry, boardIds: entry.boardIds.filter((boardId) => boardId !== id) })),
      );
      if (userId) void removeBoard(userId, id);
      toast.info("Board deleted", "Its items stayed in your library.");
    },
    [toast, userId],
  );

  const addToBoard = useCallback(
    (key: string, boardId: string) => {
      let updated: SavedItem | undefined;
      setSaved((current) =>
        current.map((entry) => {
          if (entry.id !== key) return entry;
          updated = { ...entry, boardIds: unique([...entry.boardIds, boardId]) };
          return updated;
        }),
      );
      if (userId && updated) void pushSavedItem(userId, updated);
      toast.success("Added to board");
    },
    [toast, userId],
  );

  const removeFromBoard = useCallback(
    (key: string, boardId: string) => {
      let updated: SavedItem | undefined;
      setSaved((current) =>
        current.map((entry) => {
          if (entry.id !== key) return entry;
          updated = { ...entry, boardIds: entry.boardIds.filter((entryId) => entryId !== boardId) };
          return updated;
        }),
      );
      if (userId && updated) void pushSavedItem(userId, updated);
    },
    [userId],
  );

  const boardItems = useCallback(
    (boardId: string) => saved.filter((entry) => entry.boardIds.includes(boardId)),
    [saved],
  );

  const recordSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (clean.length < 2) return;
    setRecentSearches((current) =>
      [{ term: clean, at: Date.now() }, ...current.filter((entry) => entry.term !== clean)].slice(
        0,
        MAX_RECENT,
      ),
    );
  }, []);

  const clearSearches = useCallback(() => setRecentSearches([]), []);

  const recordView = useCallback((media: MediaItem) => {
    setRecentlyViewed((current) =>
      [media, ...current.filter((entry) => entry.id !== media.id)].slice(0, MAX_RECENT),
    );
  }, []);

  const stats = useMemo(
    () => ({
      saved: saved.length,
      boards: boards.length,
      likes: likes.length,
      images: saved.filter((entry) => entry.media.type === "image").length,
      videos: saved.filter((entry) => entry.media.type === "video").length,
    }),
    [saved, boards, likes],
  );

  const exportLibrary = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 2,
      boards,
      saved: saved.map((entry) => ({
        id: entry.id,
        title: entry.media.title,
        type: entry.media.type,
        creator: entry.media.creator,
        url: entry.media.full,
        pageUrl: entry.media.pageUrl,
        boardIds: entry.boardIds,
        savedAt: new Date(entry.savedAt).toISOString(),
      })),
      preferences: readJson<Preferences>(STORAGE_KEYS.preferences, {} as Preferences),
    };
    return JSON.stringify(payload, null, 2);
  }, [boards, saved]);

  const resetLibrary = useCallback(() => {
    setSaved([]);
    setLikes([]);
    setBoards([]);
    setRecentSearches([]);
    setRecentlyViewed([]);
    toast.info("Local data cleared", "Preferences were kept.");
  }, [toast]);

  const value = useMemo<LibraryContextValue>(
    () => ({
      saved,
      savedKeys: saved.map((entry) => entry.id),
      isSaved,
      toggleSave,
      removeSaved,
      clearSaved,
      likes,
      isLiked,
      toggleLike,
      boards,
      createBoard,
      updateBoard,
      deleteBoard,
      addToBoard,
      removeFromBoard,
      boardItems,
      recentSearches,
      recordSearch,
      clearSearches,
      recentlyViewed,
      recordView,
      stats,
      syncState,
      exportLibrary,
      resetLibrary,
    }),
    [
      saved,
      isSaved,
      toggleSave,
      removeSaved,
      clearSaved,
      likes,
      isLiked,
      toggleLike,
      boards,
      createBoard,
      updateBoard,
      deleteBoard,
      addToBoard,
      removeFromBoard,
      boardItems,
      recentSearches,
      recordSearch,
      clearSearches,
      recentlyViewed,
      recordView,
      stats,
      syncState,
      exportLibrary,
      resetLibrary,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return context;
}

export { BOARD_ACCENTS };
