# puck-supabase-starter

A Puck visual-editor site on Next.js (App Router) with Supabase for auth and
content storage, deployed on Vercel. Read `README.md` first.

Where things live:
- `src/ds/` — the design-system slot (tokens.css + primitives). Blocks import only from here.
- `src/content/site.ts` — the canonical record. Facts that must match everywhere.
- `src/content/content-guard.ts` — rules run on every publish and in CI.
- `src/puck/` — block catalog (`config.tsx`), page registry with seeds (`pages.ts`), page store (`storage.ts`), server renderer (`render.tsx`).
- `src/lib/auth.ts` — the admin gate; `src/proxy.ts` — session refresh and outer fence.
- `supabase/migrations/` — tables and the `publish_page` function.

Rules:
- Never type a canonical fact into a page; add a governed block instead.
- `npm run verify` must pass before a push.
- Never commit `.env.local` or any key.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
