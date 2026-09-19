import "server-only";
import type { ReactNode } from "react";
import { Render } from "@puckeditor/core/rsc";
import type { Data } from "@puckeditor/core";
import { config, chromeConfig, type Props, type RootProps, type ChromeProps } from "./config";
import { STORE } from "./storage";
import { findPageByKey, CHROME_KEY, type EditablePage } from "./pages";

/**
 * Server-side rendering of editable pages: the public site never ships the
 * editor. Resolution is stored content, then the seed.
 */
export async function pageData(page: EditablePage): Promise<Data> {
  return (await STORE.get(page.key)) ?? page.seed();
}

export async function renderPage(page: EditablePage): Promise<ReactNode> {
  const data = (await pageData(page)) as Data<Props, RootProps>;
  return <Render config={config} data={data} />;
}

export async function pageRootProps(page: EditablePage): Promise<Partial<RootProps>> {
  const data = await pageData(page);
  return (data.root?.props ?? {}) as Partial<RootProps>;
}

/** Header and footer from the chrome page, each rendered where the layout wants it. */
export async function renderChrome(): Promise<{ header: ReactNode; footer: ReactNode }> {
  const page = findPageByKey(CHROME_KEY)!;
  const data = (await pageData(page)) as unknown as Data<ChromeProps>;
  const pick = (type: keyof ChromeProps): Data<ChromeProps> => ({ ...data, content: data.content.filter((c) => c.type === type) });
  return {
    header: <Render config={chromeConfig} data={pick("SiteHeader")} />,
    footer: <Render config={chromeConfig} data={pick("SiteFooter")} />,
  };
}
