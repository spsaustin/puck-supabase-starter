import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Data } from "@puckeditor/core";
import { adminClient, contentPersisted } from "@/lib/supabase/server";

/**
 * THE PAGE STORE.
 *
 * Published page data lives in Supabase (supabase/migrations/0001): the
 * current row per page, plus a version row per publish, so every change is
 * auditable and any earlier version can be republished. Nothing is deleted.
 *
 * Reads fail soft. Public pages render at build time and on demand; a
 * database that is unreachable in that moment means "serve the seed", never a
 * failed build or a 500 on the home page. Writes stay loud.
 *
 * Without a service key (a fresh clone, a preview with no integration) the
 * store is a folder of JSON files: the editor works locally, and on an
 * ephemeral host the publishes vanish on the next deploy. The admin index
 * says so.
 */

export type PageMeta = { version: number; lastEditedBy: string; lastEditedAt: string };
export type PageVersion = { version: number; editedBy: string; editedAt: string };

export interface PageStore {
  get(pageKey: string): Promise<(Data & { _meta?: PageMeta }) | null>;
  put(pageKey: string, data: Data, actor: string): Promise<void>;
  list(): Promise<string[]>;
  versions(pageKey: string): Promise<PageVersion[]>;
  rollback(pageKey: string, version: number, actor: string): Promise<boolean>;
}

class SupabasePageStore implements PageStore {
  async get(pageKey: string) {
    try {
      const { data, error } = await adminClient().from("pages").select("data, version, last_edited_by, last_edited_at").eq("page_key", pageKey).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { ...(data.data as Data), _meta: { version: data.version, lastEditedBy: data.last_edited_by, lastEditedAt: data.last_edited_at } };
    } catch (error) {
      console.warn("[content] database unreachable; serving seed content", { pageKey, error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  async put(pageKey: string, data: Data, actor: string) {
    const clean = stripMeta(data);
    // One statement, so the version row and the current row cannot disagree.
    const { error } = await adminClient().rpc("publish_page", { p_page_key: pageKey, p_data: clean, p_actor: actor });
    if (error) throw new Error(`publish failed: ${error.message}`);
  }

  async list() {
    try {
      const { data, error } = await adminClient().from("pages").select("page_key").order("page_key");
      if (error) throw error;
      return (data ?? []).map((r: { page_key: string }) => r.page_key);
    } catch {
      return [];
    }
  }

  async versions(pageKey: string) {
    const { data, error } = await adminClient().from("page_versions").select("version, edited_by, edited_at").eq("page_key", pageKey).order("version", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: { version: number; edited_by: string; edited_at: string }) => ({ version: r.version, editedBy: r.edited_by, editedAt: r.edited_at }));
  }

  async rollback(pageKey: string, version: number, actor: string) {
    const { data, error } = await adminClient().from("page_versions").select("data").eq("page_key", pageKey).eq("version", version).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return false;
    await this.put(pageKey, data.data as Data, actor);
    return true;
  }
}

/**
 * Without a service key, pages are JSON files under .content/ (gitignored).
 * Fine on a developer machine; on an ephemeral host that disk is discarded on
 * the next deploy. The admin index says so. A file rather than memory because
 * the dev server gives route handlers and pages separate module instances.
 */
class FilePageStore implements PageStore {
  private root = path.join(process.cwd(), ".content", "pages");
  private file(pageKey: string) {
    if (!/^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/.test(pageKey)) throw new Error(`Unsafe page key: ${pageKey}`);
    return path.join(this.root, `${pageKey.replace(/\//g, "__")}.json`);
  }
  private async read(pageKey: string): Promise<{ data: Data; versions: { version: number; data: Data; editedBy: string; editedAt: string }[] } | null> {
    try { return JSON.parse(await fs.readFile(this.file(pageKey), "utf8")); } catch { return null; }
  }
  async get(pageKey: string) {
    const p = await this.read(pageKey);
    if (!p) return null;
    const last = p.versions[p.versions.length - 1];
    return { ...p.data, _meta: { version: last.version, lastEditedBy: last.editedBy, lastEditedAt: last.editedAt } };
  }
  async put(pageKey: string, data: Data, actor: string) {
    const clean = stripMeta(data);
    const p = (await this.read(pageKey)) ?? { data: clean, versions: [] };
    p.data = clean;
    p.versions.push({ version: p.versions.length + 1, data: clean, editedBy: actor, editedAt: new Date().toISOString() });
    await fs.mkdir(this.root, { recursive: true });
    await fs.writeFile(this.file(pageKey), JSON.stringify(p, null, 2), "utf8");
  }
  async list() {
    try { return (await fs.readdir(this.root)).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "").replace(/__/g, "/")).sort(); } catch { return []; }
  }
  async versions(pageKey: string) {
    return ((await this.read(pageKey))?.versions ?? []).map((v) => ({ version: v.version, editedBy: v.editedBy, editedAt: v.editedAt })).reverse();
  }
  async rollback(pageKey: string, version: number, actor: string) {
    const v = (await this.read(pageKey))?.versions.find((x) => x.version === version);
    if (!v) return false;
    await this.put(pageKey, v.data, actor);
    return true;
  }
}

/** The client echoes _meta back on publish; the columns are the truth. */
function stripMeta(data: Data): Data {
  const copy = { ...data } as Data & { _meta?: unknown };
  delete copy._meta;
  return copy;
}

export const STORE: PageStore = contentPersisted() ? new SupabasePageStore() : new FilePageStore();
export const CONTENT_PERSISTED = contentPersisted();
