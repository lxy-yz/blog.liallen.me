import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="site-header">
          <h1 className="site-title">Blog</h1>
          <p>Observations and thoughts from everyday life.</p>
        </header>
        <div className="site-tabs">
          <nav aria-label="Primary navigation">
            <a href="/">Start Here</a>
            <a href="/posts">Archives</a>
            <a href="/rss.xml">RSS</a>
          </nav>
        </div>
        {children}
        <footer className="site-footer">
          <span>Observe first. Understand later.</span>
        </footer>
      </body>
    </html>
  );
}
