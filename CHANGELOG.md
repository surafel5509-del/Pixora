# Changelog

All notable changes to Pixora are documented here. This project follows [Semantic Versioning](https://semver.org).

## 2.0.0 — 2026-10-23 — "The platform edition"

A ground-up rebuild from a single-file prototype into a structured product.

### Added

- **Routed application** — 15 routes (home, explore, search, media detail, saved, boards, board detail, profile,
  contribute, settings, about, help, auth, privacy, terms, 404) with a shared shell and lazy-loaded secondary pages.
- **Design system** — tokenised light/dark themes, Tailwind CSS 4 with CSS-first `@theme`, reduced-motion support,
  custom focus rings, and reusable primitives (Button, Modal, Badge, Field, Skeleton, Avatar, EmptyState, Toast).
- **Command palette** (`⌘K` / `Ctrl+K`) with navigation, categories, recent searches, suggestions and quick actions.
- **Boards** — create, rename, delete and add saved items to colour-coded collections.
- **Personal library** — saved items, likes, recent searches, recently viewed, stats, JSON export and a local wipe.
- **Optional cloud sync** — Supabase auth (password, magic link, reset) with row-level security and a
  `syncState` indicator; the local library remains the source of truth.
- **Contribute flow** — validated submission that turns a direct media URL into a first-class library item.
- **API layer** — `/api/media`, `/api/suggest`, `/api/health` with a shared typed contract, TTL cache, per-IP rate
  limiting and a zero-config demo fallback.
- **SEO & PWA** — per-route meta, canonical URLs, Open Graph/Twitter cards, JSON-LD, `robots.txt`, `sitemap.xml`,
  web manifest and app icons.
- **Quality tooling** — ESLint 9 flat config, Prettier, Vitest with 24 tests, and GitHub Actions CI on Node 20/22.

### Changed

- Media payloads normalised to one `MediaItem` contract shared between browser and server.
- The Supabase SDK is now lazy-loaded, keeping it out of the initial bundle.
- Authentication flows moved to `/auth` (previously the root URL handled verification callbacks).

### Fixed

- Email verification now lands on `/auth` with a confirmation toast instead of the home route.
- Media requests are cancelled on parameter changes, so slow responses can no longer overwrite newer ones.

## 1.0.0 — 2026-10-19

- Initial release: responsive masonry discovery feed, category filters, search, local saves, light/dark theme,
  Supabase magic-link sign-in and a server-side Pixabay proxy.
