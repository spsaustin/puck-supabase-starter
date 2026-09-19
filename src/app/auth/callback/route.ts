import { NextResponse } from "next/server";
import { userClient } from "@/lib/supabase/server";

/** Where Supabase sends the browser back after Google. Exchanges the code for a session cookie. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";
  const safeNext = next.startsWith("/admin") ? next : "/admin";
  if (!code) return NextResponse.redirect(new URL("/admin/signin?error=No+code+returned", url.origin));
  const supabase = await userClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL(`/admin/signin?error=${encodeURIComponent(error.message)}`, url.origin));
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
