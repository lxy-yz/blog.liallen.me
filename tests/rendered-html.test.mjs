import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
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
}

test("server-renders migrated blog home", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Home \| Blog<\/title>/i);
  assert.match(html, /Observations and thoughts from everyday life\./);
  assert.match(html, /Copyright © 2026\./);
  assert.doesNotMatch(html, /All rights reserved/);
  assert.doesNotMatch(html, /Observe first\.<\/p><h1>Understand later\./);
  assert.match(html, /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-8EV4KNV3LN/);
  assert.match(html, /gtag\("config", "G-8EV4KNV3LN"\)/);
  assert.match(html, /Who stole my pace\?/);
  assert.match(html, /href="\/posts\/who-stole-my-pace"/);
  assert.doesNotMatch(html, /href="\/posts\/who-stole-my-pace-86567ee3"/);
  assert.match(html, /href="\/posts\/ji-xing-shan-he"/);
  assert.doesNotMatch(html, /href="\/posts\/即兴山河"/);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working/);
});

test("server-renders posts archive with Markdown content", async () => {
  const response = await render("/posts");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.doesNotMatch(html, /posts synced from/);
  assert.match(html, /A life debugger/);
  assert.match(html, /你不控制媒介，媒介将控制你/);
});

test("server-renders a post with giscus comments", async () => {
  const response = await render("/posts/a-life-debugger");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /A life debugger/);
  assert.match(html, /Comments/);
  assert.match(html, /data-giscus-repo="lxy-yz\/blog\.liallen\.me"/);
  assert.doesNotMatch(html, /Set <code>GISCUS_REPO<\/code>/);
});

test("does not render empty block placeholders", async () => {
  const response = await render("/posts/5-kilometers");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.doesNotMatch(html, /empty-block/);
});

test("keeps legacy hashed post URLs working", async () => {
  const response = await render("/posts/5-kilometers-2c675f7b");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /5 kilometers/);
});

test("uses ascii slugs for Chinese post titles", async () => {
  const response = await render("/posts/ji-xing-shan-he");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /即兴山河/);
});

test("serves migrated images from local static assets", async () => {
  const response = await render("/posts/ji-xing-shan-he");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /src="\/assets\/ji-xing-shan-he\//);
  assert.match(html, /src="\/assets\/ji-xing-shan-he\/03-[^"]+\.jpg"/);
  assert.doesNotMatch(html, /prod-files-secure\.s3/);
  assert.doesNotMatch(html, /X-Amz-/);
  assert.doesNotMatch(html, /\.heic/i);
});

test("keeps legacy Chinese post URLs working", async () => {
  const response = await render(encodeURI("/posts/即兴山河-361f2bca"));
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /即兴山河/);
});

test("preserves soft line breaks inside paragraphs", async () => {
  const response = await render("/posts/who-stole-my-pace");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /You’re in a long-distance race\.<br>There is no map\./);
  assert.match(html, /For a while, your breathing settles\.<br>Your shoulders drop\.<br>Your feet find the ground\./);
});

test("renders poem line breaks from Markdown lines", async () => {
  const response = await render("/posts/ji-xing-shan-he");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /从身旁擦过，<br>卷起一阵寒风，<br>留下几声喇叭。<br>今天，<br>你点外卖了吗？/);
  assert.doesNotMatch(html, /从身旁擦过，&lt;br&gt;卷起一阵寒风/);
});

test("links migrated page mentions to local posts", async () => {
  const response = await render("/posts/ji-xing-shan-he");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /href="\/posts\/shan-lu-ye-qi">山路夜骑<\/a>/);
  assert.match(html, /href="\/posts\/yu-ye-xiang-zhou">雨夜巷粥<\/a>/);
  assert.match(html, /href="\/posts\/hui-long-jue">回笼觉<\/a>/);
  assert.doesNotMatch(html, /linked page/);
});

test("renders editor-relative Markdown paths as site URLs", async () => {
  const source = await readFile(
    new URL("../content/posts/ji-xing-shan-he.md", import.meta.url),
    "utf8",
  );
  assert.match(source, /\[山路夜骑\]\(\.\/shan-lu-ye-qi\.md\)/);
  assert.match(source, /!\[\]\(\.\.\/\.\.\/public\/assets\/ji-xing-shan-he\//);
  assert.doesNotMatch(source, /\]\(\/posts\//);
  assert.doesNotMatch(source, /\]\(\/assets\//);

  const response = await render("/posts/ji-xing-shan-he");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /href="\/posts\/shan-lu-ye-qi">山路夜骑<\/a>/);
  assert.match(html, /src="\/assets\/ji-xing-shan-he\/01-[^"]+\.jpeg"/);
});

test("renders unsupported layout blocks with safe fallbacks", async () => {
  const response = await render("/posts/si-ji");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /满襟的泪水 哗啦啦地流<br>ta 抬起了头 看不清模样/);
  assert.match(html, /<strong>夏<\/strong><br>医院外的女子/);
  assert.doesNotMatch(html, /&lt;\/?callout/);
  assert.doesNotMatch(html, /&lt;\/?columns/);
  assert.doesNotMatch(html, /&lt;\/?column/);
  assert.doesNotMatch(html, /content-callout|content-columns|content-fallback/);
});

test("renders Markdown headings, emphasis, ordered lists, and tables", async () => {
  const challengeResponse = await render("/posts/100-thing-challenge");
  assert.equal(challengeResponse.status, 200);

  const challengeHtml = await challengeResponse.text();
  assert.match(challengeHtml, /<h2>Background<\/h2>/);
  assert.match(challengeHtml, /Embrace the <em>Lindy Effect<\/em>/);
  assert.match(challengeHtml, /<table>/);
  assert.match(challengeHtml, /<th>Quantity<\/th><th>Item<\/th>/);
  assert.match(challengeHtml, /<td>1 pack<\/td><td>Nail scissors pack<\/td>/);
  assert.doesNotMatch(challengeHtml, /\| Quantity \| Item/);

  const orderedResponse = await render("/posts/run-ts-from-cli");
  assert.equal(orderedResponse.status, 200);

  const orderedHtml = await orderedResponse.text();
  assert.match(orderedHtml, /<ol><li>It’s within a TS project/);
  assert.match(orderedHtml, /<li>It doesn’t use the modern ESM import specifier/);
});

test("renders video references as Markdown links", async () => {
  const response = await render("/posts/busy-living-or-busy-dying");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /href="https:\/\/www\.youtube\.com\/watch\?v=kkPdmPbxCUQ">Embedded video<\/a>/);
  assert.doesNotMatch(html, /&lt;video/);
});

test("renders migrated tweet placeholders as Markdown quotes", async () => {
  const response = await render("/posts/zi-dong-fan-mai-ji");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<blockquote>Embedded: tweet<\/blockquote>/);
  assert.doesNotMatch(html, /&lt;unknown/);
});

test("exports Vercel static pages with analytics", async () => {
  const html = await readFile(new URL("../vercel-dist/index.html", import.meta.url), "utf8");
  const postHtml = await readFile(
    new URL("../vercel-dist/posts/who-stole-my-pace/index.html", import.meta.url),
    "utf8",
  );
  const chinesePostHtml = await readFile(
    new URL("../vercel-dist/posts/ji-xing-shan-he/index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-8EV4KNV3LN/);
  assert.match(html, /gtag\("config", "G-8EV4KNV3LN"\)/);
  assert.match(postHtml, /Who stole my pace\?/);
  assert.match(chinesePostHtml, /即兴山河/);
});
