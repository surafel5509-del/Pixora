# Security policy

## Supported versions

The latest release on `main` receives security fixes.

## Reporting a vulnerability

Please **do not** open a public issue for a security problem. Instead:

1. Use GitHub's private "Report a vulnerability" flow on the repository, or
2. Email the maintainers with the subject `Pixora security report`.

Include a description, affected routes or files, reproduction steps, and impact. You can expect an acknowledgement
within 7 days and a status update at least every 14 days until resolved.

## Hardening built into Pixora

| Control                                                                  | Where                                                                 |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Media provider key never reaches the browser                             | `api/_lib/pixabay.ts` reads `process.env.PIXABAY_API_KEY` server-side |
| Row-level security on every cloud table                                  | `supabase/migrations/0002_pixora_library.sql`                         |
| Publishable/anon key only — service-role keys are never used client-side | `.env.example`, docs                                                  |
| Per-IP rate limiting (60 req/min)                                        | `api/_lib/rateLimit.ts`, applied in `api/media.ts`                    |
| Input validation and clamping on every query parameter                   | `api/_lib/http.ts`                                                    |
| Security response headers (HSTS, nosniff, referrer, permissions, frame)  | `vercel.json`                                                         |
| No `dangerouslySetInnerHTML` in application code                         | enforced by review                                                    |
| Dependency updates via CI on every push                                  | `.github/workflows/ci.yml`                                            |

## Deployment checklist

- [ ] `VITE_SUPABASE_ANON_KEY` is the **anon/publishable** key, never the service-role key.
- [ ] `PIXABAY_API_KEY` is set as a server-side environment variable only.
- [ ] `VITE_SITE_URL` matches the production origin and is allow-listed in Supabase redirect URLs.
- [ ] Supabase email templates disable or protect the automatic sign-up link where appropriate (see
      `docs/supabase-email-templates.md`).
- [ ] Storage buckets (if added) use authenticated, policy-protected paths — never public-write.
