import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/auth";
import { STORE } from "@/puck/storage";
import { findPageByKey, PAGES } from "@/puck/pages";

export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  let body: { pageKey?: string; version?: number };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Malformed request." }, { status: 400 }); }
  const page = body.pageKey ? findPageByKey(body.pageKey) : undefined;
  if (!page || !Number.isInteger(body.version) || (body.version as number) < 1) return NextResponse.json({ error: "Unknown page or version." }, { status: 400 });
  const ok = await STORE.rollback(page.key, body.version as number, admin.email);
  if (!ok) return NextResponse.json({ error: "That version does not exist." }, { status: 404 });
  if (page.kind === "chrome") for (const p of PAGES) if (p.kind !== "chrome") revalidatePath(p.path);
  else revalidatePath(page.path);
  return NextResponse.json({ ok: true });
}
