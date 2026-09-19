"use client";

import { useState } from "react";
import { Puck, type Config, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { config, chromeConfig } from "@/puck/config";

const VIEWPORTS = [
  { width: 390, height: "auto" as const, label: "Phone", icon: "Smartphone" as const },
  { width: 834, height: "auto" as const, label: "Tablet", icon: "Tablet" as const },
  { width: 1280, height: "auto" as const, label: "Desktop", icon: "Monitor" as const },
];

/**
 * The visual editor. Puck renders the real block components, so what the
 * editor shows is what the public page will be. Reachable only under /admin.
 */
export function Editor({ pageKey, path, kind, initialData }: { pageKey: string; path: string; kind: "page" | "chrome"; initialData: Data }) {
  const active = (kind === "chrome" ? chromeConfig : config) as Config;
  const [status, setStatus] = useState<{ tone: "idle" | "saving" | "saved" | "error"; message?: string; findings?: { rule: string; value: string; where: string }[] }>({ tone: "idle" });

  async function publish(data: Data) {
    setStatus({ tone: "saving" });
    try {
      const res = await fetch("/api/puck", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageKey, data }) });
      const body = await res.json();
      if (!res.ok) { setStatus({ tone: "error", message: body.detail || body.error || "Could not publish.", findings: body.findings }); return; }
      setStatus({ tone: "saved", message: kind === "chrome" ? "Published to every page." : `Published to ${path}.` });
    } catch {
      setStatus({ tone: "error", message: "Could not reach the server. Nothing was published." });
    }
  }

  return (
    <div style={{ height: "100dvh" }}>
      {status.tone !== "idle" ? (
        <div role="status" aria-live="polite" style={{ position: "fixed", bottom: 20, left: 20, zIndex: 9999, maxWidth: 460, padding: "14px 18px", borderRadius: 12, background: status.tone === "error" ? "#fbe7e5" : status.tone === "saved" ? "#e5f4ea" : "#f1f1ed", color: status.tone === "error" ? "#7a1d17" : status.tone === "saved" ? "#14512a" : "#2b2d31", border: "1px solid rgba(19,20,22,.16)", boxShadow: "0 12px 28px rgba(19,20,22,.14)", font: "500 13px/1.5 system-ui, sans-serif" }}>
          <div>{status.tone === "saving" ? "Publishing…" : status.message}</div>
          {status.findings?.length ? (
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontWeight: 400 }}>
              {status.findings.slice(0, 6).map((f, i) => <li key={i}><code>{f.value}</code> — {f.rule.replace(/-/g, " ")}</li>)}
            </ul>
          ) : null}
        </div>
      ) : null}
      <Puck config={active} data={initialData} onPublish={publish} headerTitle={kind === "chrome" ? "Header and footer" : "Editing"} headerPath={kind === "chrome" ? "every page" : path} viewports={VIEWPORTS} />
    </div>
  );
}
