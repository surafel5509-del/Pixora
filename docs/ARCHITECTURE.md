# Architecture

Pixora is a single-page application with a serverless API, designed so that every optional dependency can be absent
without breaking the product.

## Repository layout

```
api/                     Serverless endpoints (Vercel-style handlers)
  _lib/                  Shared, non-routable helpers (underscore prefix)
    http.ts              Request/response helpers, security headers, param parsing
    cache.ts             In-memory TTL cache with bounded eviction
    rateLimit.ts         Fixed-window per-IP limiter
    pixabay.ts           Provider client + normaliser (typed, no `any`)
    demo.ts              Query engine over the bundled sample library
  media.ts               GET /api/media — search or fetch by id
  suggest.ts             GET /api/suggest — type-ahead
  health.ts              GET /api/health — liveness + provider mode

shared/                  Code imported by BOTH the app and the API
  types.ts               MediaItem, MediaResponse, HealthResponse…
  taxonomy.ts            Categories, trending topics, creators
  demo-library.ts        Curated sample library + deterministic hashing

src/
  main.tsx               Entry point
  App.tsx                Provider stack + router (secondary routes lazy-loaded)
  components/
    layout/              AppShell, Sidebar, Topbar, MobileNav, Footer, Brand
    media/               MediaCard, MasonryGrid, MediaGrid, DiscoveryFeed, SaveToBoardDialog
    search/              SearchBar (combobox), CommandPalette
    auth/                AuthPanel (shared surface), AuthModal
    common/              Seo, ErrorBoundary, ScrollToTop
    ui/                  Button, Modal, Badge, Skeleton, Field, Avatar, EmptyState, SectionHeading
  context/               Settings · Toast · Auth · Library · UI
  hooks/                 useMediaFeed, useLocalStorage, useDebouncedValue, useKeyboardShortcuts…
  lib/                   supabase (lazy loader), media-api, library-sync, storage, utils, env
  pages/                 One file per route
  types/                 App-level types + Supabase schema types
  styles/index.css       Tailwind 4 entry point and design tokens

supabase/migrations/     SQL for the optional cloud schema
vite/apiDevServer.ts     Dev-only middleware that mounts api/ inside Vite
```

## Data flow

1. A page renders `<DiscoveryFeed>` with a query, category and media type.
2. `useMediaFeed` calls `/api/media` with an `AbortSignal`. Parameter changes cancel in-flight requests, so a slow
   response can never overwrite a newer one.
3. The API checks the TTL cache, then the rate limiter, then the provider.
4. On provider failure or missing key, `searchDemo()` answers from `shared/demo-library.ts` and the response is
   flagged `source: "demo"` / `degraded: true`.
5. Pages append results on scroll via an `IntersectionObserver` sentinel with an explicit **Load more** fallback for
   keyboard and reduced-motion users.

```
useMediaFeed ──► fetch /api/media ──► cache? ──► rate limit? ──► Pixabay
     ▲                                                              │
     └──────────── items + hasMore ◄──── demo fallback ◄────────────┘ (fail)
```

## State management

There is no global store library — React context plus `localStorage` is enough and keeps the bundle small.

| Provider           | Owns                                                                              | Persisted        |
| ------------------ | --------------------------------------------------------------------------------- | ---------------- |
| `SettingsProvider` | Theme (light/dark/system), density, columns, autoplay, attribution                | yes              |
| `ToastProvider`    | Toast queue with auto-dismiss and actions                                         | no               |
| `AuthProvider`     | Session, sign-in/up, magic link, reset, sign-out                                  | Supabase session |
| `LibraryProvider`  | Saved items, likes, boards, recent searches, recently viewed, stats, export/reset | yes (+ cloud)    |
| `UIProvider`       | Command palette, auth modal, mobile drawer, save-to-board dialog                  | no               |

Provider order matters: `Settings → Toast → Auth → Library → UI`. `AuthProvider` toasts session events and
`LibraryProvider` needs both.

### Offline-first sync

The local library is the source of truth for the UI. When a user signs in, `pullLibrary()` merges their cloud rows
into local state (union, newest first) exactly once per user id. Writes are fire-and-forget: `pushSavedItem()`,
`removeSavedItem()`, `pushBoard()` and `removeBoard()` run inside `try/catch` and surface a `syncState` of
`local | syncing | synced | error`. A dropped sync never blocks the interaction.

## Design system

`src/styles/index.css` defines semantic CSS variables (`--canvas`, `--surface`, `--ink`, `--muted`, `--line`,
`--brand`, `--accent`) and maps them into Tailwind's `@theme inline` so utilities like `bg-canvas`, `text-ink` and
`border-line` resolve to tokens rather than hard-coded colours. Dark mode is class-based:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

`SettingsProvider` toggles `.dark` on `<html>`, persists the choice, updates `<meta name="theme-color">`, and follows
the OS when the choice is `system`. Motion respects `prefers-reduced-motion` globally.

## Performance decisions

- **Lazy Supabase** — `src/lib/supabase.ts` dynamically imports the SDK (~100 KB gzipped) only when configured, so
  the discovery experience never pays for auth it doesn't use.
- **Lazy routes** — secondary pages are `React.lazy` chunks; home, explore, search, media and saved are eager.
- **Manual chunks** — React/React DOM/Router are split from application code.
- **CSS-columns masonry** — no JS layout pass, no scroll jank, responsive by default.
- **Bounded caches** — the API cache caps at 300 entries; the rate limiter prunes expired windows.

## Accessibility

Skip-to-content link, visible focus rings on `:focus-visible`, labelled icon buttons, `aria-pressed` on toggles,
`role="dialog"` + focus trap + scroll lock + focus restore in modals, `aria-live` toasts, keyboard-navigable
combobox and command palette, and a global reduced-motion guard.

## Testing strategy

| Level     | Example                                                                   |
| --------- | ------------------------------------------------------------------------- |
| Unit      | `src/lib/utils.test.ts` — formatting, hashing, class merging              |
| API       | `api/_lib/demo.test.ts` — ranking, pagination, seeding, fallbacks         |
| Hook      | `src/hooks/useMediaFeed.test.ts` — loading, error, pagination             |
| Component | `src/components/media/MediaCard.test.tsx` — rendering, links, save toggle |
| Smoke     | `src/App.test.tsx` — mounts the real app with the API stubbed             |

Run everything with `npm test`, or `npm run test:coverage` for a report.

## Adding a feature

1. Model the data in `shared/types.ts` if the API is involved.
2. Extend the API in `api/` with a typed handler; keep secrets server-side.
3. Add or extend a hook for data fetching (`useMediaFeed` is the pattern).
4. Compose UI from `components/ui` primitives and tokens — avoid raw colours.
5. Cover it with a test and run `npm run verify`.
