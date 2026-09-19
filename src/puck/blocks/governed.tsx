import { Section, Eyebrow, Heading, Text, Card, type Tone } from "@/ds";
import { SITE, addressLine } from "@/content/site";

/**
 * GOVERNED BLOCKS. Their fields choose WHAT to show and HOW; never the
 * value. The value is the canonical record, so it cannot go stale on a page.
 */

type Common = { tone: Tone; spacing: "none" | "tight" | "normal" | "loose" };

export function ContactDetails({ title, showPhone, showEmail, showAddress, showHours, tone, spacing }: Common & {
  title: string; showPhone: boolean; showEmail: boolean; showAddress: boolean; showHours: boolean;
}) {
  const inv = tone === "inverse";
  return (
    <Section tone={tone} spacing={spacing}>
      {title ? <Heading level={2} inverse={inv}>{title}</Heading> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "var(--space-6)", width: "100%" }}>
        {showPhone ? <Card><Eyebrow>Phone</Eyebrow><a href={`tel:${SITE.phone.e164}`} style={{ fontSize: "var(--size-lg)", fontWeight: "var(--weight-medium)" }}>{SITE.phone.display}</a></Card> : null}
        {showEmail ? <Card><Eyebrow>Email</Eyebrow><a href={`mailto:${SITE.email}`} style={{ fontSize: "var(--size-lg)", fontWeight: "var(--weight-medium)", wordBreak: "break-all" }}>{SITE.email}</a></Card> : null}
        {showAddress ? <Card><Eyebrow>Address</Eyebrow><Text>{addressLine()}</Text></Card> : null}
        {showHours ? (
          <Card><Eyebrow>Hours</Eyebrow>
            <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--space-2) var(--space-6)", fontSize: "var(--size-sm)" }}>
              {SITE.hours.map((h) => [<dt key={`d${h.days}`} style={{ color: "var(--text-muted)" }}>{h.days}</dt>, <dd key={`h${h.days}`} style={{ margin: 0 }}>{h.hours}</dd>])}
            </dl>
          </Card>
        ) : null}
      </div>
    </Section>
  );
}

export function BusinessFacts({ template, tone, spacing }: Common & { template: string }) {
  const inv = tone === "inverse";
  const text = template
    .replace(/\{name\}/g, SITE.name).replace(/\{legalName\}/g, SITE.legalName)
    .replace(/\{founded\}/g, String(SITE.foundedYear)).replace(/\{years\}/g, String(new Date().getFullYear() - SITE.foundedYear))
    .replace(/\{city\}/g, SITE.address.city).replace(/\{region\}/g, SITE.address.region);
  return <Section tone={tone} spacing={spacing}><Text size="lg" inverse={inv}>{text}</Text></Section>;
}
