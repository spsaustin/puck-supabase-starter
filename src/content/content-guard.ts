/**
 * THE CONTENT GUARD.
 *
 * Runs on every publish (src/app/api/puck) and over every seed in CI
 * (scripts/content-lint.ts), from one list of rules, so the editor and the
 * build can never disagree about what is publishable.
 *
 * Canonical facts must not be typed into page copy: a phone number typed into
 * a paragraph is a phone number that goes stale. The governed blocks render
 * them from src/content/site.ts instead. Add your own rules — banned claims,
 * house style — to the same list.
 *
 * No framework imports and no path aliases, so the CI script can load it
 * with plain tsx.
 */

export type Finding = { rule: string; value: string; where: string };

/** Fields that legitimately hold URLs, ids or block references, never prose. */
const NON_PROSE_KEYS = new Set(["id", "href", "src", "slug", "icon", "tone", "type", "key", "anchor", "_meta"]);

export const RULES: { rule: string; test: RegExp; explain: string }[] = [
  { rule: "phone-number", test: /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/, explain: "Use the Contact details block; it renders the canonical number." },
  { rule: "street-address", test: /\b\d{2,5}\s+(?:[NSEW]\.?\s+)?\w+(?:\s+\w+)?\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Ln|Lane|Dr|Drive|Way|Pkwy|Parkway)\b\.?/i, explain: "Use the Contact details block; it renders the canonical address." },
  { rule: "founding-year", test: /\b(?:founded|established|since)\b[^.]{0,30}\b(?:19|20)\d{2}\b/i, explain: "Use the Business facts block; the founding year renders from the canonical record." },
];

export function explainRule(rule: string): string {
  return RULES.find((r) => r.rule === rule)?.explain ?? rule;
}

/** Walks every prose string in a Puck data tree and reports rule hits. */
export function auditContent(data: unknown, where = "page"): Finding[] {
  const findings: Finding[] = [];
  walk(data, where, (value, path) => {
    for (const r of RULES) {
      const m = value.match(r.test);
      if (m) findings.push({ rule: r.rule, value: m[0], where: path });
    }
  });
  return findings;
}

function walk(node: unknown, path: string, visit: (value: string, path: string) => void): void {
  if (typeof node === "string") { if (node.trim()) visit(node, path); return; }
  if (Array.isArray(node)) { node.forEach((n, i) => walk(n, `${path}[${i}]`, visit)); return; }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (NON_PROSE_KEYS.has(k)) continue;
      walk(v, `${path}.${k}`, visit);
    }
  }
}
