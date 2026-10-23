import { useState } from "react";
import { Link } from "react-router-dom";
import { FolderPlus, Layers, Trash2 } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { TextArea, TextInput } from "@/components/ui/Field";
import { BOARD_ACCENTS, useLibrary } from "@/context/LibraryProvider";
import { useToast } from "@/context/ToastProvider";
import { cn, hashString, pluralise } from "@/lib/utils";

function accentColour(accent: string): string {
  return `hsl(${hashString(accent) % 360} 62% 52%)`;
}

export function BoardsPage() {
  const { boards, createBoard, deleteBoard, boardItems, saved } = useLibrary();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    const board = createBoard({
      name,
      description,
      accent: BOARD_ACCENTS[boards.length % BOARD_ACCENTS.length],
    });
    setName("");
    setDescription("");
    setOpen(false);
    toast.success("Board ready", `Add ideas to ${board.name} from any card.`);
  };

  return (
    <>
      <Seo title="Boards" description="Curate saved Pixora ideas into colour-coded boards." path="/boards" />

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Collections</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Boards
          </h1>
          <p className="mt-2 text-sm text-muted">
            {boards.length
              ? `${pluralise(boards.length, "board")} · ${pluralise(saved.length, "piece")} organised`
              : "Group saved ideas into directions you can actually present."}
          </p>
        </div>
        <Button variant="brand" iconLeft={<FolderPlus size={16} />} onClick={() => setOpen(true)}>
          New board
        </Button>
      </header>

      {boards.length === 0 ? (
        <EmptyState
          icon={<Layers size={22} aria-hidden />}
          title="No boards yet"
          description="Boards turn scattered saves into a direction — create one for a project, a client or a mood."
          action={
            <Button variant="primary" iconLeft={<FolderPlus size={15} />} onClick={() => setOpen(true)}>
              Create your first board
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const items = boardItems(board.id);
            return (
              <article
                key={board.id}
                className="surface-card group overflow-hidden transition hover:shadow-card"
              >
                <div className="h-1.5 w-full" style={{ background: accentColour(board.accent) }} />
                <Link to={`/boards/${board.id}`} className="block p-5">
                  <h2 className="text-base font-bold text-ink">{board.name}</h2>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                    {board.description || "No description yet."}
                  </p>

                  {items.length ? (
                    <div className="mt-4 grid grid-cols-3 gap-1.5">
                      {items.slice(0, 3).map((entry) => (
                        <img
                          key={entry.id}
                          src={entry.media.thumbnail}
                          alt=""
                          loading="lazy"
                          className="aspect-square w-full rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 grid aspect-[3/1] place-items-center rounded-lg border border-dashed border-line text-xs text-muted">
                      Empty board
                    </div>
                  )}

                  <p className="mt-4 text-xs font-semibold text-muted">{pluralise(items.length, "item")}</p>
                </Link>
                <div className="flex items-center justify-between gap-2 border-t border-line px-5 py-3">
                  <span className="text-[0.6875rem] text-muted">
                    {new Date(board.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete “${board.name}”? Items stay in your library.`))
                        deleteBoard(board.id);
                    }}
                    aria-label={`Delete ${board.name}`}
                    className={cn(
                      "rounded-lg p-2 text-muted transition hover:bg-danger/10 hover:text-danger",
                    )}
                  >
                    <Trash2 size={15} aria-hidden />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        title="Create a board"
        description="Boards live on this device and sync when you're signed in."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={submit}>
              Create board
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Board name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Editorial layouts, Coastal palette…"
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
          />
          <TextArea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What direction is this board exploring?"
          />
        </div>
      </Modal>
    </>
  );
}
