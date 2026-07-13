"use client";

import { useEffect, useRef } from "react";

type GiscusCommentsProps = {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
};

export function GiscusComments({
  repo,
  repoId,
  category,
  categoryId,
}: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.repo = repo;
    script.dataset.repoId = repoId;
    script.dataset.category = category;
    script.dataset.categoryId = categoryId;
    script.dataset.mapping = "pathname";
    script.dataset.strict = "0";
    script.dataset.reactionsEnabled = "1";
    script.dataset.emitMetadata = "0";
    script.dataset.inputPosition = "bottom";
    script.dataset.theme = "preferred_color_scheme";
    script.dataset.lang = "en";

    container.appendChild(script);

    return () => {
      container.replaceChildren();
    };
  }, [category, categoryId, repo, repoId]);

  return (
    <section className="comments" data-giscus-repo={repo}>
      <h2>Comments</h2>
      <div ref={containerRef} />
    </section>
  );
}
