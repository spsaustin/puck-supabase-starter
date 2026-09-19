# MASTER_PRD — Technical Architecture

**Project:** {{Client / site name}}
**Version:** {{0.1}} · **Status:** {{Draft | Approved | Superseded}}
**Owner:** {{Name, role}} · **Last reviewed:** {{YYYY-MM-DD}}
**Companion documents:** CORE_PRD (what the business needs and why) · DESIGN_PRD (how it looks, reads and moves)

> **How to use this template.** The MASTER_PRD is the engineering contract for
> a website redesign. CORE_PRD says what the site must do for the business;
> DESIGN_PRD says what it looks like; this document says how it is built, run
> and kept honest. Every `{{placeholder}}` is filled in or deleted. Every
> "Rule" is a sentence the build must be able to prove, and §19 lists how.
> Sections are numbered so the other two PRDs can cite them (for example
> "see MASTER_PRD §7.2").

---

## 1. Purpose and scope

**1.1 What this document decides.** The stack, the repository shape, the
content model, the gate, the data, the integrations, the security baseline,
the performance budgets, the operational tooling, and the definition of done.

**1.2 What it does not decide.** Copy, brand, layout and visual language
(DESIGN_PRD). Business goals, audiences, offers and success metrics
(CORE_PRD). Where this document and either of those conflict, the conflict is
recorded in §21 and resolved before build starts.

**1.3 Sites in scope.** {{Public marketing site · client portal · admin
editor · any application flows}}.

**1.4 Explicit non-goals for this release.** {{List. A non-goal is something a
reasonable reader would expect and is not getting; say so here rather than
letting it be discovered.}}

---

## 2. Principles (the ones that decide arguments)

These are the standing rules that every later section applies. Change them
here, not in a section.

1. **One canonical record.** Every fact that must be identical everywhere
   (name, phone, address, hours, rates, founding year, legal identifiers)
   lives in exactly one place in code and is rendered, never typed, into
   pages. See §7.3.
2. **Content is edited; application is coded.** Marketing pages are blocks
   an editor can rearrange. Forms, dashboards, payment, sign-in and anything
   with state are built in code and are not exposed to the editor. See §7.1.
3. **Fail closed at every gate, fail soft on every read.** An unconfigured
   gate admits nobody. A database unreachable during a public render serves
   the seed content, never a 500. Writes stay loud. See §8, §9.
4. **The design system is a slot.** Application code touches design only
   through the slot's tokens and primitives, so the system can be replaced
   without touching a block. See §6.
5. **Every publish is a version.** Nothing an editor does is destructive;
   rollback is republishing an earlier version. See §9.2.
6. **Verify before push, in one command.** Typecheck, lint, content rules,
   tests and build run locally and in CI from the same script. Red CI is not
   a flake until proven so. See §17.
7. **One gate: Supabase Google OAuth.** Every gated surface, staff or
   client, authenticates through Supabase Auth with Google as the only
   provider. Authorisation (who may do what) is a list or a role checked on
   every request. No password, magic link, access code or bypass. See §8.
8. **Secrets never enter a git tree.** Not in code, not in docs, not in a
   handoff. A key pasted into a chat is a key that gets rotated. See §11.5.
9. **Honest copy.** The site claims only what the system can show. No
   "guaranteed", "instant" or "real-time" unless the mechanism exists and is
   measured. CORE_PRD owns the vocabulary; §7.4 enforces it.

---

## 3. Stack

| Layer | Choice | Version pinned | Why this, not the alternative |
| --- | --- | --- | --- |
| Framework | {{Next.js (App Router)}} | {{16.x}} | {{Server rendering for crawlable marketing pages; route handlers for APIs; static + revalidate for edits.}} |
| Language | TypeScript, `strict: true` | {{5.x}} | |
| UI runtime | React | {{19.x}} | |
| Visual editor | {{Puck}} | {{0.23}} | {{Renders the real components; no proxy design.}} |
| Auth | Supabase Auth (GoTrue) with Google as the only provider | | The only gate. Google proves who; a list or role decides access. |
| Database | {{Supabase Postgres}} · {{PostGIS if geography}} | {{Postgres 17}} | |
| Hosting | {{Vercel}} | | {{Free tier acceptable? yes/no}} |
| Email | {{Resend}} | | |
| Payments | {{Stripe Checkout · P2P (Zelle/Venmo/Cash App) with bank-feed confirmation via Plaid · none}} | | |
| Line-of-business system | {{e.g. ServeManager, a CRM, a booking system}} | API v{{}} | |
| Document processing | {{pdf.js text layer → OCR (tesseract) → vision model}} | | |
| Analytics | {{Choice; privacy posture}} | | |

**3.1 Free-tier constraints that shape the design.** {{e.g. Vercel: 4.5 MB
request/response body cap on functions, so files move in parts; Supabase:
project pauses after inactivity on free tier; direct DB host is IPv6-only, so
use the pooler.}}

**3.2 Browser support.** {{Last two versions of evergreen browsers. Note any
library that assumes a newer runtime than that (e.g. use pdf.js's legacy
build).}}

---

## 4. Environments and configuration

| Environment | Branch | URL | Database | Third-party mode |
| --- | --- | --- | --- | --- |
| Local | any | localhost:3000 | {{local Postgres or none (file fallback)}} | sandbox / stubs |
| Preview | PR branches | `*.vercel.app` | {{shared preview project or none}} | sandbox |
| Production | `main` | {{domain}} | {{project ref}} | live |

**4.1 Environment variables.** Every variable, who sets it, and what happens
when it is missing. "Fails closed" or "degrades to X" is the required answer;
"crashes" is not.

| Variable | Set by | Scope | Missing → |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | integration | public | the only gate is absent; every gated surface admits nobody |
| `SUPABASE_SERVICE_ROLE_KEY` | integration | server only | store falls back to local files; admin index warns |
| `DATABASE_URL` (pooler) | operator | server only | {{}} |
| `ADMIN_EMAILS` | operator | server only | nobody may edit |
| {{integration keys}} | operator | server only | feature reports "not configured" |

**4.2 Kill switches.** {{e.g. `SPS_CARD_PAYMENTS=off` disables card checkout
without a deploy. List every one.}}

**4.3 Configuration rules.**
- A half-configured feature reports itself as unconfigured rather than
  admitting through whichever check is missing.
- There are no development-only ways past a gate. Local work signs in with
  the same Supabase Google OAuth against a development Supabase project.

---

## 5. Repository structure

```
{{repo}}/
  src/
    app/            routes only: (site) public, admin, portal, api
    ds/             DESIGN SYSTEM SLOT — tokens + primitives (§6)
    content/        canonical record, page seeds, content rules (§7)
    puck/           block catalog, page registry, store, renderer (§7)
    lib/            auth, db, rate limit, error log, mailer (§8–§13)
    {{domain}}/     one folder per business capability (intake, payments, …)
  db/migrations/    numbered, idempotent SQL (§9.3)
  scripts/          verify chain pieces, test suites, one-shot tools (§17)
  docs/             CORE_PRD, DESIGN_PRD, MASTER_PRD, runbooks, handoffs
  .github/workflows verify on every push
```

**5.1 Rules.**
- Route files contain gating and wiring, not logic. Logic lives in `src/lib`
  or a domain folder and is testable without the framework.
- Pure modules (rules, extractors, formatters) have no framework imports and
  no path aliases, so a plain script can run them in CI.
- Nothing under `src/app/api` is reachable without a gate named in §8 or a
  documented reason it is public.

---

## 6. Design-system contract

DESIGN_PRD owns what the system looks like. This section owns how it plugs in.

**6.1 The slot.** `src/ds/tokens.css` (CSS variables: surfaces, ink, actions,
tones, type scale, space, radius, elevation, motion) and `src/ds/index.tsx`
(primitives). Blocks and application screens import from the slot and from
nothing else.

**6.2 Primitive set.** {{Section, Heading, Text, Button, Card, Callout,
Badge, Eyebrow, Divider, fields (Text/Textarea/Select/Checkbox/Radio/Switch),
DataTable, StatusPill, Timeline, …}}. A block that needs something not in the
set adds the primitive to the slot first.

**6.3 Theming.** Light and dark are both token sets: `prefers-color-scheme`
by default, `data-theme` to force. Every surface declares an explicit
background; no component assumes white.

**6.4 Swapping systems.** Replace `tokens.css` (keep variable names or map
them), re-export the external system's components under the primitive names,
run the verify chain. If it passes, the swap is complete. Acceptance: {{a
screenshot set across viewports in both themes}}.

**6.5 Editor fidelity.** The visual editor renders the real components; the
preview is the page. Any "editor-only" styling is a defect.

---

## 7. Content model

**7.1 Registered pages.** Every editable public page is an entry in a
registry: `key`, `path`, `label`, `seed()`. Only registry keys can be edited
or rendered. Application routes are not in the registry and cannot be reached
by the editor.

| Key | Path | Kind | Seeded from | Notes |
| --- | --- | --- | --- | --- |
| `home` | `/` | page | {{}} | |
| `chrome` | — | header + footer | | rendered around every page |
| {{…}} | | | | |

**7.2 Block catalog.** Three kinds; every block carries the same Tone and
Layout controls so the editor has one vocabulary.

- *Layout*: Section (holds blocks), Columns, Spacer, Divider.
- *Content*: prose and media the editor writes freely. {{Hero, Prose,
  FeatureGrid, Stats, CTA, FAQ, Notice, Image, Quote, Table, Accordion…}}
- *Governed*: facts from the canonical record. Fields choose **which** record
  and **how** to show it, never **what** it says.

Deliberately absent: a raw HTML block.

**7.3 Canonical record.** `src/content/{{site|business-profile}}.ts`.
Contents: {{name, legal name, founding year, phone, email, address(es),
hours, rates and effective dates, coverage areas, service levels, legal
identifiers}}. Rule: no field anywhere in the block catalog accepts one of
these as free text.

**7.4 Content rules (the guard).** One rule list, run on every publish and in
CI over every seed:

| Rule | Pattern (summary) | Explanation shown to the editor |
| --- | --- | --- |
| phone-number | NANP phone | Use the Contact block |
| street-address | number + street type | Use the Contact block |
| rate-amount | `$` amount | Use the Rate table block |
| founding-year | "founded/since" + year | Renders from the record |
| {{banned-claim}} | {{"guarantee", "instant", bare "real-time"}} | CORE_PRD §{{}} vocabulary |
| {{house-typos}} | {{known misspellings}} | |

A publish that trips a rule is refused with the rule and the offending text;
nothing is written.

**7.5 SEO and structure.** Page-level title, description and noindex are
root fields on every page. Sitemap and robots are generated from the
registry. Structured data (Organization, LocalBusiness, Service, FAQ) renders
from the canonical record, never from typed copy.

**7.6 Legacy URL program.** Every old URL resolves in one hop, server-side,
with a 301. The map lives in `src/content/redirects` and is tested.

| From | To | Status |
| --- | --- | --- |
| {{/old.php}} | {{/new}} | 301 |

---

## 8. Identity and access

**8.1 Populations.** One identity system, separate authorisation per
population.

| Population | Enters at | Identity | Authorisation | Session |
| --- | --- | --- | --- | --- |
| Staff / editors | `/admin` | Supabase Google OAuth | allowlist (env + table), re-checked every request | {{8 h}} |
| Owners (analytics) | `/owner` | Supabase Google OAuth | roster with roles; RLS on reads | |
| Clients | `/portal` | Supabase Google OAuth | tenancy (org ↔ records) | {{12 h}} |
| Public | everything else | none | rate limits only | |

**8.2 Gate rules.**
- Token signature verified locally (JWKS/ES256 or shared secret); no network
  call per request.
- Expired sessions refresh transparently through a route handler, never
  inside a page render (pages cannot set cookies).
- Provider constraint: only sessions Google created are admitted. A
  password, magic-link or other-provider session for the same address is
  refused, and those providers stay disabled in Supabase.
- MFA policy: {{aal2 required · provider's own second factor enforced on the
  accounts}}.
- Removing an address from the list revokes access on the next request.
- No development bypass exists (§4.3). Local environments use a development
  Supabase project with the same Google provider.

**8.3 Where the gate runs.** In the proxy/middleware as the outer fence (redirect
or 401), **and** in every admin page and API route as the real check. API
paths return 401/403 JSON; pages redirect to sign-in with `next` preserved
and restricted to same-section paths.

**8.4 Tenancy (portal).** {{Organisations ↔ line-of-business companies is
many-to-many; row-level security enforces it; SQL tests in `db/tests`
prove a member sees only their rows, a revoked member sees nothing, an
anonymous caller sees nothing.}}

---

## 9. Data

**9.1 Schemas.** One schema per concern, all with row security on and no
policies for the API roles unless a section below grants one.

| Schema | Tables | Who reads | Who writes |
| --- | --- | --- | --- |
| `content` | pages, page_versions | server (service) | server, after gate |
| `intake` | submissions | server | server |
| `payments` | requests, transactions, plaid_items (sealed) | server | server + webhooks |
| `integration` | webhook_deliveries, events | server | webhook route |
| `ops` | rate_limits, errors | server | server |
| `portal` | organisations, members, grants | RLS per user | RLS per role |
| `training` | documents (bytea), annotations | server, after gate | server |
| {{…}} | | | |

**9.2 Content storage.** Current row per page plus a version row per publish,
written atomically ({{a `publish_page` function}}). Rollback republishes an
earlier version as a new one. Nothing is deleted. Reads fail soft to the seed.

**9.3 Migrations.** Numbered, idempotent (`create … if not exists`, guarded
enums, `drop policy if exists` before create), applied in order; a generated
`bootstrap.sql` concatenates every migration for one paste. Every migration
runs against a throwaway database in CI.

**9.4 Connection.** {{Pooler host, transaction mode, `postgres.<ref>` user;
`PGPOOL_MAX` sized for the function concurrency; TLS with the host's CA.}}
Direct hosts that are IPv6-only are not used from IPv4-only runtimes.

**9.5 Sensitive data.** {{Court documents, IDs, bank tokens}} are stored
{{as bytea behind RLS · sealed with a server key · not at all}}, read only
through gated routes, never written to git, a CDN or a log. Retention:
{{days}}. Deletion: {{cascade rules}}.

**9.6 Housekeeping.** Prune functions for {{rate-limit windows, error rows
(90 days), abandoned upload parts (1 day)}}, called opportunistically and
safe under cron.

---

## 10. Integrations

One subsection per external system. "Direction" is who calls whom.

### 10.{{n}} {{System name}}
- **Purpose:** {{}}
- **Direction:** {{site → API · API → site (webhook) · both}}
- **Auth:** {{key in `X_KEY`; scoped to: …}}
- **Idempotency:** {{key derived from …; retries resolve to the same object}}
- **Webhook verification:** {{signature header, replay protection via dedup
  key, unverifiable deliveries recorded not processed}}
- **Failure mode:** {{feature degrades to "awaiting review"; nothing lost}}
- **Sandbox:** {{how tests run without touching live}}
- **Never on live:** {{e.g. test orders create real jobs; a test on the live
  site is a real order that a human must cancel}}

Known integrations for this family of sites: {{ServeManager · Stripe
Checkout (restricted key: Checkout Sessions write, Payment Intents read,
Charges read; events `checkout.session.completed`, `charge.refunded`,
`charge.dispute.created`) · Plaid (Transactions; `/transactions/sync`;
`client_user_id` is a hash, never an email) · Resend · Anthropic vision}}.

---

## 11. Security baseline

**11.1 Headers.** `X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN` (DENY on
owner/analytics), `Permissions-Policy` minimal, HSTS with preload once the
domain is final. CSP: report-only first, enforced after {{n}} clean days.

**11.2 Indexing.** `/admin`, `/owner`, `/portal`, pay pages: `X-Robots-Tag:
noindex, nofollow`, excluded from the sitemap.

**11.3 Caching.** Owner and portal responses `private, no-store`. Documents
and exports `private, no-store`.

**11.4 Input.** Every route re-validates server-side regardless of client
checks. Uploads: type allowlist, size cap, count cap. Page keys and ids
validated against a strict pattern before any path or query use. Rich text
sanitised to a fixed tag list on render.

**11.5 Secrets.** Never in a git tree, a doc, a handoff or a screenshot.
Server-only keys never carry `NEXT_PUBLIC_`. Any key that appears in chat or
a ticket is rotated. Restricted/scoped keys over full keys wherever the
provider offers them. Rotation log in §21.

**11.6 Rate limiting.** Fixed windows in `ops.rate_limits`, keyed by caller.

| Endpoint | Limit | On breach |
| --- | --- | --- |
| intake submit | {{20/h}} | 429 + Retry-After |
| document extract | {{30/h}} | 429 |
| payment status | {{60/min}} | 429 |
| sign-in start | {{}} | |

**11.7 Payments.** Two lanes with separate routes ({{`/individual/payment`
vs `/firm/payment`}}); one settlement path; webhooks are the only source of
"confirmed"; refunds and disputes reverse the ledger; a held
line-of-business job is released only on confirmed.

---

## 12. Error handling and observability

- `instrumentation.ts` `onRequestError` records every unhandled error
  (digest, path, route, kind, user, stack) to `ops.errors` and the host log;
  recording never throws.
- `error.tsx` and `global-error.tsx` show the digest to the visitor and a
  way back; the admin index lists the last 24 hours.
- Session expiry never surfaces as a server error (§8.2).
- A dev-only route throws on purpose so the whole path is exercised.
- Alerting: {{who is paged, on what threshold}}.
- Logs never contain document contents, tokens or full card data.

---

## 13. Performance budgets

| Surface | Budget | Measured by |
| --- | --- | --- |
| Marketing page first load JS | {{≤ 140 kB}} | build output |
| Marketing LCP (mobile, p75) | {{≤ 2.5 s}} | {{CrUX / Lighthouse CI}} |
| Editor bundle | not shipped to visitors | route split |
| Heavy libraries (pdf.js, OCR, editor) | dynamic import, only on the route that needs them | grep in CI |
| Public pages | static, revalidated on publish | route table |

---

## 14. Accessibility and quality bars

- WCAG {{2.2 AA}}; DESIGN_PRD owns contrast and focus styles, this document
  owns the rule that every interactive element is reachable by keyboard and
  every image has alt text (enforced in the block fields).
- Reduced motion respected via tokens.
- Forms: server-side errors mapped back to fields; no silent failure.

---

## 15. Deployment

**15.1 Branching.** Feature branches → `main`; `main` deploys to production.
`main` is synced with merge commits, never force-pushed.

**15.2 Build.** `next build` must succeed with the database unreachable
(reads fail soft). Lockfile committed; `npm ci` in CI and on the host.

**15.3 Host settings.** {{Vercel: env vars per §4.1, Supabase integration or
manual; function region; `serverExternalPackages` for native modules; body
size limits respected by chunking.}}

**15.4 DNS cutover.** {{Steps: lower TTL, verify redirects on the new host
against the legacy URL list, switch A/CNAME, HSTS preload after a clean
week, email domain (SPF/DKIM/DMARC) for the mailer.}}

**15.5 Rollback.** Host-level redeploy of the previous build; content-level
rollback per page (§9.2). Database migrations are forward-only and additive;
a rollback never requires a down migration.

---

## 16. Operations and runbooks

| Situation | Runbook |
| --- | --- |
| Editor refused / "not on the list" | add to `ADMIN_EMAILS` or `admins`; no deploy |
| Payment stuck in pending | {{run sync by hand; check webhook deliveries}} |
| Error digest reported by a visitor | query `ops.errors` by digest |
| Key exposed | rotate at provider, update host env, redeploy, log in §21 |
| Supabase project paused (free tier) | {{restore; expect first request slow}} |
| {{…}} | |

---

## 17. Testing and the verify chain

`npm run verify` runs, in order, and CI runs the same:

1. `typecheck` (tsc strict)
2. `lint`
3. `qa:content` — content rules over every seed and redirect map
4. Unit suites, one per module, plain `tsx` scripts or vitest:
   {{webhook, extraction, quote, auth, routing, mailer, payments, vision,
   integration client, editor, stripe, annotation}}
5. `test:db` — migrations applied to a throwaway Postgres, SQL authorisation
   tests, then the store tests against it (skips cleanly with no server)
6. `build`

**17.1 Rules.**
- A pure module has a test that needs no network and no framework.
- Every gate has a test that proves the refused path.
- Every webhook has a test with a forged signature and a replayed delivery.
- Browser smoke (Playwright) for: sign-in, an edit publishing to a page, the
  main conversion flow end-to-end on a local database. Not required in CI;
  required before a release.
- Nothing is tested against live third-party systems where a test creates a
  real object. Sandboxes or stubs only.

---

## 18. Documentation deliverables

| Doc | Purpose |
| --- | --- |
| `README.md` | run, deploy, where things live |
| `docs/LAUNCH-CHECKLIST.md` | the gate to real customers (§19) |
| `docs/{{FEATURE}}.md` | one per non-trivial capability |
| `docs/*-HANDOFF.md` | for a third party; carries no secrets |
| `CLAUDE.md` / `AGENTS.md` | conventions for coding agents |

---

## 19. Definition of done and launch checklist

Done for a section means its Rules are demonstrated, not described.

- [ ] Verify chain green on `main`; CI green.
- [ ] Every §4.1 variable set in production; every kill switch documented.
- [ ] Every migration applied to production; `bootstrap.sql` regenerated.
- [ ] Gate proven live: {{n}} listed accounts admitted, one unlisted refused.
- [ ] Content rules proven live: a publish with a typed phone number refused.
- [ ] Rollback proven live on one page.
- [ ] Main conversion flow proven live once, then its test artefacts
      cancelled in the line-of-business system.
- [ ] Payment webhook proven live ({{$1 test, then refund; page flips to
      reversed}}).
- [ ] Redirect map: 100 % of legacy URLs resolve in one hop.
- [ ] Headers, robots, sitemap, structured data validated.
- [ ] Performance budgets met on production URLs.
- [ ] Error path proven live (digest appears on the admin index).
- [ ] All keys that were ever pasted anywhere rotated; §21 updated.
- [ ] DNS cutover plan executed; email domain verified.
- [ ] CORE_PRD success metrics have a measurement in place.

---

## 20. Risks and open questions

| # | Risk / question | Impact | Owner | Resolution / due |
| --- | --- | --- | --- | --- |
| 1 | {{}} | | | |

---

## 21. Decision and change log

Append-only. A decision that reverses an earlier one references it.

| Date | Decision | Why | Supersedes |
| --- | --- | --- | --- |
| {{YYYY-MM-DD}} | {{Google-only staff sign-in; four accounts}} | {{}} | |
| {{YYYY-MM-DD}} | {{Rotated: keys X, Y, Z}} | exposed in chat | |

---

## Appendix A — Cross-reference map

| CORE_PRD section | DESIGN_PRD section | MASTER_PRD section |
| --- | --- | --- |
| Goals and metrics | — | §19 (measurement) |
| Audiences and journeys | Page layouts | §7.1 registry, §8.1 populations |
| Offers, rates, facts | Governed blocks | §7.3 canonical record |
| Vocabulary and claims | Voice and tone | §7.4 content rules |
| Integrations required | — | §10 |
| Compliance | — | §11 |

## Appendix B — Glossary

{{Terms this site family uses precisely: seed, registry, governed block,
chrome, lane, hold/release, digest, verify chain…}}
