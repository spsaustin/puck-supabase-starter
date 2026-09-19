import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase from the server.
 *
 * Two clients, two jobs:
 *
 *  - userClient(): the anon key plus the visitor's cookies. Knows who is
 *    signed in; sees only what row security lets that user see. Used for
 *    auth.
 *  - adminClient(): the service-role key, no cookies. Bypasses row security,
 *    which is why it is only ever reached from code that has already checked
 *    the caller (src/lib/auth.ts). It is the page store's connection.
 *
 * The Vercel ↔ Supabase integration sets these variables at deploy; locally
 * they come from .env.local (see .env.example).
 */

export function supabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? "",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "",
  };
}

export function supabaseConfigured(): boolean {
  const e = supabaseEnv();
  return Boolean(e.url && e.anonKey);
}

/** True when publishes outlive a deploy: the service key is what the store writes with. */
export function contentPersisted(): boolean {
  const e = supabaseEnv();
  return Boolean(e.url && e.serviceKey);
}

export async function userClient() {
  const e = supabaseEnv();
  const jar = await cookies();
  return createServerClient(e.url, e.anonKey, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        // A Server Component cannot set cookies; the proxy refreshes the
        // session on the way in, so ignoring the write here is safe.
        try { list.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch { /* read-only context */ }
      },
    },
  });
}

let admin: SupabaseClient | null = null;
export function adminClient(): SupabaseClient {
  const e = supabaseEnv();
  if (!e.url || !e.serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return (admin ??= createClient(e.url, e.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }));
}
