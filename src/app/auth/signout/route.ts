import { NextResponse } from "next/server";
import { userClient, supabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (supabaseConfigured()) {
    const supabase = await userClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/admin/signin", new URL(request.url).origin), { status: 303 });
}
