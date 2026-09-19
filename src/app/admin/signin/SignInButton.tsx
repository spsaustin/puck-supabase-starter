"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/client";
import { Button } from "@/ds";

export function SignInButton({ next }: { next: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    const supabase = browserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setBusy(false); router.push(`/admin/signin?error=${encodeURIComponent(error.message)}`); }
  }
  return <Button onClick={go} disabled={busy} style={{ width: "100%" }}>{busy ? "Opening Google…" : "Continue with Google"}</Button>;
}
