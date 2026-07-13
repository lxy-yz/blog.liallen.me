"use client";

import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

function goBack(event: MouseEvent<HTMLAnchorElement>) {
  if (window.history.length <= 1) return;

  event.preventDefault();
  window.history.back();
}

export function SiteHeader() {
  const pathname = usePathname() || "";
  const isPost = pathname.startsWith("/posts/");

  if (isPost) {
    return (
      <header className="site-header post-site-header">
        <a className="back-link" href="/posts" onClick={goBack}>
          Back
        </a>
      </header>
    );
  }

  return (
    <header className="site-header">
      <h1 className="site-title">Blog</h1>
      <p>Observations and thoughts from everyday life.</p>
    </header>
  );
}
