import { renderChrome } from "@/puck/render";

/** Public pages: editable header above, editable footer below. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { header, footer } = await renderChrome();
  return (
    <>
      {header}
      <main id="main" style={{ flex: 1 }}>{children}</main>
      {footer}
    </>
  );
}
