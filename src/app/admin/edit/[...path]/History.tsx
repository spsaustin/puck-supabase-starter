"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Section, Heading, Text, Button, Card } from "@/ds";
import type { PageVersion } from "@/puck/storage";

/** The publish history of one page. Rolling back republishes an earlier version as a new one. */
export function History({ pageKey, label, versions }: { pageKey: string; label: string; versions: PageVersion[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function rollback(version: number) {
    if (!window.confirm(`Republish version ${version} of ${label}? The current version stays in the history.`)) return;
    setBusy(version); setError(null);
    const res = await fetch("/api/puck/rollback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageKey, version }) });
    setBusy(null);
    if (!res.ok) { setError((await res.json()).error ?? "Rollback failed."); return; }
    router.refresh();
  }

  return (
    <main style={{ flex: 1 }}>
      <Section spacing="tight" width="narrow">
        <Heading level={1} size="lg">History: {label}</Heading>
        <Text size="sm" muted>Every publish, newest first. Nothing is ever deleted; a rollback is a new publish of an older version.</Text>
        {error ? <Text size="sm" style={{ color: "var(--tone-danger)" }}>{error}</Text> : null}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", width: "100%" }}>
          {versions.length === 0 ? <Text muted>No publishes yet.</Text> : versions.map((v, i) => (
            <Card key={v.version} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: "var(--space-6)", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <strong style={{ color: "var(--text-strong)" }}>Version {v.version}{i === 0 ? " (current)" : ""}</strong>
                <span style={{ fontSize: "var(--size-xs)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{new Date(v.editedAt).toLocaleString()} · {v.editedBy}</span>
              </div>
              {i > 0 ? <Button tone="secondary" onClick={() => rollback(v.version)} disabled={busy !== null}>{busy === v.version ? "Publishing…" : "Roll back to this"}</Button> : null}
            </Card>
          ))}
        </div>
        <div style={{ display: "flex", gap: "var(--space-4)" }}>
          <Button href={`/admin/edit/${pageKey}`}>Open in the editor</Button>
          <Button href="/admin" tone="ghost">All pages</Button>
        </div>
      </Section>
    </main>
  );
}
