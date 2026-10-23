import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MediaCard } from "@/components/media/MediaCard";
import { renderWithProviders } from "@/test/render";
import type { MediaItem } from "@shared/types";

const item: MediaItem = {
  id: "42",
  type: "image",
  title: "Golden Hour Dunes",
  description: "A dune study",
  tags: ["desert", "dunes"],
  category: "nature",
  creator: "Aster Studio",
  thumbnail: "https://example.com/thumb.jpg",
  preview: "https://example.com/preview.jpg",
  full: "https://example.com/full.jpg",
  width: 1600,
  height: 2000,
  likes: 1280,
  views: 54000,
  pageUrl: "https://example.com/page",
  source: "demo",
  attribution: "Pixora sample library",
};

describe("MediaCard", () => {
  it("renders the title, creator and like count", () => {
    renderWithProviders(<MediaCard item={item} />);
    expect(screen.getByRole("heading", { name: item.title })).toBeInTheDocument();
    expect(screen.getByText(item.creator)).toBeInTheDocument();
    expect(screen.getByText("1.3K")).toBeInTheDocument();
  });

  it("links to the media detail route", () => {
    renderWithProviders(<MediaCard item={item} />);
    const link = screen.getByRole("link", { name: `Open ${item.title} by ${item.creator}` });
    expect(link).toHaveAttribute("href", "/media/image/42");
  });

  it("toggles the saved state when the bookmark is pressed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MediaCard item={item} />);

    const saveButton = screen.getByRole("button", { name: `Save ${item.title}` });
    expect(saveButton).toHaveAttribute("aria-pressed", "false");

    await user.click(saveButton);
    expect(screen.getByRole("button", { name: `Remove ${item.title} from your library` })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
