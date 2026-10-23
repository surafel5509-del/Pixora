import { useState } from "react";
import { CheckCircle2, Image as ImageIcon, Info, Link2, ShieldCheck, Upload, Video } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { Button } from "@/components/ui/Button";
import { TextArea, TextInput } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { useLibrary } from "@/context/LibraryProvider";
import { useToast } from "@/context/ToastProvider";
import { cn } from "@/lib/utils";
import type { MediaType } from "@shared/types";

const CONTRIBUTION_BOARD = "Contributions";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function ContributePage() {
  const { boards, createBoard, toggleSave } = useLibrary();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState<MediaType>("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [licensed, setLicensed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (title.trim().length < 3) next.title = "Give your piece a title of at least 3 characters.";
    if (!isHttpUrl(mediaUrl)) next.mediaUrl = "Enter a direct https:// link to the media file.";
    if (thumbnailUrl && !isHttpUrl(thumbnailUrl))
      next.thumbnailUrl = "Thumbnail must be a valid https:// URL.";
    if (sourceUrl && !isHttpUrl(sourceUrl)) next.sourceUrl = "Source must be a valid https:// URL.";
    if (!licensed) next.licensed = "Confirm you have the right to share this media.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      toast.error("Check the form", "A few fields need attention before this can be submitted.");
      return;
    }

    const board =
      boards.find((entry) => entry.name === CONTRIBUTION_BOARD) ??
      createBoard({
        name: CONTRIBUTION_BOARD,
        description: "Media you've added to your own Pixora library.",
        accent: "teal",
      });

    const id = `contrib-${Date.now().toString(36)}`;
    const tagList = tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 12);

    toggleSave(
      {
        id,
        type,
        title: title.trim(),
        description: notes.trim() || `${title.trim()} — added by you.`,
        tags: tagList,
        category: type === "video" ? "film" : (tagList[0] ?? "photography"),
        creator: creator.trim() || "You",
        thumbnail: thumbnailUrl.trim() || mediaUrl.trim(),
        preview: mediaUrl.trim(),
        full: mediaUrl.trim(),
        ...(type === "video" ? { video: mediaUrl.trim() } : {}),
        width: 0,
        height: 0,
        likes: 0,
        views: 0,
        pageUrl: sourceUrl.trim(),
        source: "demo",
        attribution: "Shared by you",
      },
      board.id,
    );

    toast.success("Added to your library", `Saved to the ${CONTRIBUTION_BOARD} board.`);
    setTitle("");
    setCreator("");
    setTags("");
    setMediaUrl("");
    setThumbnailUrl("");
    setSourceUrl("");
    setNotes("");
    setLicensed(false);
    setErrors({});
  };

  return (
    <>
      <Seo
        title="Contribute media"
        description="Add your own licensed photography or footage to your Pixora library."
        path="/contribute"
      />

      <header className="mb-8">
        <p className="eyebrow">Contribute</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Add media to your library
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Point Pixora at a direct file URL and it becomes a first-class library item — searchable, boardable
          and shareable like anything else. Submissions are private to you until you share them.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <form
          className="surface-card flex flex-col gap-5 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div>
            <p className="eyebrow mb-2">Media type</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "image" as MediaType, label: "Image", icon: ImageIcon },
                { value: "video" as MediaType, label: "Video", icon: Video },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  aria-pressed={type === option.value}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition",
                    type === option.value
                      ? "border-brand bg-brand/10 text-ink"
                      : "border-line bg-surface text-muted hover:text-ink",
                  )}
                >
                  <option.icon size={16} aria-hidden /> {option.label}
                </button>
              ))}
            </div>
          </div>

          <TextInput
            label="Title"
            required
            value={title}
            error={errors.title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Low tide, Salt Lake"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              label="Creator"
              value={creator}
              onChange={(event) => setCreator(event.target.value)}
              placeholder="Your name or studio"
            />
            <TextInput
              label="Tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="coast, minimal, blue"
              hint="Comma separated, up to 12."
            />
          </div>

          <TextInput
            label="Direct media URL"
            required
            type="url"
            value={mediaUrl}
            error={errors.mediaUrl}
            onChange={(event) => setMediaUrl(event.target.value)}
            placeholder="https://…/photo.jpg"
            hint={type === "video" ? "Use a direct .mp4/.webm link." : "Use a direct image file link."}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              label="Thumbnail URL"
              type="url"
              value={thumbnailUrl}
              error={errors.thumbnailUrl}
              onChange={(event) => setThumbnailUrl(event.target.value)}
              placeholder="Optional"
            />
            <TextInput
              label="Source page"
              type="url"
              value={sourceUrl}
              error={errors.sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="Where it was published"
            />
          </div>

          <TextArea
            label="Notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Context, credits, or how you plan to use it."
          />

          <label
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-sm transition",
              errors.licensed ? "border-danger bg-danger/5" : "border-line bg-surface-2/50",
            )}
          >
            <input
              type="checkbox"
              checked={licensed}
              onChange={(event) => setLicensed(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--brand)]"
            />
            <span>
              <span className="block font-semibold text-ink">I have the right to share this media</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                Only submit content you created or that is licensed for reuse. Pixora stores your submission
                privately in your library.
              </span>
            </span>
          </label>

          {errors.licensed ? (
            <p className="-mt-3 text-xs font-medium text-danger">{errors.licensed}</p>
          ) : null}

          <div className="flex items-center gap-3">
            <Button type="submit" variant="brand" size="lg" iconLeft={<Upload size={16} />}>
              Add to library
            </Button>
            <Badge tone="neutral" icon={<ShieldCheck size={11} />}>
              Private to you
            </Badge>
          </div>
        </form>

        <aside className="flex flex-col gap-4">
          <div className="surface-card p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <Info size={16} aria-hidden /> How contributions work
            </h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-muted">
              <li className="flex gap-2.5">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden />
                Your submission is saved to a dedicated “Contributions” board on this device.
              </li>
              <li className="flex gap-2.5">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden />
                Sign in and it syncs to your account alongside everything else you save.
              </li>
              <li className="flex gap-2.5">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden />
                Pixora links to the original file rather than re-hosting it.
              </li>
              <li className="flex gap-2.5">
                <Link2 size={16} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                Every contribution gets a permalink you can share with collaborators.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-surface-2/60 p-6 text-sm leading-relaxed text-muted">
            <p className="font-semibold text-ink">Hot-linking tips</p>
            <p className="mt-2">
              Use a stable, public URL that allows cross-origin embedding. If an image doesn't render, the
              host is likely blocking hot-links — upload it to your own storage and use that URL instead.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
