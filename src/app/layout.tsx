import type { Metadata } from "next";
import "@/ds/tokens.css";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>{children}</body>
    </html>
  );
}
