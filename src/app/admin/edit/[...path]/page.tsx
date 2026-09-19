import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { findPageByKey } from "@/puck/pages";
import { pageData } from "@/puck/render";
import { Editor } from "./Editor";
import { History } from "./History";
import { STORE } from "@/puck/storage";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * /admin/edit/<key>          the visual editor
 * /admin/edit/<key>/history  the publish history, with rollback
 *
 * Gated on the server on every render, and only registry keys resolve.
 */
export default async function EditPage({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const history = path[path.length - 1] === "history";
  const key = (history ? path.slice(0, -1) : path).join("/");
  await requireAdmin(`/admin/edit/${path.join("/")}`);
  const page = findPageByKey(key);
  if (!page) notFound();
  if (history) return <History pageKey={page.key} label={page.label} versions={await STORE.versions(page.key)} />;
  const data = await pageData(page);
  return <Editor pageKey={page.key} path={page.path} kind={page.kind ?? "page"} initialData={data} />;
}
