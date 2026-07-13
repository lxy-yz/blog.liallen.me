"use client";

import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Start Here" },
  { href: "/posts", label: "Archives" },
];

function isActiveTab(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteTabs() {
  const pathname = usePathname() || "";

  if (pathname.startsWith("/posts/")) {
    return null;
  }

  return (
    <div className="site-tabs">
      <nav aria-label="Primary navigation">
        {tabs.map((tab) => {
          const isActive = isActiveTab(pathname, tab.href);

          return (
            <a
              aria-current={isActive ? "page" : undefined}
              href={tab.href}
              key={tab.href}
            >
              {tab.label}
            </a>
          );
        })}
      </nav>
      <a className="rss-link" href="/rss.xml">
        RSS
      </a>
    </div>
  );
}
