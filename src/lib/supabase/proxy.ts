import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Keeps the Supabase session fresh on every request that passes through the
 * proxy, the way @supabase/ssr expects: read the cookies, let the client
 * refresh an expiring token, write the new cookies onto the response.
 *
 * Returns the user (or null) alongside the response so the proxy can gate
 * /admin without a second round trip.
 */
export async function refreshSession(request: NextRequest): Promise<{ response: NextResponse; email: string | null }> {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return { response, email: null };

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // getUser() validates the token with Supabase rather than trusting the cookie.
  const { data } = await supabase.auth.getUser();
  return { response, email: data.user?.email ?? null };
}
