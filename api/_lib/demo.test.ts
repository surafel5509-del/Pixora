import { describe, expect, it } from "vitest";
import { findDemoById, searchDemo } from "./demo";
import { DEMO_LIBRARY } from "../../shared/demo-library";

describe("searchDemo", () => {
  it("filters by media type", () => {
    const images = searchDemo({ q: "", type: "image", category: "for-you", page: 1, perPage: 50, seed: "a" });
    const videos = searchDemo({ q: "", type: "video", category: "for-you", page: 1, perPage: 50, seed: "a" });
    expect(images.items.every((item) => item.type === "image")).toBe(true);
    expect(videos.items.every((item) => item.type === "video")).toBe(true);
  });

  it("ranks textual matches ahead of unrelated items", () => {
    const result = searchDemo({
      q: "concrete",
      type: "image",
      category: "for-you",
      page: 1,
      perPage: 5,
      seed: "a",
    });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].title.toLowerCase()).toContain("concrete");
  });

  it("paginates deterministically", () => {
    const first = searchDemo({
      q: "",
      type: "image",
      category: "for-you",
      page: 1,
      perPage: 4,
      seed: "stable",
    });
    const second = searchDemo({
      q: "",
      type: "image",
      category: "for-you",
      page: 2,
      perPage: 4,
      seed: "stable",
    });
    expect(second.items.map((item) => item.id)).not.toEqual(first.items.map((item) => item.id));
    expect(first.total).toBe(second.total);
  });

  it("rotates the unfiltered feed with the seed", () => {
    const a = searchDemo({ q: "", type: "image", category: "for-you", page: 1, perPage: 3, seed: "one" });
    const b = searchDemo({ q: "", type: "image", category: "for-you", page: 1, perPage: 3, seed: "two" });
    expect(a.items.map((item) => item.id)).not.toEqual(b.items.map((item) => item.id));
  });

  it("falls back to the full pool for nonsense queries", () => {
    const result = searchDemo({
      q: "zzzzqqq",
      type: "image",
      category: "for-you",
      page: 1,
      perPage: 6,
      seed: "a",
    });
    expect(result.items.length).toBe(6);
  });
});

describe("findDemoById", () => {
  it("resolves a known id and ignores unknown ones", () => {
    const sample = DEMO_LIBRARY[0];
    expect(findDemoById(sample.id)?.id).toBe(sample.id);
    expect(findDemoById("does-not-exist")).toBeUndefined();
  });
});
