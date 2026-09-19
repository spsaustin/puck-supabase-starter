import "server-only";
import { redirect } from "next/navigation";
import { userClient, adminClient, supabaseConfigured, contentPersisted } from "./supabase/server";

/**
 * THE GATE.
 *
 * Who may edit the site: a signed-in Supabase user whose email is on the
 * admin list. The list is checked on every request, so removing an address
 * revokes access immediately, not when the session happens to lapse.
 *
 * The list has two sources, merged:
 *   - ADMIN_EMAILS, comma-separated, in the environment. Zero setup.
 *   - the `admins` table (supabase/migrations/0001), editable without a
 *     redeploy once the service key is configured.
 *
 * Identity comes from Supabase Auth. Google is wired in the sign-in page;
 * any provider Supabase supports works the same way, because the gate only
 * asks "who is this" and "are they on the list".
 *
 * DEVELOPMENT ONLY: with Supabase unset and NODE_ENV not production, the
 * editor opens for a local reviewer as dev@localhost. This can never engage
 * on a production build.
 */

export type Admin = { email: string; source: "env" | "table" | "dev" };

const DEV_FALLBACK = process.env.NODE_ENV !== "production" && !supabaseConfigured();

function envAdmins(): string[] {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

async function tableAdmins(): Promise<string[]> {
  if (!contentPersisted()) return [];
  try {
    const { data } = await adminClient().from("admins").select("email");
    return (data ?? []).map((r: { email: string }) => r.email.toLowerCase());
  } catch {
    return [];
  }
}

export async function getAdmin(): Promise<Admin | null> {
  if (DEV_FALLBACK) return { email: "dev@localhost", source: "dev" };
  if (!supabaseConfigured()) return null;
  const supabase = await userClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email) return null;
  if (envAdmins().includes(email)) return { email, source: "env" };
  if ((await tableAdmins()).includes(email)) return { email, source: "table" };
  return null;
}

/** For pages: redirect to sign-in when there is no admin. */
export async function requireAdmin(next = "/admin"): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect(`/admin/signin?next=${encodeURIComponent(next)}`);
  return admin;
}

/** True when a signed-in user exists but is not on the list; the sign-in page says so. */
export async function signedInButRefused(): Promise<string | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await userClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? null;
  if (!email) return null;
  return (await getAdmin()) ? null : email;
}

export { DEV_FALLBACK };
