# Pixora

**A modern, privacy-first visual discovery platform.** Search photography, design, architecture and film, save what
moves you, and turn scattered references into boards you can actually make from.

Pixora is a complete product: routed pages, a tokenised design system, an edge-cacheable API layer, optional
Supabase sync with row-level security, a test suite and CI. It is also **free-first** — no paid APIs, no subscription
tier, and it runs end-to-end with zero configuration thanks to a bundled sample library.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Home · Explore · Search · Media detail · Saved · Boards · Profile · Contribute│
│  Settings · About · Help · Auth · Privacy · Terms · 404                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick start

```bash
git clone https://github.com/surafel5509-del/Pixora.git
cd Pixora
npm install
cp .env.example .env.local     # optional — the app runs without it
npm run dev                    # http://localhost:5173
```

Verify a production build locally:

```bash
npm run verify                 # lint + typecheck + tests + build
npm run preview
```

---

## What's inside

### Product

| Area                | Highlights                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| **Discovery**       | Infinite masonry feed, image/video switch, category taxonomy, shuffle seed, responsive column control |
| **Search**          | Debounced query, type-ahead suggestions, recent searches, deep-linkable `/search?q=` results          |
| **Command palette** | `⌘K` / `Ctrl+K` — navigate, search, toggle theme, run actions                                         |
| **Media detail**    | Full-bleed viewer, inline video, tags, stats, save-to-board, share, download, JSON-LD, related feed   |
| **Library**         | Saved items, likes, boards with colours, recently viewed, JSON export, one-click local wipe           |
| **Contribute**      | Validated submission flow that turns a direct media URL into a first-class library item               |
| **Account**         | Email + password, magic link, password reset, optional cross-device sync                              |
| **Settings**        | Theme (light/dark/system), density, grid columns, autoplay, attribution, data controls                |
| **Content pages**   | About with changelog, help centre with FAQ, privacy, terms, 404                                       |

### Engineering

- **React 19 + TypeScript (strict)** — no `any` in application code, typed contracts shared with the API.
- **Vite 6** — optimised chunks, lazy-loaded routes, Supabase SDK code-split out of the initial bundle.
- **Tailwind CSS 4** — CSS-first `@theme` tokens, custom `dark` variant, reduced-motion support.
- **Serverless API** (`/api/*`) — one shared contract, TTL cache, per-IP rate limiting, graceful demo fallback.
- **Vitest + Testing Library** — unit, hook, component and full-app smoke tests (24 specs) with coverage.
- **ESLint 9 flat config + Prettier** — type-aware rules, consistent formatting.
- **Accessibility** — skip link, focus-visible rings, labelled controls, `aria-*` state, keyboard shortcuts, reduced motion.
- **SEO** — per-route titles and meta, canonical URLs, Open Graph/Twitter cards, JSON-LD, `robots.txt`, `sitemap.xml`, web manifest.

---

## Architecture at a glance

```
browser ──► React app (src/)
                │
                ├── context/   Settings · Toast · Auth · Library · UI (modals, palette)
                ├── hooks/     useMediaFeed (abort-safe infinite feed), debounce, shortcuts…
                ├── components layout · media · search · auth · ui primitives
                └── pages/     routes, code-split by importance
                     │
                     ▼  fetch /api/*
serverless API (api/)  ──►  cache ──►  Pixabay  ──►  fail?  ──►  bundled demo library
                │
                └──► Supabase (optional): auth + Postgres with row-level security
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full walkthrough, and [`docs/API.md`](docs/API.md) for the
HTTP contract.

---

## Configuration

Only `VITE_`-prefixed variables reach the browser. Everything else is read server-side by the functions in `api/`.

| Variable                 | Required | Purpose                                                           |
| ------------------------ | -------- | ----------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | no       | Enables accounts and cloud sync                                   |
| `VITE_SUPABASE_ANON_KEY` | no       | Publishable/anon key only — **never** the service-role key        |
| `PIXABAY_API_KEY`        | no       | Live media catalogue; without it Pixora serves the sample library |
| `VITE_SITE_URL`          | no       | Canonical URLs, social cards and email redirects                  |

Everything degrades cleanly when these are absent:

- No Pixabay key → the bundled sample library answers every request and the feed is labelled accordingly.
- No Supabase → accounts are disabled, the library stays on the device, and the UI says so.

```bash
# Database (optional)
supabase db push
# or: psql "$DATABASE_URL" -f supabase/migrations/0002_pixora_library.sql
```

---

## Scripts

| Command                                     | Description                                   |
| ------------------------------------------- | --------------------------------------------- |
| `npm run dev`                               | Dev server with the API mounted at `/api/*`   |
| `npm run build`                             | Typecheck + production bundle                 |
| `npm run preview`                           | Serve the production build                    |
| `npm run typecheck`                         | `tsc -b` across app and tooling configs       |
| `npm run lint` / `lint:fix`                 | ESLint (type-aware)                           |
| `npm run format` / `format:check`           | Prettier                                      |
| `npm test` / `test:watch` / `test:coverage` | Vitest                                        |
| `npm run verify`                            | lint + typecheck + tests + build (same as CI) |

---

## Deployment

Vercel is zero-config (`vercel.json` already sets the framework, headers and caching):

```bash
vercel deploy --prod
```

Add `PIXABAY_API_KEY` (and the Supabase pair if you want accounts) in **Project → Settings → Environment Variables**.
Set `VITE_SITE_URL` to the production origin so canonical URLs and email links are correct, then add that URL to
Supabase → Authentication → URL Configuration → Redirect URLs.

Any static host works too — `npm run build` emits `dist/`. Just note that `/api/*` needs a Node/serverless runtime
(Vercel, Netlify Functions, Cloudflare Workers with an adapter, or a small Express server).

---

## Security

- The media provider key is read server-side only and never shipped to the browser.
- Row-level security policies scope every cloud row to its owner.
- Security headers (`HSTS`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`) are
  applied in `vercel.json`.
- Report vulnerabilities privately — see [`SECURITY.md`](SECURITY.md).

---

## Contributing

Contributions are welcome. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) for the workflow, and run `npm run verify`
before opening a pull request.

---

## Licence & credits

MIT © Pixora contributors. Media is sourced from the Pixabay API (subject to the
[Pixabay licence](https://pixabay.com/service/license/)) plus the bundled sample library, which is for demonstration
purposes and should be replaced with your own licensed media before a production launch. Pixora links to original
sources and never re-hosts media without permission.
