# puck-supabase-starter

A visually editable website you can hand to a non-developer, on the current
Next.js, with Supabase for sign-in and content storage and a one-click Vercel
deploy. Everything on the free tiers.

The editor is [Puck](https://puckeditor.com). The approach is the one that
holds up in production:

- **Registered pages, not a page builder.** Every editable page is an entry in
  `src/puck/pages.ts` with a designed seed, so the editor opens on a real page
  and an unedited page still renders. Application routes stay in code.
- **Governed facts.** The business name, phone, address, hours and founding
  year live once in `src/content/site.ts`. Blocks render them; pages never type
  them. A content guard refuses a publish that does, and CI runs the same rules
  over the seeds.
- **Every publish is a version.** Rollback is republishing an earlier one.
  Nothing is deleted.
- **One gate, checked on every request.** Supabase Google OAuth is the only
  way in; there is no password, magic link, access code or development
  bypass. An allowlist decides who may edit, and removing an address revokes
  access immediately.
- **A design-system slot.** Blocks import only from `src/ds`. Replace its
  tokens and primitives with your own system and the whole site restyles.

## Start

### Deploy to Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fspsaustin%2Fpuck-supabase-starter&project-name=my-site&repository-name=my-site&integration-ids=oac_VqOgBHqhEoFTPzGkPd7L0iH6&env=ADMIN_EMAILS&envDescription=Comma-separated%20Google%20accounts%20that%20may%20edit%20the%20site)

The button clones the repo, adds the Supabase integration (which creates a
project and sets the Supabase variables) and asks for `ADMIN_EMAILS`. Then:

1. **Apply the migration.** In Supabase → SQL Editor, paste
   `supabase/migrations/0001_content.sql` and run it.
2. **Enable Google.** In Supabase → Authentication → Providers → Google, add a
   Google OAuth client id and secret (Google Cloud → APIs & Services →
   Credentials → OAuth client, type Web; the authorised redirect URI is the
   callback URL Supabase shows on that screen). Under Authentication → URL
   Configuration, set the Site URL to your Vercel URL and add
   `https://<your-domain>/auth/callback` to the redirect list.
3. **Set `NEXT_PUBLIC_SITE_URL`** in Vercel to your production URL and redeploy.
4. Open `/admin`, sign in with a listed Google account, edit, publish.

### Run locally

```bash
npx create-next-app@latest my-site --example https://github.com/spsaustin/puck-supabase-starter
cd my-site
cp .env.example .env.local   # fill in from Supabase → Project Settings → API
npm run dev
```

Google through Supabase is the only way into the editor, locally too: with no
Supabase variables set, `/admin` admits nobody. For local work, point
`.env.local` at a Supabase project (the free tier is enough) with Google
enabled, and add `http://localhost:3000/auth/callback` to its redirect list.
Without a service key, publishes are written to `.content/` on disk rather
than the database.

## Where things live

| Path | What |
| --- | --- |
| `src/ds/tokens.css`, `src/ds/index.tsx` | The design-system slot. Replace with yours. |
| `src/content/site.ts` | The canonical record. Change a fact once. |
| `src/content/content-guard.ts` | Rules run on every publish and in CI. Add house style here. |
| `src/puck/config.tsx` | The block catalog: layout, content and governed blocks. |
| `src/puck/pages.ts` | The page registry with seed compositions. Add a page here. |
| `src/puck/storage.ts` | Page store: Supabase with versions and rollback, local-file fallback. |
| `src/puck/render.tsx` | Server rendering; the public site never ships the editor. |
| `src/lib/auth.ts` | The gate: a Google-created Supabase session, then `ADMIN_EMAILS` or the `admins` table. |
| `src/proxy.ts` | Session refresh and the outer fence for `/admin`. |
| `src/app/(site)/[[...slug]]` | One route renders every registered page. |
| `src/app/admin` | Index, editor, history with rollback, sign-in. |
| `supabase/migrations` | Tables and the atomic `publish_page` function. |

## Bringing your own design system

Blocks use a handful of primitives (`Section`, `Heading`, `Text`, `Button`,
`Card`, `Callout`, `Eyebrow`, `Badge`, `Divider`) and the CSS variables in
`tokens.css`, and nothing else. To swap systems:

1. Replace `src/ds/tokens.css` with your tokens, keeping the variable names or
   mapping yours onto them at the bottom of the file.
2. Re-export your components from `src/ds/index.tsx` under the same names and
   props.
3. Run `npm run verify`. If it passes, every block, the editor preview and the
   public pages are on your system.

Keep the slot small. A block that needs something not in `src/ds` is a block
reaching past the design system; add the primitive to the slot first.

## Adding a page

Add an entry to `PAGES` in `src/puck/pages.ts` with a key, a path, a label and
a seed. It appears in the editor index and renders at its path. Link to it from
the header in the editor (Header and footer → Links).

## Adding a block

Write the component in `src/puck/blocks/` from `src/ds` primitives, add its
props to `Props` and its entry to `components` in `src/puck/config.tsx`, and
put it in a category. If it renders a fact, it belongs under Governed facts and
reads the fact from `src/content/site.ts`; do not give it a free-text field for
the value.

## Verify

```bash
npm run verify   # typecheck, lint, content lint over the seeds, guard tests, build
```

CI runs the same on every push (`.github/workflows/verify.yml`), and a second
workflow runs `npm audit`, a key-prefix grep and CodeQL (`security.yml`).
Dependabot opens weekly update PRs. See `SECURITY.md`.

## Self-hosting Supabase later

Nothing here assumes hosted Supabase beyond the three environment variables.
Point `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` at a self-hosted stack, apply the migration there,
and configure Google in its GoTrue settings.

## Security notes

- The service-role key is server-only and is reached only after the admin
  check. Never prefix it `NEXT_PUBLIC_`.
- Row security is on for every table with no policies, so the anon key can
  read nothing. Public pages read through the service key on the server.
- `/admin` carries `X-Robots-Tag: noindex` and is excluded from the sitemap.
- Never commit `.env.local`.
