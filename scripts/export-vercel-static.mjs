import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import cms from "../data/notion-cms.json" with { type: "json" };

const root = process.cwd();
const outDir = path.join(root, "vercel-dist");
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("export", String(Date.now()));

const { default: worker } = await import(workerUrl.href);

const routes = [
  { pathname: "/", file: "index.html" },
  { pathname: "/posts", file: "posts/index.html" },
  { pathname: "/rss.xml", file: "rss.xml" },
  { pathname: "/sitemap.xml", file: "sitemap.xml" },
  ...cms.posts.map((post) => ({
    pathname: `/posts/${post.slug}`,
    file: `posts/${post.slug}/index.html`,
  })),
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
