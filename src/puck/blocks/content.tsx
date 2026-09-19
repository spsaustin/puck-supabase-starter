import type { CSSProperties, ReactNode } from "react";
import { Section, Eyebrow, Heading, Text, Button, Card, Callout, Divider, type Tone } from "@/ds";

/**
 * CONTENT BLOCKS. The editor writes whatever it likes in these. They are built
 * only from src/ds primitives, so a swapped design system restyles them all.
 */

export type Layout = { spacing: "none" | "tight" | "normal" | "loose"; width: "full" | "narrow"; align: "left" | "center"; anchor: string };
export const defaultLayout: Layout = { spacing: "normal", width: "full", align: "left", anchor: "" };

type Common = { tone: Tone; layout: Layout };
const inv = (t: Tone) => t === "inverse";

export function Hero({ eyebrow, headline, subhead, primaryLabel, primaryHref, secondaryLabel, secondaryHref, tone, layout }: Common & {
  eyebrow: string; headline: string; subhead: string; primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string;
}) {
  return (
    <Section tone={tone} spacing={layout.spacing} width={layout.width} align={layout.align} id={layout.anchor || undefined}>
      {eyebrow ? <Eyebrow inverse={inv(tone)}>{eyebrow}</Eyebrow> : null}
      <Heading level={1} inverse={inv(tone)} style={{ maxWidth: "20ch" }}>{headline}</Heading>
      {subhead ? <Text size="lg" muted inverse={inv(tone)}>{subhead}</Text> : null}
      {primaryLabel || secondaryLabel ? (
        <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", justifyContent: layout.align === "center" ? "center" : "flex-start" }}>
          {primaryLabel ? <Button href={primaryHref || "#"}>{primaryLabel}</Button> : null}
          {secondaryLabel ? <Button href={secondaryHref || "#"} tone="secondary">{secondaryLabel}</Button> : null}
        </div>
      ) : null}
    </Section>
  );
}

export function Prose({ eyebrow, title, body, tone, layout }: Common & { eyebrow: string; title: string; body: string }) {
  return (
    <Section tone={tone} spacing={layout.spacing} width={layout.width} align={layout.align} id={layout.anchor || undefined}>
      {eyebrow ? <Eyebrow inverse={inv(tone)}>{eyebrow}</Eyebrow> : null}
      {title ? <Heading level={2} inverse={inv(tone)}>{title}</Heading> : null}
      {body.split(/\n{2,}/).map((para, i) => <Text key={i} inverse={inv(tone)}>{para}</Text>)}
    </Section>
  );
}

export function FeatureGrid({ eyebrow, title, items, columns, tone, layout }: Common & { eyebrow: string; title: string; columns: number; items: { title: string; body: string }[] }) {
  return (
    <Section tone={tone} spacing={layout.spacing} width={layout.width} align={layout.align} id={layout.anchor || undefined}>
      {eyebrow ? <Eyebrow inverse={inv(tone)}>{eyebrow}</Eyebrow> : null}
      {title ? <Heading level={2} inverse={inv(tone)}>{title}</Heading> : null}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${Math.round(1200 / Math.max(1, columns)) - 40}px), 1fr))`, gap: "var(--space-6)", width: "100%", textAlign: "left" }}>
        {items.map((it, i) => (
          <Card key={i}>
            <Heading level={3} size="sm">{it.title}</Heading>
            <Text muted size="sm">{it.body}</Text>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function Stats({ items, tone, layout }: Common & { items: { value: string; label: string }[] }) {
  return (
    <Section tone={tone} spacing={layout.spacing} width={layout.width} align={layout.align} id={layout.anchor || undefined}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "var(--space-8)", width: "100%" }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <span style={{ fontSize: "var(--size-4xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", lineHeight: "var(--leading-tight)", color: inv(tone) ? "var(--text-on-inverse)" : "var(--text-strong)" }}>{it.value}</span>
            <Text size="sm" muted inverse={inv(tone)}>{it.label}</Text>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function CtaBand({ title, body, buttonLabel, buttonHref, tone, layout }: Common & { title: string; body: string; buttonLabel: string; buttonHref: string }) {
  return (
    <Section tone={tone} spacing={layout.spacing} width={layout.width} align={layout.align} id={layout.anchor || undefined}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-8)", flexWrap: "wrap", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Heading level={2} size="md" inverse={inv(tone)}>{title}</Heading>
          {body ? <Text muted inverse={inv(tone)}>{body}</Text> : null}
        </div>
        {buttonLabel ? <Button href={buttonHref || "#"} tone={inv(tone) ? "secondary" : "primary"}>{buttonLabel}</Button> : null}
      </div>
    </Section>
  );
}

export function Faq({ title, items, tone, layout }: Common & { title: string; items: { question: string; answer: string }[] }) {
  return (
    <Section tone={tone} spacing={layout.spacing} width={layout.width} align={layout.align} id={layout.anchor || undefined}>
      {title ? <Heading level={2} inverse={inv(tone)}>{title}</Heading> : null}
      <div style={{ display: "flex", flexDirection: "column", width: "100%", textAlign: "left" }}>
        {items.map((it, i) => (
          <details key={i} style={{ borderTop: "1px solid var(--line-hairline)", padding: "var(--space-6) 0" }}>
            <summary style={{ cursor: "pointer", fontWeight: "var(--weight-medium)", color: inv(tone) ? "var(--text-on-inverse)" : "var(--text-strong)" }}>{it.question}</summary>
            <div style={{ paddingTop: "var(--space-4)" }}><Text muted inverse={inv(tone)}>{it.answer}</Text></div>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function Notice({ title, body, kind, tone, layout }: Common & { title: string; body: string; kind: "info" | "success" | "warn" | "danger" }) {
  return (
    <Section tone={tone} spacing={layout.spacing} width={layout.width} align={layout.align} id={layout.anchor || undefined}>
      <Callout title={title} tone={kind}>{body}</Callout>
    </Section>
  );
}

export function Image({ src, alt, caption, maxWidth, tone, layout }: Common & { src: string; alt: string; caption: string; maxWidth: number }) {
  return (
    <Section tone={tone} spacing={layout.spacing} width={layout.width} align={layout.align} id={layout.anchor || undefined}>
      <figure style={{ margin: 0, maxWidth: maxWidth ? `${maxWidth}px` : "100%", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- editor-supplied URLs are not in next.config images.
          <img src={src} alt={alt} style={{ borderRadius: "var(--radius-card)" }} />
        ) : (
          <div style={{ aspectRatio: "16/9", background: "var(--surface-sunken)", borderRadius: "var(--radius-card)", display: "grid", placeItems: "center", color: "var(--text-faint)", fontSize: "var(--size-sm)" }}>Add an image address</div>
        )}
        {caption ? <figcaption><Text size="sm" muted inverse={inv(tone)}>{caption}</Text></figcaption> : null}
      </figure>
    </Section>
  );
}

export function Spacer({ height }: { height: number }) {
  return <div aria-hidden style={{ height: `${height}px` }} />;
}

export function Rule({ tone }: { tone: Tone }) {
  return <Section tone={tone} spacing="none"><Divider /></Section>;
}

/** How Puck hands a slot to a block: a render function, called where the children go. */
export type SlotRender = (props?: { style?: CSSProperties; className?: string; minEmptyHeight?: number }) => ReactNode;

/** A section that holds other blocks, with the same tone and layout knobs. */
export function Group({ children, tone, layout }: Common & { children: SlotRender }) {
  return <Section tone={tone} spacing={layout.spacing} width={layout.width} align={layout.align} id={layout.anchor || undefined}>{children({ minEmptyHeight: 96 })}</Section>;
}
