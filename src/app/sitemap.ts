import type { MetadataRoute } from "next";
import { PAGES } from "@/puck/pages";
import { SITE } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.filter((p) => p.kind !== "chrome").map((p) => ({ url: `${SITE.url}${p.path}` }));
}
