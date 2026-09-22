# Security

**Reporting.** Email the repository owner with the details. Reports are acknowledged within two business days.

**What this template enforces.**
- One gate: Supabase Google OAuth, with an allowlist checked on every request. No password, magic-link, access-code or development bypass.
- Row-level security on every table, no policies for the API roles; the service-role key is server-only.
- Security headers on every response; `/admin` is never indexed.
- CI: typecheck, lint, content rules, tests and build (`verify`), plus `npm audit` on production dependencies, a key-prefix grep and CodeQL (`security`). Dependabot keeps dependencies current weekly.

**Patch expectations for sites built from this template.** Critical within 24 hours, high within 7 days, medium within 30 days, low with the next scheduled update. `docs/MASTER_PRD.md` §11 and §17 carry the full baseline a site adopts.
