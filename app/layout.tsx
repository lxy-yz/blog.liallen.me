import type { Metadata } from "next";
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
        <header className="site-header">
          <h1 className="site-title">Blog</h1>
          <p>Observations and thoughts from everyday life.</p>
        </header>
        <SiteTabs />
        {children}
        <footer className="site-footer">
          <span>Observe first. Understand later.</span>
        </footer>
      </body>
    </html>
  );
}
