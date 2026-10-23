# API reference

All endpoints are relative to the deployment origin, answer JSON, and are safe to cache. Handlers live in `api/` and
run as serverless functions in production; in `npm run dev` the same modules are mounted by `vite/apiDevServer.ts`.

Common behaviour:

- `GET` and `HEAD` only — anything else returns `405` with an `Allow` header.
- Security headers on every response (`X-Content-Type-Options`, `Referrer-Policy`, cache hints).
- 60 requests per minute per IP; exceeding it returns `429` with `Retry-After` and `X-RateLimit-Remaining` headers.
- Successful responses are cached in memory for 10 minutes (per instance).

---

## `GET /api/media`

Search the catalogue, or fetch a single item by id.

| Parameter  | Type                 | Default   | Notes                                                        |
| ---------- | -------------------- | --------- | ------------------------------------------------------------ |
| `q`        | string               | `""`      | Search term (max 80 chars). Falls back to the category slug. |
| `type`     | `"image" \| "video"` | `image`   | Media kind                                                   |
| `category` | string               | `for-you` | Taxonomy slug, e.g. `architecture`                           |
| `page`     | number               | `1`       | 1–50                                                         |
| `per_page` | number               | `24`      | 6–30                                                         |
| `seed`     | string               | `pixora`  | Rotation seed for unfiltered feeds                           |
| `id`       | string               | —         | Fetch one item and ignore paging                             |

**Response**

```json
{
  "items": [
    {
      "id": "demo-img-002",
      "type": "image",
      "title": "Concrete Cathedral",
      "description": "Concrete Cathedral — a brutalism and architecture study…",
      "tags": ["brutalism", "architecture", "concrete", "geometry"],
      "category": "architecture",
      "creator": "Lina Ostberg",
      "thumbnail": "https://…/600/800",
      "preview": "https://…/1000/1333",
      "full": "https://…/1600/2133",
      "width": 1600,
      "height": 2133,
      "likes": 2311,
      "views": 74512,
      "pageUrl": "https://pixabay.com/",
      "source": "demo",
      "attribution": "Pixora sample library"
    }
  ],
  "total": 40,
  "page": 1,
  "perPage": 24,
  "hasMore": true,
  "source": "demo",
  "degraded": false,
  "query": "concrete",
  "tookMs": 6
}
```

- `source: "demo"` — answered by the bundled sample library (no provider key, or the query had no live match).
- `degraded: true` — a live provider is configured but this response fell back.
- `X-Provider-Mode` mirrors `source`.

**Errors**

| Status | Body                                                                        |
| ------ | --------------------------------------------------------------------------- |
| 405    | `{ "error": "Method not allowed." }`                                        |
| 429    | `{ "error": "Too many requests. Please slow down and try again shortly." }` |

---

## `GET /api/suggest`

Type-ahead for the search bar and command palette.

| Parameter | Type   | Notes                                                  |
| --------- | ------ | ------------------------------------------------------ |
| `q`       | string | Returns up to 8 matches; empty returns trending topics |

```json
{
  "suggestions": [
    { "label": "Brutalist concrete", "kind": "topic" },
    { "label": "Concrete", "kind": "tag", "category": "Architecture" },
    { "label": "Aster Studio", "kind": "creator" }
  ],
  "source": "demo"
}
```

---

## `GET /api/health`

Liveness and configuration probe. Never exposes secrets.

```json
{
  "ok": true,
  "service": "pixora",
  "version": "2.0.0",
  "environment": "production",
  "uptimeSeconds": 4210,
  "provider": { "name": "pixabay", "configured": false, "mode": "demo" },
  "timestamp": "2026-10-23T20:05:07.208Z"
}
```

`mode` is `live` when `PIXABAY_API_KEY` is set, otherwise `demo`. The footer uses this to show a status pill.

---

## Demo fallback contract

The API never returns an empty feed because of configuration. When the provider is missing, unreachable, rate limited
upstream or returns nothing, `shared/demo-library.ts` answers instead:

- 40 curated images and 12 videos with titles, tags, creators and aspect ratios.
- Deterministic scoring (title 6, tags 4, category/creator 3, description 1) and seeded rotation, so the same query
  and seed always produce the same page.
- Queries with no textual match rotate the pool rather than showing a dead end, and the UI labels the result.

Replace the bundled library with your own licensed media before launching commercially.
