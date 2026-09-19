/**
 * THE CANONICAL RECORD.
 *
 * Facts that must be identical everywhere they appear — the business name,
 * phone, address, hours, founding year — live here and only here. Pages do
 * not type them; governed blocks render them. Change a value once and every
 * page changes with it, and the content guard refuses a publish that types
 * one of these into prose.
 *
 * Replace the placeholder values with the real ones. Nothing else needs to
 * know they changed.
 */
export const SITE = {
  name: "Acme Studio",
  legalName: "Acme Studio, LLC",
  tagline: "A short line about what you do.",
  foundedYear: 2020,
  phone: { e164: "+15125550123", display: "(512) 555-0123" },
  email: "hello@example.com",
  address: { street: "100 Congress Ave, Suite 200", city: "Austin", region: "TX", postal: "78701", country: "US" },
  hours: [
    { days: "Monday – Friday", hours: "9:00 am – 5:00 pm" },
    { days: "Saturday – Sunday", hours: "Closed" },
  ],
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
  ],
  /** Where the site lives once deployed; used for canonical URLs and sitemap. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export function addressLine(): string {
  const a = SITE.address;
  return `${a.street}, ${a.city}, ${a.region} ${a.postal}`;
}
