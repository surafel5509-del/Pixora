import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import App from "@/App";

/**
 * End-to-end smoke test: mounts the real application (router + providers +
 * layout) in jsdom with the media API stubbed, and asserts the home page
 * renders. Guards against provider ordering, context and routing regressions.
 */
function stubFetch() {
  const demoItem = {
    id: "demo-img-001",
    type: "image",
    title: "Golden Hour Dunes",
    description: "A dune study",
    tags: ["desert", "dunes", "golden hour"],
    category: "nature",
    creator: "Aster Studio",
    thumbnail: "https://example.com/thumb.jpg",
    preview: "https://example.com/preview.jpg",
    full: "https://example.com/full.jpg",
    width: 1600,
    height: 2000,
    likes: 1200,
    views: 44000,
    pageUrl: "https://example.com",
    source: "demo",
    attribution: "Pixora sample library",
  };

  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/api/health")) {
        return {
          ok: true,
          status: 200,
          text: () =>
            Promise.resolve(
              JSON.stringify({
                ok: true,
                service: "pixora",
                version: "2.0.0",
                environment: "test",
                uptimeSeconds: 1,
                provider: { name: "pixabay", configured: false, mode: "demo" },
                timestamp: new Date().toISOString(),
              }),
            ),
        } as unknown as Response;
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              items: [demoItem],
              total: 1,
              page: 1,
              perPage: 24,
              hasMore: false,
              source: "demo",
              degraded: false,
              query: "",
              tookMs: 3,
            }),
          ),
      } as unknown as Response);
    }),
  );
}

describe("App", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
    stubFetch();
  });

  it("renders the home page with hero, navigation and a media feed", async () => {
    render(<App />);

    expect(await screen.findByRole("heading", { level: 1, name: /big idea/i })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Search Pixora").length).toBeGreaterThan(0);

    await waitFor(() => expect(screen.getAllByText("Golden Hour Dunes").length).toBeGreaterThan(0));
  });

  it("renders the 404 page for an unknown route", async () => {
    window.history.pushState({}, "", "/definitely-not-a-route");
    render(<App />);
    expect(await screen.findByText("404")).toBeInTheDocument();
  });
});
