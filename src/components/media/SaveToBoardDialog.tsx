import { useEffect, useState } from "react";
import { Check, FolderPlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { BOARD_ACCENTS, useLibrary } from "@/context/LibraryProvider";
import { useUI } from "@/context/UIProvider";
import { useToast } from "@/context/ToastProvider";
import { cn, hashString } from "@/lib/utils";

function accentColour(accent: string): string {
  return `hsl(${hashString(accent) % 360} 62% 52%)`;
}

export function SaveToBoardDialog() {
  const { saveTarget, closeSaveDialog } = useUI();
  const { boards, saved, toggleSave, addToBoard, removeFromBoard, createBoard } = useLibrary();
  const toast = useToast();
  const [newBoardName, setNewBoardName] = useState("");

  useEffect(() => {
    if (!saveTarget) setNewBoardName("");
  }, [saveTarget]);

  if (!saveTarget) return null;

  const key = `${saveTarget.type}:${saveTarget.id}`;
  const entry = saved.find((item) => item.id === key);
  const isInLibrary = Boolean(entry);

  const handleToggleBoard = (boardId: string) => {
    if (!isInLibrary) {
      toggleSave(saveTarget, boardId);
    } else if (entry?.boardIds.includes(boardId)) {
      removeFromBoard(key, boardId);
    } else {
      addToBoard(key, boardId);
    }
  };

  return (
    <Modal
      open
      onClose={closeSaveDialog}
      size="sm"
      title={isInLibrary ? "Manage boards" : "Save to a board"}
      description={saveTarget.title}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/50 p-3">
          <img
            src={saveTarget.thumbnail}
            alt=""
            loading="lazy"
            className="h-14 w-14 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{saveTarget.title}</p>
            <p className="truncate text-xs text-muted">{saveTarget.creator}</p>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-2">Your boards</p>
          {boards.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-5 text-center text-xs text-muted">
              No boards yet. Create one below to start curating.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {boards.map((board) => {
                const checked = entry?.boardIds.includes(board.id) ?? false;
                return (
                  <li key={board.id}>
                    <button
                      type="button"
                      onClick={() => handleToggleBoard(board.id)}
                      aria-pressed={checked}
                      className="flex w-full items-center gap-3 rounded-xl border border-line px-3.5 py-3 text-left transition hover:bg-surface-2"
                    >
                      <span
                        aria-hidden
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ background: accentColour(board.accent) }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{board.name}</span>
                        {board.description ? (
                          <span className="block truncate text-xs text-muted">{board.description}</span>
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition",
                          checked ? "border-brand bg-brand text-brand-ink" : "border-line text-transparent",
                        )}
                      >
                        <Check size={13} aria-hidden />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-line pt-4">
          <p className="eyebrow mb-2">New board</p>
          <div className="flex items-end gap-2">
            <TextInput
              value={newBoardName}
              onChange={(event) => setNewBoardName(event.target.value)}
              placeholder="e.g. Editorial layouts"
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                const board = createBoard({
                  name: newBoardName || "Untitled board",
                  accent: BOARD_ACCENTS[boards.length % BOARD_ACCENTS.length],
                });
                handleToggleBoard(board.id);
                setNewBoardName("");
              }}
            />
            <Button
              variant="secondary"
              iconLeft={<FolderPlus size={15} />}
              onClick={() => {
                const board = createBoard({
                  name: newBoardName || "Untitled board",
                  accent: BOARD_ACCENTS[boards.length % BOARD_ACCENTS.length],
                });
                handleToggleBoard(board.id);
                setNewBoardName("");
              }}
            >
              Create
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isInLibrary ? "outline" : "brand"}
            fullWidth
            onClick={() => {
              if (isInLibrary && entry?.boardIds.length === 0) {
                toggleSave(saveTarget);
              } else if (!isInLibrary) {
                toggleSave(saveTarget);
              }
              closeSaveDialog();
            }}
          >
            {isInLibrary ? "Remove from library" : "Save without a board"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (!isInLibrary) toggleSave(saveTarget);
              closeSaveDialog();
              toast.success("Saved to Pixora", "Find it anytime under Saved.");
            }}
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
