import Link from "next/link";
import { SITE } from "@/content/site";

/**
 * THE CHROME: header and footer. One Puck page holds both, edited once,
 * rendered around every public page by the layout.
 */

export type NavLink = { label: string; href: string };

export function SiteHeader({ links, ctaLabel, ctaHref }: { links: NavLink[]; ctaLabel: string; ctaHref: string }) {
  return (
    <header style={{ borderBottom: "1px solid var(--line-hairline)", background: "var(--surface-card)", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "var(--space-5) var(--gutter)", display: "flex", alignItems: "center", gap: "var(--space-8)" }}>
        <Link href="/" style={{ fontWeight: "var(--weight-semibold)", color: "var(--text-strong)", textDecoration: "none", fontSize: "var(--size-md)" }}>{SITE.name}</Link>
        <nav aria-label="Primary" style={{ display: "flex", gap: "var(--space-6)", marginLeft: "auto", flexWrap: "wrap" }}>
          {links.map((l, i) => <Link key={i} href={l.href} style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "var(--size-sm)" }}>{l.label}</Link>)}
        </nav>
        {ctaLabel ? <Link href={ctaHref || "#"} style={{ background: "var(--action-primary)", color: "var(--action-primary-text)", padding: "var(--space-3) var(--space-6)", borderRadius: "var(--radius-control)", fontSize: "var(--size-sm)", fontWeight: "var(--weight-medium)", textDecoration: "none" }}>{ctaLabel}</Link> : null}
      </div>
    </header>
  );
}

export function SiteFooter({ blurb, links, showContact }: { blurb: string; links: NavLink[]; showContact: boolean }) {
  return (
    <footer style={{ borderTop: "1px solid var(--line-hairline)", background: "var(--surface-sunken)", marginTop: "auto" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "var(--space-11) var(--gutter)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "var(--space-9)", fontSize: "var(--size-sm)", color: "var(--text-muted)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <strong style={{ color: "var(--text-strong)" }}>{SITE.name}</strong>
          {blurb ? <p style={{ maxWidth: "40ch" }}>{blurb}</p> : null}
        </div>
        <nav aria-label="Footer" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {links.map((l, i) => <Link key={i} href={l.href} style={{ color: "inherit", textDecoration: "none" }}>{l.label}</Link>)}
        </nav>
        {showContact ? (
          <address style={{ fontStyle: "normal", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <a href={`tel:${SITE.phone.e164}`} style={{ color: "inherit", textDecoration: "none" }}>{SITE.phone.display}</a>
            <a href={`mailto:${SITE.email}`} style={{ color: "inherit", textDecoration: "none" }}>{SITE.email}</a>
            <span>{SITE.address.street}, {SITE.address.city}, {SITE.address.region} {SITE.address.postal}</span>
          </address>
        ) : null}
        <p style={{ gridColumn: "1 / -1", fontSize: "var(--size-2xs)", color: "var(--text-faint)" }}>© {new Date().getFullYear()} {SITE.legalName}</p>
      </div>
    </footer>
  );
}
