import "server-only";
import { redirect } from "next/navigation";
import { userClient, adminClient, supabaseConfigured, contentPersisted } from "./supabase/server";

/**
 * THE GATE.
 *
 * One way in: a Supabase Auth session that Google created. Then one
 * question: is this email on the admin list. The list is checked on every
 * request, so removing an address revokes access immediately, not when the
 * session happens to lapse.
 *
 * The list has two sources, merged:
 *   - ADMIN_EMAILS, comma-separated, in the environment. Zero setup.
 *   - the `admins` table (supabase/migrations/0001), editable without a
 *     redeploy once the service key is configured.
 *
 * There is no other path. No password, no magic link, no access code, no
 * development bypass: with Supabase unconfigured the editor admits nobody,
 * and a session for a listed address that Google did not create is refused.
 */

export type Admin = { email: string; source: "env" | "table" };

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

/** True only for a session Google created. A password or magic-link session for the same address is not enough. */
function isGoogleSession(user: { app_metadata?: { provider?: string; providers?: string[] }; identities?: { provider: string }[] | null } | null): boolean {
  if (!user) return false;
  const providers = user.app_metadata?.providers ?? (user.app_metadata?.provider ? [user.app_metadata.provider] : []);
  return providers.includes("google") || (user.identities ?? []).some((i) => i.provider === "google");
}

export async function getAdmin(): Promise<Admin | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await userClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email || !isGoogleSession(data.user)) return null;
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

/** Why a signed-in user is not an admin, for the sign-in page. Null when nobody is signed in or they are admitted. */
export async function signedInButRefused(): Promise<{ email: string; reason: "not-google" | "not-listed" } | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await userClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? null;
  if (!email) return null;
  if (!isGoogleSession(data.user)) return { email, reason: "not-google" };
  return (await getAdmin()) ? null : { email, reason: "not-listed" };
}
