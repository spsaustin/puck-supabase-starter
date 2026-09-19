import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { Data } from "@puckeditor/core";
import { getAdmin } from "@/lib/auth";
import { STORE } from "@/puck/storage";
import { findPageByKey, isValidPageKey, PAGES } from "@/puck/pages";
import { auditContent } from "@/content/content-guard";

/**
 * Publish. Three checks before anything is written: the caller is an admin,
 * the key is a registered page (no inventing pages), and the content passes
 * the guard. Then the page is revalidated so the edit shows on the next
 * request.
 */
export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: { pageKey?: string; data?: Data };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Malformed request." }, { status: 400 }); }
  const { pageKey, data } = body;
  if (!pageKey || !data || !isValidPageKey(pageKey) || !findPageByKey(pageKey)) return NextResponse.json({ error: "That page is not editable." }, { status: 400 });

  const findings = auditContent(data, pageKey);
  if (findings.length) {
    return NextResponse.json({ error: "This edit puts a canonical fact into page copy.", detail: "The phone number, address and founding year render from the canonical record so they cannot drift. Use the block under Governed facts instead of typing the value.", findings }, { status: 422 });
  }

  await STORE.put(pageKey, data, admin.email);
  const page = findPageByKey(pageKey)!;
  if (page.kind === "chrome") for (const p of PAGES) if (p.kind !== "chrome") revalidatePath(p.path);
  else revalidatePath(page.path);
  return NextResponse.json({ ok: true, path: page.path, savedBy: admin.email, savedAt: new Date().toISOString() });
}
