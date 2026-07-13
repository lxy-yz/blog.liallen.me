import assert from "node:assert/strict";
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
  assert.match(html, /Observe first\./);
  assert.match(html, /Understand later\./);
  assert.match(html, /Who stole my pace\?/);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working/);
});

test("server-renders posts archive with migrated content", async () => {
  const response = await render("/posts");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /93(?:<!-- -->)? migrated posts/);
  assert.match(html, /A life debugger/);
  assert.match(html, /你不控制媒介，媒介将控制你/);
});

test("server-renders a post with comment setup fallback", async () => {
  const response = await render("/posts/a-life-debugger-135d55c1");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /A life debugger/);
  assert.match(html, /Comments/);
  assert.match(html, /GISCUS_REPO/);
});
