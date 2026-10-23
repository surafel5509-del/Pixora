import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useMediaFeed } from "@/hooks/useMediaFeed";
import type { MediaResponse } from "@shared/types";

function response(overrides: Partial<MediaResponse> = {}): MediaResponse {
  return {
    items: [],
    total: 0,
    page: 1,
    perPage: 24,
    hasMore: false,
    source: "demo",
    degraded: false,
    query: "",
    tookMs: 4,
    ...overrides,
  };
}

const mediaItem = {
  id: "1",
  type: "image" as const,
  title: "Test",
  description: "",
  tags: [],
  category: "nature",
  creator: "Tester",
  thumbnail: "t.jpg",
  preview: "p.jpg",
  full: "f.jpg",
  width: 100,
  height: 100,
  likes: 1,
  views: 1,
  pageUrl: "",
  source: "demo" as const,
  attribution: "Pixora",
};

describe("useMediaFeed", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the first page and exposes metadata", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify(response({ items: [mediaItem], total: 1, hasMore: false, source: "pixabay" })),
        ),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useMediaFeed({ query: "dunes", type: "image" }));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.source).toBe("pixabay");
    expect(result.current.hasMore).toBe(false);
  });

  it("surfaces an error message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve(JSON.stringify({ error: "Boom" })),
      }),
    );

    const { result } = renderHook(() => useMediaFeed({}));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("Boom");
  });

  it("appends the next page when loadMore is called", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      const page = new URL(url, "http://localhost").searchParams.get("page");
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify(
              response({
                items: [{ ...mediaItem, id: String(page) }],
                total: 4,
                hasMore: page === "1",
                page: Number(page),
              }),
            ),
          ),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useMediaFeed({ perPage: 1 }));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.hasMore).toBe(true);

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(result.current.items.map((item) => item.id)).toEqual(["1", "2"]);
  });
});
