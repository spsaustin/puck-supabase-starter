import type { Config, Slot } from "@puckeditor/core";
import { Hero, Prose, FeatureGrid, Stats, CtaBand, Faq, Notice, Image, Spacer, Rule, Group, defaultLayout, type Layout } from "./blocks/content";
import { ContactDetails, BusinessFacts } from "./blocks/governed";
import { SiteHeader, SiteFooter, type NavLink } from "./blocks/chrome";
import type { Tone } from "@/ds";

/**
 * THE BLOCK CATALOG.
 *
 * Three kinds of block:
 *  - Layout: Group (holds other blocks), Spacer, Rule.
 *  - Content: prose and media the editor writes freely.
 *  - Governed: facts from src/content/site.ts. Their fields choose which
 *    facts and how, never what they say. No field in this file accepts a
 *    phone number, an address or a founding year as free text.
 *
 * Every section-level block carries the same Tone and Layout fields, so the
 * editor has one vocabulary for "how does this sit on the page".
 *
 * Deliberately absent: a raw HTML block.
 */

/* ── Shared fields ─────────────────────────────────────────────────── */

const text = (label: string) => ({ type: "text" as const, label });
const textarea = (label: string) => ({ type: "textarea" as const, label });
const number = (label: string, min: number, max: number) => ({ type: "number" as const, label, min, max });
const bool = (label: string) => ({ type: "radio" as const, label, options: [{ label: "Show", value: true }, { label: "Hide", value: false }] });

const toneField = {
  type: "select" as const, label: "Background",
  options: [{ label: "Page", value: "page" }, { label: "Sunken", value: "sunken" }, { label: "Card", value: "card" }, { label: "Inverse", value: "inverse" }],
};
const spacingField = {
  type: "select" as const, label: "Vertical space",
  options: [{ label: "Normal", value: "normal" }, { label: "Tight", value: "tight" }, { label: "Loose", value: "loose" }, { label: "None", value: "none" }],
};
const layoutField = {
  type: "object" as const, label: "Layout",
  objectFields: {
    spacing: spacingField,
    width: { type: "radio" as const, label: "Width", options: [{ label: "Full", value: "full" }, { label: "Narrow", value: "narrow" }] },
    align: { type: "radio" as const, label: "Align", options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }] },
    anchor: text("Anchor id (for #links)"),
  },
};
const linksField = { type: "array" as const, label: "Links", arrayFields: { label: text("Label"), href: text("Link") }, getItemSummary: (i: NavLink) => i.label || "Link" };

/* ── Types ─────────────────────────────────────────────────────────── */

type Common = { tone: Tone; layout: Layout };
export type Props = {
  Hero: Common & { eyebrow: string; headline: string; subhead: string; primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string };
  Prose: Common & { eyebrow: string; title: string; body: string };
  FeatureGrid: Common & { eyebrow: string; title: string; columns: number; items: { title: string; body: string }[] };
  Stats: Common & { items: { value: string; label: string }[] };
  CtaBand: Common & { title: string; body: string; buttonLabel: string; buttonHref: string };
  Faq: Common & { title: string; items: { question: string; answer: string }[] };
  Notice: Common & { title: string; body: string; kind: "info" | "success" | "warn" | "danger" };
  Image: Common & { src: string; alt: string; caption: string; maxWidth: number };
  Spacer: { height: number };
  Rule: { tone: Tone };
  Group: Common & { children: Slot };
  ContactDetails: { title: string; showPhone: boolean; showEmail: boolean; showAddress: boolean; showHours: boolean; tone: Tone; spacing: "none" | "tight" | "normal" | "loose" };
  BusinessFacts: { template: string; tone: Tone; spacing: "none" | "tight" | "normal" | "loose" };
};
export type RootProps = { title: string; description: string; noindex: boolean };
export type ChromeProps = {
  SiteHeader: { links: NavLink[]; ctaLabel: string; ctaHref: string };
  SiteFooter: { blurb: string; links: NavLink[]; showContact: boolean };
};

const common = { tone: "page" as Tone, layout: defaultLayout };

/* ── Page config ───────────────────────────────────────────────────── */

export const config: Config<Props, RootProps> = {
  categories: {
    layout: { title: "Layout", components: ["Group", "Spacer", "Rule"] },
    content: { title: "Content", components: ["Hero", "Prose", "FeatureGrid", "Stats", "CtaBand", "Faq", "Notice", "Image"] },
    governed: { title: "Governed facts", components: ["ContactDetails", "BusinessFacts"] },
  },
  root: {
    fields: {
      title: text("Page title (browser tab and search)"),
      description: textarea("Search description"),
      noindex: { type: "radio", label: "Search engines", options: [{ label: "Index", value: false }, { label: "Hide", value: true }] },
    },
    defaultProps: { title: "", description: "", noindex: false },
    render: ({ children }) => <>{children}</>,
  },
  components: {
    Group: { label: "Section (holds blocks)", fields: { tone: toneField, layout: layoutField, children: { type: "slot" } }, defaultProps: { ...common, children: [] }, render: Group },
    Spacer: { fields: { height: number("Height (px)", 0, 400) }, defaultProps: { height: 48 }, render: Spacer },
    Rule: { label: "Divider", fields: { tone: toneField }, defaultProps: { tone: "page" }, render: Rule },
    Hero: {
      fields: { eyebrow: text("Eyebrow"), headline: textarea("Headline"), subhead: textarea("Subhead"), primaryLabel: text("Primary button"), primaryHref: text("Primary link"), secondaryLabel: text("Secondary button"), secondaryHref: text("Secondary link"), tone: toneField, layout: layoutField },
      defaultProps: { ...common, eyebrow: "", headline: "A headline that says what you do", subhead: "", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "" },
      render: Hero,
    },
    Prose: { fields: { eyebrow: text("Eyebrow"), title: text("Title"), body: textarea("Body (blank line between paragraphs)"), tone: toneField, layout: layoutField }, defaultProps: { ...common, eyebrow: "", title: "", body: "" }, render: Prose },
    FeatureGrid: {
      fields: { eyebrow: text("Eyebrow"), title: text("Title"), columns: number("Columns", 1, 4), items: { type: "array", label: "Items", arrayFields: { title: text("Title"), body: textarea("Body") }, getItemSummary: (i: { title: string }) => i.title || "Item" }, tone: toneField, layout: layoutField },
      defaultProps: { ...common, eyebrow: "", title: "", columns: 3, items: [{ title: "One", body: "" }, { title: "Two", body: "" }, { title: "Three", body: "" }] },
      render: FeatureGrid,
    },
    Stats: {
      fields: { items: { type: "array", label: "Figures", arrayFields: { value: text("Value"), label: text("Label") }, getItemSummary: (i: { value: string }) => i.value || "Figure" }, tone: toneField, layout: layoutField },
      defaultProps: { ...common, items: [{ value: "10×", label: "" }, { value: "24/7", label: "" }] },
      render: Stats,
    },
    CtaBand: { label: "Call to action", fields: { title: text("Title"), body: textarea("Body"), buttonLabel: text("Button"), buttonHref: text("Link"), tone: toneField, layout: layoutField }, defaultProps: { ...common, tone: "inverse", title: "Ready when you are.", body: "", buttonLabel: "Get in touch", buttonHref: "/contact" }, render: CtaBand },
    Faq: {
      label: "FAQ",
      fields: { title: text("Title"), items: { type: "array", label: "Questions", arrayFields: { question: text("Question"), answer: textarea("Answer") }, getItemSummary: (i: { question: string }) => i.question || "Question" }, tone: toneField, layout: layoutField },
      defaultProps: { ...common, title: "Questions", items: [{ question: "", answer: "" }] },
      render: Faq,
    },
    Notice: {
      fields: { title: text("Title"), body: textarea("Body"), kind: { type: "select", label: "Kind", options: [{ label: "Info", value: "info" }, { label: "Success", value: "success" }, { label: "Warning", value: "warn" }, { label: "Danger", value: "danger" }] }, tone: toneField, layout: layoutField },
      defaultProps: { ...common, title: "", body: "", kind: "info" },
      render: Notice,
    },
    Image: { fields: { src: text("Image address (https://… or /path)"), alt: text("Description for screen readers"), caption: text("Caption"), maxWidth: number("Max width (px, 0 = full)", 0, 1400), tone: toneField, layout: layoutField }, defaultProps: { ...common, src: "", alt: "", caption: "", maxWidth: 0 }, render: Image },
    ContactDetails: {
      label: "Contact details",
      fields: { title: text("Title"), showPhone: bool("Phone"), showEmail: bool("Email"), showAddress: bool("Address"), showHours: bool("Hours"), tone: toneField, spacing: spacingField },
      defaultProps: { title: "Contact", showPhone: true, showEmail: true, showAddress: true, showHours: true, tone: "page", spacing: "normal" },
      render: ContactDetails,
    },
    BusinessFacts: {
      label: "Business facts",
      fields: { template: textarea("Sentence — use {name}, {legalName}, {founded}, {years}, {city}, {region}"), tone: toneField, spacing: spacingField },
      defaultProps: { template: "{name} has served {city} since {founded}.", tone: "page", spacing: "tight" },
      render: BusinessFacts,
    },
  },
};

/* ── Chrome config ─────────────────────────────────────────────────── */

export const chromeConfig: Config<ChromeProps> = {
  components: {
    SiteHeader: { label: "Header", fields: { links: linksField, ctaLabel: text("Button label"), ctaHref: text("Button link") }, defaultProps: defaultHeaderProps(), render: SiteHeader },
    SiteFooter: { label: "Footer", fields: { blurb: textarea("Blurb"), links: linksField, showContact: bool("Contact details") }, defaultProps: defaultFooterProps(), render: SiteFooter },
  },
};

export function defaultHeaderProps(): ChromeProps["SiteHeader"] {
  return { links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }], ctaLabel: "Get in touch", ctaHref: "/contact" };
}
export function defaultFooterProps(): ChromeProps["SiteFooter"] {
  return { blurb: "", links: [{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }], showContact: true };
}
