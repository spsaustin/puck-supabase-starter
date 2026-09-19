import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin, signedInButRefused } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/supabase/server";
import { Section, Heading, Text, Callout, Card } from "@/ds";
import { SignInButton } from "./SignInButton";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Sign in with Google through Supabase Auth. Only listed admins get past here. */
export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/admin") ? next : "/admin";
  if (await getAdmin()) redirect(safeNext);
  const refused = await signedInButRefused();
  return (
    <main style={{ flex: 1 }}>
      <Section spacing="loose" width="narrow" align="center">
        <Card style={{ width: "100%", maxWidth: 420, textAlign: "left" }}>
          <Heading level={1} size="md">Sign in to edit</Heading>
          {!supabaseConfigured() ? (
            <Callout tone="warn" title="No identity provider is configured">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (the Vercel Supabase integration does this) and enable Google under Authentication → Providers in Supabase.</Callout>
          ) : refused ? (
            <>
              <Callout tone="danger" title="This account is not an editor">{refused} signed in, but is not on the admin list. Add it to ADMIN_EMAILS or the admins table, or sign out and use another account.</Callout>
              <form action="/auth/signout" method="post"><button type="submit" style={{ background: "none", border: 0, color: "var(--text-link)", cursor: "pointer", padding: 0, font: "inherit" }}>Sign out</button></form>
            </>
          ) : (
            <>
              <Text size="sm" muted>Use the Google account on the admin list. Identity proves who you are; the list decides whether you may edit this site.</Text>
              {error ? <Callout tone="danger">{error}</Callout> : null}
              <SignInButton next={safeNext} />
            </>
          )}
        </Card>
      </Section>
    </main>
  );
}
