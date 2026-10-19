# VISTORA

VISTORA is a responsive visual-discovery web app for finding, searching, saving, and sharing creative inspiration.

## Stack
- React 18 + TypeScript + Vite
- Supabase Auth, Postgres and Row Level Security
- Lucide icons

## Run locally
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Add your Supabase project URL and **publishable/anon** key.
4. Install and start:

```bash
npm install
npm run dev
```

Build verification: `npm run build`.

## Supabase
The VISTORA tables use the `vistora_` prefix in the existing UDS project. Apply `supabase/migrations/20261019000000_vistora_core.sql` if setting up a fresh database. Never put a service-role key in frontend environment variables. User content must be uploaded through authenticated, policy-protected storage paths.

## Free-first
No Stripe, paid APIs, or paid image services are required. The demo feed uses public Unsplash source images; replace these with your own licensed media for production. Hosting can remain local/free-tier until you choose otherwise.

## Included
- Responsive discovery feed and category filters
- Search, likes/saves (local demo state), light/dark theme
- Supabase magic-link sign-in
- Mobile navigation and accessible controls
