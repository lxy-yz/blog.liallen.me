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
  assert.match(html, /<title>Blog \| Blog<\/title>/i);
  assert.match(html, /Observations and thoughts from everyday life\./);
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

test("server-renders posts archive with Notion CMS content", async () => {
  const response = await render("/posts");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.doesNotMatch(html, /posts synced from Notion CMS/);
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

test("does not render Notion empty block placeholders", async () => {
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

test("keeps legacy Chinese post URLs working", async () => {
  const response = await render(encodeURI("/posts/即兴山河-361f2bca"));
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /即兴山河/);
});

test("preserves Notion soft line breaks inside paragraphs", async () => {
  const response = await render("/posts/who-stole-my-pace");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /You’re in a long-distance race\.<br>There is no map\./);
  assert.match(html, /For a while, your breathing settles\.<br>Your shoulders drop\.<br>Your feet find the ground\./);
});

test("renders literal Notion br markers as line breaks", async () => {
  const response = await render("/posts/ji-xing-shan-he");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /从身旁擦过，<br>卷起一阵寒风，<br>留下几声喇叭。<br>今天，<br>你点外卖了吗？/);
  assert.doesNotMatch(html, /从身旁擦过，&lt;br&gt;卷起一阵寒风/);
});

test("links Notion page mentions to local posts when synced", async () => {
  const response = await render("/posts/ji-xing-shan-he");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /href="\/posts\/shan-lu-ye-qi">山路夜骑<\/a>/);
  assert.match(html, /href="\/posts\/yu-ye-xiang-zhou">雨夜巷粥<\/a>/);
  assert.match(html, /href="\/posts\/hui-long-jue">回笼觉<\/a>/);
  assert.doesNotMatch(html, /app\.notion\.com\/p\/38bf2bca1f85803b98f2d9558bbf4b82/);
});

test("renders unsupported Notion layout blocks with safe fallbacks", async () => {
  const response = await render("/posts/si-ji");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /class="notion-callout"/);
  assert.match(html, /class="notion-columns"/);
  assert.match(html, /class="notion-fallback"/);
  assert.doesNotMatch(html, /&lt;\/?callout/);
  assert.doesNotMatch(html, /&lt;\/?columns/);
  assert.doesNotMatch(html, /&lt;\/?column/);
});

test("renders Notion video blocks as inline YouTube embeds", async () => {
  const response = await render("/posts/busy-living-or-busy-dying");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /class="notion-video"/);
  assert.match(html, /src="https:\/\/www\.youtube\.com\/embed\/kkPdmPbxCUQ"/);
  assert.doesNotMatch(html, /&lt;video/);
});

test("renders Notion tweet embeds as inline fallback cards", async () => {
  const response = await render("/posts/zi-dong-fan-mai-ji");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /class="notion-fallback notion-tweet"/);
  assert.match(html, />tweet<\/a>/);
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
