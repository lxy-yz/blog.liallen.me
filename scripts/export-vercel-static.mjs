import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import cms from "../data/notion-cms.json" with { type: "json" };

const root = process.cwd();
const outDir = path.join(root, "vercel-dist");
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("export", String(Date.now()));

const { default: worker } = await import(workerUrl.href);

function slugify(title) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "post"
  );
}

function legacySlugify(title, id) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "post"}-${id.replaceAll("-", "").slice(0, 8)}`;
}

function postRoutes(posts) {
  const seen = new Map();
  const routes = [];

  for (const post of posts) {
    const baseSlug = slugify(post.title);
    const count = seen.get(baseSlug) || 0;
    seen.set(baseSlug, count + 1);

    const slug = count ? `${baseSlug}-${count + 1}` : baseSlug;
    const legacySlug =
      post.slug === slug ? legacySlugify(post.title, post.id) : post.slug;

    routes.push({
      pathname: `/posts/${slug}`,
      file: `posts/${slug}/index.html`,
    });

    if (legacySlug !== slug) {
      routes.push({
        pathname: `/posts/${legacySlug}`,
        file: `posts/${legacySlug}/index.html`,
      });
    }
  }

  return routes;
}

const routes = [
  { pathname: "/", file: "index.html" },
  { pathname: "/posts", file: "posts/index.html" },
  { pathname: "/rss.xml", file: "rss.xml" },
  { pathname: "/sitemap.xml", file: "sitemap.xml" },
  ...postRoutes(cms.posts),
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp(path.join(root, "dist/client"), outDir, { recursive: true });

for (const route of routes) {
  const response = await worker.fetch(
    new Request(`https://blog.liallen.me${encodeURI(route.pathname)}`, {
      headers: { accept: "text/html,application/xml" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to render ${route.pathname}: ${response.status}`);
  }

  const file = path.join(outDir, route.file);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, await response.text());
}

console.log(`Exported ${routes.length} routes to vercel-dist/`);
