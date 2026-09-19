import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PAGES, findPageByPath } from "@/puck/pages";
import { renderPage, pageRootProps } from "@/puck/render";

/**
 * Every registered page renders through this one route. Adding a page is one
 * entry in src/puck/pages.ts; nothing here changes.
 *
 * Pages are statically rendered and revalidated when the editor publishes
 * (src/app/api/puck calls revalidatePath), so visitors get a cached page
 * and an edit appears within a request.
 */
export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return PAGES.filter((p) => p.kind !== "chrome").map((p) => ({ slug: p.path === "/" ? [] : p.path.replace(/^\//, "").split("/") }));
}

function pathFrom(slug?: string[]) {
  return slug?.length ? `/${slug.join("/")}` : "/";
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = findPageByPath(pathFrom(slug));
  if (!page) return {};
  const root = await pageRootProps(page);
  return { title: root.title || page.label, description: root.description || undefined, robots: root.noindex ? { index: false, follow: false } : undefined, alternates: { canonical: page.path } };
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const page = findPageByPath(pathFrom(slug));
  if (!page) notFound();
  return renderPage(page);
}
