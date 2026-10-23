import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FolderPlus, Trash2 } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { MediaCard } from "@/components/media/MediaCard";
import { MasonryGrid } from "@/components/media/MasonryGrid";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { TextInput } from "@/components/ui/Field";
import { useLibrary } from "@/context/LibraryProvider";
import { useSettings } from "@/context/SettingsProvider";
import { useToast } from "@/context/ToastProvider";
import { hashString, pluralise } from "@/lib/utils";

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { boards, boardItems, removeFromBoard, updateBoard, deleteBoard, saved } = useLibrary();
  const { preferences } = useSettings();
  const toast = useToast();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("");

  const board = boards.find((entry) => entry.id === boardId);

  if (!board) {
    return (
      <EmptyState
        icon={<FolderPlus size={22} aria-hidden />}
        title="Board not found"
        description="This board may have been deleted, or it lives on another device."
        action={<ButtonLink to="/boards">Back to boards</ButtonLink>}
      />
    );
  }

  const items = boardItems(board.id);
  const accent = `hsl(${hashString(board.accent) % 360} 62% 52%)`;

  return (
    <>
      <Seo
        title={board.name}
        description={board.description || `A Pixora board with ${items.length} saved ideas.`}
        path={`/boards/${board.id}`}
      />

      <Link
        to="/boards"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden /> All boards
      </Link>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} aria-hidden />
            <p className="eyebrow">Board</p>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {board.name}
          </h1>
          {board.description ? <p className="mt-2 max-w-xl text-sm text-muted">{board.description}</p> : null}
          <p className="mt-2 text-xs text-muted">{pluralise(items.length, "item")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setName(board.name);
              setRenaming(true);
            }}
          >
            Rename
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<Trash2 size={14} />}
            onClick={() => {
              if (window.confirm(`Delete “${board.name}”? Items stay in your library.`))
                deleteBoard(board.id);
            }}
          >
            Delete
          </Button>
        </div>
      </header>

      {items.length ? (
        <MasonryGrid columns={preferences.columns}>
          {items.map((entry, index) => (
            <div key={entry.id} className="group relative">
              <MediaCard item={entry.media} density={preferences.density} eager={index < 6} />
              <button
                type="button"
                onClick={() => {
                  removeFromBoard(entry.id, board.id);
                  toast.info("Removed from board", entry.media.title);
                }}
                className="absolute bottom-14 right-2.5 rounded-lg border border-line bg-surface/90 px-2 py-1 text-[0.625rem] font-semibold text-muted transition hover:text-danger focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
        </MasonryGrid>
      ) : (
        <EmptyState
          icon={<FolderPlus size={22} aria-hidden />}
          title="This board is empty"
          description={
            saved.length
              ? "Open any saved piece and choose “Add to board” to drop it in here."
              : "Save a few ideas first, then add them to this board."
          }
          action={
            <ButtonLink to={saved.length ? "/saved" : "/explore"} variant="primary">
              {saved.length ? "Browse your library" : "Find inspiration"}
            </ButtonLink>
          }
        />
      )}

      <Modal
        open={renaming}
        onClose={() => setRenaming(false)}
        size="sm"
        title="Rename board"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRenaming(false)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={() => {
                updateBoard(board.id, { name });
                setRenaming(false);
                toast.success("Board renamed");
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        <TextInput
          label="Board name"
          value={name}
          required
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              updateBoard(board.id, { name });
              setRenaming(false);
            }
          }}
        />
      </Modal>
    </>
  );
}
