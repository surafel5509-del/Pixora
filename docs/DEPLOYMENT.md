# Deployment

## Vercel (recommended, zero config)

`vercel.json` already declares the framework, output directory, security headers, cache policy and API rewrites.

```bash
npm i -g vercel
vercel link
vercel deploy --prod
```

### Environment variables

Set these in **Project → Settings → Environment Variables**:

| Name                     | Environment         | Notes                                                                       |
| ------------------------ | ------------------- | --------------------------------------------------------------------------- |
| `PIXABAY_API_KEY`        | Production, Preview | Server-side only. Omit to run on the bundled sample library.                |
| `VITE_SUPABASE_URL`      | Production, Preview | Optional — enables accounts                                                 |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview | Optional — anon/publishable key only                                        |
| `VITE_SITE_URL`          | Production, Preview | e.g. `https://pixora.example.com` — used for canonical URLs and email links |

Because `VITE_*` values are inlined at build time, **redeploy after changing them**.

### After the first production deploy

1. Add `https://your-domain.com/auth` to **Supabase → Authentication → URL Configuration → Redirect URLs**.
2. Set the site URL in the same screen.
3. Hit `/api/health` and confirm `provider.mode` is `live` (or `demo` if you intentionally skipped the key).
4. Submit `/sitemap.xml` to your search console of choice.

## Other hosts

`npm run build` emits `dist/` — pure static assets deployable anywhere. The catch: `/api/*` needs a Node or
serverless runtime.

| Target           | Approach                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Netlify          | Move `api/` to `netlify/functions/` (or use the Vercel-compatible edge plugin) and keep the same handlers                  |
| Cloudflare Pages | Wrap handlers with a small `onRequest` adapter in `functions/api/[[path]].ts`                                              |
| Node server      | Serve `dist/` statically and mount the handlers with Express/Fastify using the shim in `vite/apiDevServer.ts` as reference |
| Static-only      | Set a build-time `VITE_MEDIA_MODE=demo` and ship the sample library, dropping the API entirely                             |

## Database

```bash
supabase link --project-ref <ref>
supabase db push
# or
psql "$DATABASE_URL" -f supabase/migrations/0002_pixora_library.sql
```

The migration is idempotent and creates `pixora_profiles`, `pixora_boards` and `pixora_saved_media` with row-level
security, indexes and a trigger that mirrors new auth users into `pixora_profiles`.

## Post-deploy checks

- [ ] `/api/health` returns `ok: true`
- [ ] Home, Explore and a media detail page render with images
- [ ] Sign-up email arrives (check spam; confirm the Supabase SMTP provider is configured)
- [ ] Light/dark theme persists across reloads
- [ ] `robots.txt` and `sitemap.xml` are served
- [ ] Lighthouse performance ≥ 90 on the home route
