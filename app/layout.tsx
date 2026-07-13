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
          <nav>
            <a href="/">Home</a>
            <a href="/posts">Posts</a>
            <a href="/rss.xml">RSS</a>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <span>Observe first. Understand later.</span>
        </footer>
      </body>
    </html>
  );
}
