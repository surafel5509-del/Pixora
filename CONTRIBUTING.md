# Contributing to Pixora

Thanks for helping make Pixora better. This project optimises for clarity and for a product that works with zero
configuration, so contributions should keep both true.

## Getting set up

```bash
npm install
cp .env.example .env.local   # optional: add a Pixabay key and/or Supabase credentials
npm run dev
```

Nothing is required to run the app: without credentials Pixora serves its bundled sample library and keeps your
library on the device.

## Before you open a pull request

```bash
npm run verify     # lint + typecheck + tests + build
npm run format     # Prettier
```

CI runs the same checks on Node 20 and 22. A PR that fails `verify` won't be merged.

## Branch and commit conventions

- Branch from `main`: `feat/short-description`, `fix/short-description`, `chore/…`, `docs/…`.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `perf:`.
- Keep PRs focused — one concern per PR, with a short description of the change and how to test it.

## Code guidelines

**TypeScript**

- `strict` is on; no `any` in application code (API payloads are typed interfaces).
- Use `import type` for type-only imports; `verbatimModuleSyntax` is enabled.
- Avoid non-null assertions unless the invariant is obvious; prefer early returns.

**React**

- Function components only. One exported component per file, co-located with its concerns.
- Keep components presentational where possible; data lives in hooks and context.
- Every interactive element needs an accessible name; toggles get `aria-pressed` or `aria-checked`.
- Use design tokens (`bg-canvas`, `text-ink`, `border-line`, `bg-brand`) instead of raw colour values.

**Styles**

- Tailwind utilities first; add CSS to `src/styles/index.css` only for tokens, keyframes or genuinely reusable
  component classes.
- Respect both dark mode and `prefers-reduced-motion`.

**API**

- Handlers live in `api/`; shared helpers in `api/_lib/` (underscore-prefixed so they never become endpoints).
- Secrets are read from `process.env` server-side only — never via `VITE_`.
- Always degrade: return a well-formed response rather than an error page where a sensible fallback exists.

**Tests**

- Add or update tests with behaviour changes. Prefer testing user-visible behaviour over implementation details.
- New API behaviour gets a test in `api/_lib/*.test.ts`; new UI gets a component or smoke test.

## Reporting bugs

Open an issue with: what you expected, what happened, the page/route, and steps to reproduce. Screenshots and console
output help. Security issues follow [`SECURITY.md`](SECURITY.md) instead.

## Licence

Contributions are accepted under the MIT licence.
