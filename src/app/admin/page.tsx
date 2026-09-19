import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PAGES } from "@/puck/pages";
import { STORE, CONTENT_PERSISTED } from "@/puck/storage";
import { Section, Heading, Text, Card, Callout, Badge, Button } from "@/ds";

export const metadata: Metadata = { title: "Editor", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** The editor's front door: every editable page, and whether it has been edited. */
export default async function AdminHome() {
  const admin = await requireAdmin("/admin");
  const edited = new Set(await STORE.list());
  return (
    <main style={{ flex: 1 }}>
      <Section spacing="tight">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-6)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <Heading level={1} size="lg">Editor</Heading>
            <Text size="sm" muted>Signed in as <code>{admin.email}</code> with Google</Text>
          </div>
          <div style={{ display: "flex", gap: "var(--space-4)" }}>
            <Button href="/" tone="secondary">View the site</Button>
            <form action="/auth/signout" method="post"><Button type="submit" tone="ghost">Sign out</Button></form>
          </div>
        </div>

        {!CONTENT_PERSISTED ? (
          <Callout tone="warn" title="Publishes on this deployment do not survive a redeploy">
            No service key is configured, so pages are written to the local disk (.content/), which an ephemeral host discards on the next deploy. Add the Supabase integration (or set SUPABASE_SERVICE_ROLE_KEY) and apply supabase/migrations before editing for real.
          </Callout>
        ) : null}

        <Callout tone="info" title="What you can and cannot change here">
          Copy, blocks and their order on any page, plus the header and footer. The business name, phone, address, hours and founding year are not typed into pages; they render from the canonical record (src/content/site.ts) through the blocks under Governed facts, so changing one changes every page at once.
        </Callout>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: "var(--space-6)", width: "100%" }}>
          {PAGES.map((p) => (
            <Card key={p.key} tone={p.kind === "chrome" ? "sunken" : "card"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-4)" }}>
                <strong style={{ color: "var(--text-strong)" }}>{p.label}</strong>
                {edited.has(p.key) ? <Badge tone="success">Edited</Badge> : <Badge>Default</Badge>}
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--size-2xs)", color: "var(--text-faint)" }}>{p.kind === "chrome" ? "shown on every page" : p.path}</span>
              <div style={{ display: "flex", gap: "var(--space-5)", fontSize: "var(--size-sm)" }}>
                <Link href={`/admin/edit/${p.key}`}>Edit</Link>
                {p.kind !== "chrome" ? <Link href={p.path} style={{ color: "var(--text-muted)" }}>View</Link> : null}
                {edited.has(p.key) ? <Link href={`/admin/edit/${p.key}/history`} style={{ color: "var(--text-muted)" }}>History</Link> : null}
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
