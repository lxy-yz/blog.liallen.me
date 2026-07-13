import type { Metadata } from "next";
import { SiteHeader } from "./site-header";
import { SiteTabs } from "./site-tabs";
import "./globals.css";

const gaMeasurementId = "G-8EV4KNV3LN";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://blog.liallen.me"),
  title: {
    default: "Blog",
    template: "%s | Blog",
  },
  description: "Observe first. Understand later.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag("js", new Date());
              gtag("config", "${gaMeasurementId}");
            `,
          }}
        />
        <SiteHeader />
        <SiteTabs />
        {children}
        <footer className="site-footer">
          <span>Observe first. Understand later.</span>
          <span>Copyright © 2026.</span>
        </footer>
      </body>
    </html>
  );
}
