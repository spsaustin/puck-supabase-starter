import type { Data } from "@puckeditor/core";
import { defaultHeaderProps, defaultFooterProps } from "./config";

/**
 * THE PAGE REGISTRY.
 *
 * Every editable public page is listed here, with a seed composition, so the
 * editor opens on a designed page rather than a blank canvas and a page that
 * has never been edited still renders. Published edits supersede the seed.
 *
 * Only keys in this list can be edited or rendered. An application route
 * (a form, a dashboard, anything with state) is not content; leave it out
 * and build it in code.
 *
 * "chrome" is the header and footer: one entry, edited once, rendered around
 * every page.
 */

export type EditablePage = {
  key: string;
  path: string;
  label: string;
  seed: () => Data;
  kind?: "page" | "chrome";
};

export const CHROME_KEY = "chrome";

const b = (type: string, props: Record<string, unknown>) => ({ type, props: { id: `${type}-${stableId(props)}`, ...props } });
const page = (content: Data["content"], root: { title: string; description: string }): Data => ({ content, root: { props: { ...root, noindex: false } } } as unknown as Data);
const layout = (spacing = "normal", width = "full", align = "left") => ({ spacing, width, align, anchor: "" });

export const PAGES: EditablePage[] = [
  {
    key: "home", path: "/", label: "Home",
    seed: () => page([
      b("Hero", { eyebrow: "Welcome", headline: "Say what you do,\nin one line.", subhead: "Then one sentence on why it matters to the person reading. Everything on this page is a block; open the editor and change any of it.", primaryLabel: "Get in touch", primaryHref: "/contact", secondaryLabel: "About us", secondaryHref: "/about", tone: "inverse", layout: layout("loose") }),
      b("FeatureGrid", { eyebrow: "What we do", title: "Three things, said plainly.", columns: 3, items: [{ title: "First", body: "A sentence about the first thing." }, { title: "Second", body: "A sentence about the second thing." }, { title: "Third", body: "A sentence about the third thing." }], tone: "page", layout: layout() }),
      b("Stats", { items: [{ value: "10×", label: "A figure that means something" }, { value: "98%", label: "Another figure" }, { value: "24/7", label: "A third" }], tone: "sunken", layout: layout("tight") }),
      b("BusinessFacts", { template: "{name} has served {city}, {region} since {founded}.", tone: "page", spacing: "tight" }),
      b("CtaBand", { title: "Ready when you are.", body: "", buttonLabel: "Get in touch", buttonHref: "/contact", tone: "inverse", layout: layout("tight") }),
    ], { title: "Home", description: "A short description for search results." }),
  },
  {
    key: "about", path: "/about", label: "About",
    seed: () => page([
      b("Prose", { eyebrow: "About", title: "Who we are", body: "Two or three paragraphs about the people and the work.\n\nA blank line starts a new paragraph.", tone: "page", layout: layout("normal", "narrow") }),
      b("Faq", { title: "Questions", items: [{ question: "How does editing work?", answer: "Sign in at /admin, open a page, change blocks, publish." }, { question: "Where do the phone number and address come from?", answer: "From the canonical record in src/content/site.ts. Governed blocks render them; pages never type them." }], tone: "sunken", layout: layout("normal", "narrow") }),
    ], { title: "About", description: "" }),
  },
  {
    key: "contact", path: "/contact", label: "Contact",
    seed: () => page([
      b("Prose", { eyebrow: "Contact", title: "Get in touch", body: "Say how you prefer to be reached, and when.", tone: "page", layout: layout("tight", "narrow") }),
      b("ContactDetails", { title: "", showPhone: true, showEmail: true, showAddress: true, showHours: true, tone: "page", spacing: "tight" }),
    ], { title: "Contact", description: "" }),
  },
  {
    key: CHROME_KEY, path: "/", label: "Header and footer", kind: "chrome",
    seed: () => ({ content: [b("SiteHeader", defaultHeaderProps()), b("SiteFooter", defaultFooterProps())], root: { props: {} } } as unknown as Data),
  },
];

export function findPageByKey(key: string): EditablePage | undefined {
  return PAGES.find((p) => p.key === key);
}
export function findPageByPath(path: string): EditablePage | undefined {
  return PAGES.find((p) => p.kind !== "chrome" && p.path === path);
}
export function isValidPageKey(key: string): boolean {
  return /^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/.test(key);
}

/** Stable ids so a seed produces identical data on every render. */
function stableId(props: Record<string, unknown>): string {
  const s = JSON.stringify(props);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}
