import { NextResponse, type NextRequest } from "next/server";
import { refreshSession } from "@/lib/supabase/proxy";

/**
 * Runs in front of the admin surface and the sign-in flow. Refreshes the
 * Supabase session cookies, and turns an anonymous visit to /admin into a
 * redirect to sign-in before any page code runs. The allowlist check itself
 * lives in src/lib/auth.ts and runs again in every admin page and API route:
 * this is the outer fence, not the gate.
 */
export async function proxy(request: NextRequest) {
  const { response, email } = await refreshSession(request);
  const { pathname } = request.nextUrl;
  const isSignin = pathname.startsWith("/admin/signin");
  const devFallback = process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL;
  if (pathname.startsWith("/admin") && !isSignin && !email && !devFallback) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const url = request.nextUrl.clone();
    url.pathname = "/admin/signin";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/puck/:path*", "/auth/:path*"],
};
