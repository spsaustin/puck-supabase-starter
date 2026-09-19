import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

/**
 * DESIGN SYSTEM SLOT — primitives.
 *
 * The block catalog (src/puck) builds every block from these few components
 * and the tokens in tokens.css, and from nothing else. To bring your own
 * design system, re-export its equivalents from this file under these names
 * and props; the blocks, the editor and the public pages need no change.
 *
 * Keep the set small on purpose. A block that needs something not here is a
 * block that is reaching past the design system.
 */

export type Tone = "page" | "sunken" | "card" | "inverse";
export type ButtonTone = "primary" | "secondary" | "ghost";

/** Section: full-bleed background with a centred, gutter-padded container. */
export function Section({ tone = "page", spacing = "normal", width = "full", align = "left", id, children, style }: {
  tone?: Tone; spacing?: "none" | "tight" | "normal" | "loose"; width?: "full" | "narrow"; align?: "left" | "center";
  id?: string; children: ReactNode; style?: CSSProperties;
}) {
  const pad = { none: "0", tight: "var(--pad-section-tight)", normal: "var(--pad-section)", loose: "calc(var(--pad-section) * 1.4)" }[spacing];
  return (
    <section id={id} data-tone={tone} style={{ background: surfaceFor(tone), color: tone === "inverse" ? "var(--text-on-inverse)" : "var(--text-body)", padding: `${pad} var(--gutter)`, ...style }}>
      <div style={{ maxWidth: width === "narrow" ? "var(--container-narrow)" : "var(--container-max)", margin: "0 auto", textAlign: align, display: "flex", flexDirection: "column", gap: "var(--space-8)", alignItems: align === "center" ? "center" : "stretch" }}>
        {children}
      </div>
    </section>
  );
}

export function surfaceFor(tone: Tone): string {
  return { page: "var(--surface-page)", sunken: "var(--surface-sunken)", card: "var(--surface-card)", inverse: "var(--surface-inverse)" }[tone];
}

export function Eyebrow({ children, inverse }: { children: ReactNode; inverse?: boolean }) {
  return <span style={{ display: "inline-block", fontSize: "var(--size-xs)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", color: inverse ? "var(--text-muted-on-inverse)" : "var(--text-muted)" }}>{children}</span>;
}

export function Heading({ level = 2, children, size, inverse, style }: { level?: 1 | 2 | 3 | 4; children: ReactNode; size?: "sm" | "md" | "lg" | "xl"; inverse?: boolean; style?: CSSProperties }) {
  const Tag = `h${level}` as const;
  const fs = { sm: "var(--size-xl)", md: "var(--size-2xl)", lg: "var(--size-4xl)", xl: "var(--size-5xl)" }[size ?? (level === 1 ? "xl" : level === 2 ? "lg" : "md")];
  return <Tag style={{ fontSize: fs, color: inverse ? "var(--text-on-inverse)" : undefined, whiteSpace: "pre-line", ...style }}>{children}</Tag>;
}

export function Text({ children, muted, size = "md", inverse, style }: { children: ReactNode; muted?: boolean; size?: "sm" | "md" | "lg"; inverse?: boolean; style?: CSSProperties }) {
  const color = inverse ? (muted ? "var(--text-muted-on-inverse)" : "var(--text-on-inverse)") : muted ? "var(--text-muted)" : "var(--text-body)";
  return <p style={{ fontSize: `var(--size-${size})`, color, maxWidth: "65ch", whiteSpace: "pre-line", ...style }}>{children}</p>;
}

export function Button({ children, href, tone = "primary", onClick, type = "button", disabled, style }: {
  children: ReactNode; href?: string; tone?: ButtonTone; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; style?: CSSProperties;
}) {
  const look: Record<ButtonTone, CSSProperties> = {
    primary: { background: "var(--action-primary)", color: "var(--action-primary-text)", border: "1px solid transparent" },
    secondary: { background: "var(--action-secondary)", color: "var(--action-secondary-text)", border: "1px solid var(--line-subtle)" },
    ghost: { background: "transparent", color: "inherit", border: "1px solid transparent" },
  };
  const base: CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "var(--space-3)", height: "var(--control-height)",
    padding: "0 var(--space-7)", borderRadius: "var(--radius-control)", fontSize: "var(--size-sm)", fontWeight: "var(--weight-medium)",
    textDecoration: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, fontFamily: "inherit",
    transition: `background var(--dur-fast) var(--ease-standard)`, ...look[tone], ...style,
  };
  if (href && !disabled) return <Link href={href} style={base}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} style={base}>{children}</button>;
}

export function Card({ children, tone = "card", pad = "md", style }: { children: ReactNode; tone?: "card" | "sunken"; pad?: "none" | "md"; style?: CSSProperties }) {
  return (
    <div style={{ background: surfaceFor(tone), border: "1px solid var(--line-hairline)", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-1)", padding: pad === "md" ? "var(--pad-card)" : 0, display: "flex", flexDirection: "column", gap: "var(--space-5)", ...style }}>
      {children}
    </div>
  );
}

export function Callout({ title, children, tone = "info" }: { title?: string; children?: ReactNode; tone?: "info" | "success" | "warn" | "danger" }) {
  return (
    <div role={tone === "danger" ? "alert" : undefined} style={{ background: `var(--tone-${tone}-bg)`, borderLeft: `3px solid var(--tone-${tone})`, borderRadius: "var(--radius-control)", padding: "var(--space-6) var(--space-7)", display: "flex", flexDirection: "column", gap: "var(--space-3)", fontSize: "var(--size-sm)", color: "var(--text-body)" }}>
      {title ? <strong style={{ color: "var(--text-strong)" }}>{title}</strong> : null}
      {children}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warn" | "danger" | "info" }) {
  const color = tone === "neutral" ? "var(--text-muted)" : `var(--tone-${tone})`;
  const bg = tone === "neutral" ? "var(--surface-sunken)" : `var(--tone-${tone}-bg)`;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px var(--space-4)", borderRadius: "var(--radius-pill)", background: bg, color, fontSize: "var(--size-2xs)", fontWeight: "var(--weight-semibold)", letterSpacing: "0.02em" }}>{children}</span>;
}

export function Divider() {
  return <hr style={{ border: 0, borderTop: "1px solid var(--line-hairline)", margin: 0, width: "100%" }} />;
}
