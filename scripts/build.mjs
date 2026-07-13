import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "dist");
const source = JSON.parse(await readFile(path.join(root, "data/notion-collection.json"), "utf8"));

const site = {
  title: "Allen Li",
  description: "Learn & Share",
  url: process.env.SITE_URL || "https://liallen.me",
  author: "Allen Li",
  giscusRepo: process.env.GISCUS_REPO || "",
  giscusRepoId: process.env.GISCUS_REPO_ID || "",
  giscusCategory: process.env.GISCUS_CATEGORY || "Comments",
  giscusCategoryId: process.env.GISCUS_CATEGORY_ID || "",
};

function unwrap(record) {
  return record?.value?.value?.value || record?.value?.value || null;
}

const blocks = new Map(
  Object.entries(source.recordMap.block || {})
    .map(([id, record]) => [id, unwrap(record)])
    .filter(([, block]) => block)
);

const resultIds = source.result.reducerResults.collection_group_results.blockIds;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(title, id) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "post"}-${id.replaceAll("-", "").slice(0, 8)}`;
}

function textFromRichText(rich = []) {
  return rich.map((segment) => segment?.[0] || "").join("");
}

function richText(rich = []) {
  return rich.map((segment) => {
    const raw = segment?.[0] || "";
    const marks = segment?.[1] || [];
    const pageMark = marks.find((mark) => mark[0] === "p");
    const linkMark = marks.find((mark) => mark[0] === "a" || mark[0] === "lm");
    let text = raw === "‣" && pageMark ? pageTitle(pageMark[1]) : raw;
    let html = escapeHtml(text);

    for (const mark of marks) {
      if (mark[0] === "b") html = `<strong>${html}</strong>`;
      if (mark[0] === "i") html = `<em>${html}</em>`;
      if (mark[0] === "s") html = `<s>${html}</s>`;
      if (mark[0] === "c") html = `<code>${html}</code>`;
    }

    if (pageMark) {
      const post = postsById.get(pageMark[1]);
      const href = post ? `/posts/${post.slug}/` : originalNotionUrl(pageMark[1]);
      return `<a href="${escapeHtml(href)}">${html}</a>`;
    }

    if (linkMark) {
      const href = markHref(linkMark);
      if (href) return `<a href="${escapeHtml(href)}">${html}</a>`;
    }

    return html;
  }).join("");
}

function markHref(mark) {
  if (mark[0] === "a") return mark[1];
  if (mark[0] === "lm") return mark[1]?.href;
  return "";
}

function pageTitle(id) {
  const block = blocks.get(id);
  return textFromRichText(block?.properties?.title) || "Untitled";
}

function originalNotionUrl(id) {
  return `https://blog.liallen.me/${id.replaceAll("-", "")}`;
}

function dateFromProperty(prop = []) {
  const date = prop?.[0]?.[1]?.find?.((mark) => mark[0] === "d")?.[1]?.start_date;
  return date || "";
}

function collectTags(prop = []) {
  return textFromRichText(prop)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

let posts = resultIds
  .map((id) => blocks.get(id))
  .filter((block) => block?.type === "page")
  .map((block) => {
    const title = textFromRichText(block.properties?.title).trim() || "Untitled";
    return {
      id: block.id,
      title,
      slug: slugify(title, block.id),
      date: dateFromProperty(block.properties?.["0375f232-634c-4444-bd57-f9270cd74806"]),
      tags: collectTags(block.properties?.["XDaG"]),
      description: textFromRichText(block.properties?.["YXu:"]).trim(),
      contentIds: block.content || [],
      updated: block.last_edited_time || block.created_time || Date.now(),
    };
  })
  .filter((post) => post.title && post.contentIds.length > 0);

posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
const postsById = new Map(posts.map((post) => [post.id, post]));

function renderChildren(block) {
  return (block.content || []).map((id) => renderBlock(blocks.get(id))).join("");
}

function renderBlock(block) {
  if (!block || block.alive === false) return "";
  const title = richText(block.properties?.title);
  const plainTitle = textFromRichText(block.properties?.title).trim();
  const children = renderChildren(block);

  switch (block.type) {
    case "text":
      return title ? `<p>${title}</p>${children}` : children;
    case "sub_header":
      return `<h2>${title}</h2>${children}`;
    case "sub_sub_header":
      return `<h3>${title}</h3>${children}`;
    case "quote":
      return `<blockquote>${title}${children}</blockquote>`;
    case "bulleted_list":
      return `<ul><li>${title}${children}</li></ul>`;
    case "numbered_list":
      return `<ol><li>${title}${children}</li></ol>`;
    case "code": {
      const language = block.properties?.language?.[0]?.[0] || "";
      return `<pre><code data-language="${escapeHtml(language)}">${escapeHtml(plainTitle)}</code></pre>`;
    }
    case "divider":
      return "<hr>";
    case "callout":
      return `<aside class="callout">${title}${children}</aside>`;
    case "toggle":
      return `<details><summary>${title}</summary>${children}</details>`;
    case "image": {
      const src = block.format?.display_source || textFromRichText(block.properties?.source);
      const alt = textFromRichText(block.properties?.caption) || textFromRichText(block.properties?.title) || "";
      return src ? `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy">${alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : ""}</figure>` : "";
    }
    case "bookmark": {
      const href = textFromRichText(block.properties?.link) || block.format?.bookmark_icon;
      return href ? `<p><a class="bookmark" href="${escapeHtml(href)}">${title || escapeHtml(href)}</a></p>` : "";
    }
    case "video":
    case "embed":
    case "tweet": {
      const src = block.format?.display_source || textFromRichText(block.properties?.source);
      return src ? `<p><a href="${escapeHtml(src)}">${title || escapeHtml(src)}</a></p>` : "";
    }
    case "page": {
      const post = postsById.get(block.id);
      return post ? `<p><a href="/posts/${post.slug}/">${escapeHtml(post.title)}</a></p>` : "";
    }
    default:
      return title ? `<p>${title}</p>${children}` : children;
  }
}

function pageShell({ title, description = site.description, body, canonical = site.url }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="alternate" type="application/rss+xml" title="${escapeHtml(site.title)}" href="/rss.xml">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">${escapeHtml(site.title)}</a>
    <nav aria-label="Primary">
      <a href="/posts/">writing</a>
      <a href="https://run.liallen.me/">running</a>
      <a href="https://ama.liallen.me/">ask</a>
      <a href="https://cal.com/">chat</a>
    </nav>
  </header>
  ${body}
  <footer class="site-footer">
    <span>${escapeHtml(site.description)}</span>
    <a href="/rss.xml">rss</a>
  </footer>
</body>
</html>`;
}

function postCard(post, headingLevel = 2) {
  const level = Number.isInteger(headingLevel) && headingLevel >= 2 && headingLevel <= 6 ? headingLevel : 2;
  const Heading = `h${level}`;
  return `<article class="post-card">
    <a href="/posts/${post.slug}/">
      <span class="date">${escapeHtml(post.date)}</span>
      <${Heading}>${escapeHtml(post.title)}</${Heading}>
      ${post.description ? `<p>${escapeHtml(post.description)}</p>` : ""}
      ${post.tags.length ? `<div class="tags">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
    </a>
  </article>`;
}

function comments(post) {
  if (!site.giscusRepo || !site.giscusRepoId || !site.giscusCategoryId) {
    return `<section class="comments muted">
      <h2>Comments</h2>
      <p>Set <code>GISCUS_REPO</code>, <code>GISCUS_REPO_ID</code>, and <code>GISCUS_CATEGORY_ID</code> in your hosting environment to enable free GitHub Discussions comments for this post.</p>
    </section>`;
  }

  return `<section class="comments">
    <h2>Comments</h2>
    <script src="https://giscus.app/client.js"
      data-repo="${escapeHtml(site.giscusRepo)}"
      data-repo-id="${escapeHtml(site.giscusRepoId)}"
      data-category="${escapeHtml(site.giscusCategory)}"
      data-category-id="${escapeHtml(site.giscusCategoryId)}"
      data-mapping="pathname"
      data-strict="0"
      data-reactions-enabled="1"
      data-emit-metadata="0"
      data-input-position="bottom"
      data-theme="preferred_color_scheme"
      data-lang="en"
      crossorigin="anonymous"
      async></script>
  </section>`;
}

await rm(outDir, { recursive: true, force: true });
await mkdir(path.join(outDir, "posts"), { recursive: true });

await writeFile(path.join(outDir, "styles.css"), await readFile(path.join(root, "styles.css"), "utf8"));

const currentEssays = ["Know nothing", "Unlearn anything", "Make something"];
const introPosts = [
  ...currentEssays
    .map((title) => posts.find((post) => post.title.toLowerCase() === title.toLowerCase()))
    .filter(Boolean),
  ...posts,
].filter((post, index, list) => list.findIndex((candidate) => candidate.id === post.id) === index).slice(0, 5);
await writeFile(path.join(outDir, "index.html"), pageShell({
  title: site.title,
  canonical: `${site.url}/`,
  body: `<main class="home">
    <section class="hero">
      <p class="eyebrow">Hi, I&apos;m Allen.</p>
      <h1>Learn &amp; Share</h1>
      <p>I write about learning, making, and changing my mind. This page is a small front door to the things I keep online.</p>
    </section>
    <section class="link-list" aria-label="Elsewhere">
      <a href="/posts/"><span>writing</span><small>notes and essays</small></a>
      <a href="https://run.liallen.me/"><span>running</span><small>miles, logs, routes</small></a>
      <a href="https://ama.liallen.me/"><span>ask</span><small>questions welcome</small></a>
      <a href="https://cal.com/"><span>chat</span><small>book a time</small></a>
    </section>
    <section class="featured">
      <div class="section-heading">
        <h2>Start here</h2>
        <a href="/posts/">all writing</a>
      </div>
      <div class="post-list">${introPosts.map((post) => postCard(post, 3)).join("")}</div>
    </section>
  </main>`,
}));

await mkdir(path.join(outDir, "posts"), { recursive: true });
await writeFile(path.join(outDir, "posts", "index.html"), pageShell({
  title: `Posts | ${site.title}`,
  canonical: `${site.url}/posts/`,
  body: `<main class="archive">
    <h1>Writing</h1>
    <p>${posts.length} notes and essays, migrated from the original blog.</p>
    <section class="post-list">${posts.map((post) => postCard(post)).join("")}</section>
  </main>`,
}));

for (const post of posts) {
  const html = post.contentIds.map((id) => renderBlock(blocks.get(id))).join("");
  const dir = path.join(outDir, "posts", post.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), pageShell({
    title: `${post.title} | ${site.title}`,
    description: post.description || site.description,
    canonical: `${site.url}/posts/${post.slug}/`,
    body: `<main class="post">
      <article>
        <a class="back" href="/posts/">Posts</a>
        <header class="post-header">
          <p class="date">${escapeHtml(post.date)}</p>
          <h1>${escapeHtml(post.title)}</h1>
          ${post.description ? `<p>${escapeHtml(post.description)}</p>` : ""}
          ${post.tags.length ? `<div class="tags">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
        </header>
        <div class="content">${html}</div>
      </article>
      ${comments(post)}
    </main>`,
  }));
}

const rssItems = posts.slice(0, 30).map((post) => `<item>
  <title>${escapeHtml(post.title)}</title>
  <link>${site.url}/posts/${post.slug}/</link>
  <guid>${site.url}/posts/${post.slug}/</guid>
  <pubDate>${new Date(post.date || post.updated).toUTCString()}</pubDate>
  <description>${escapeHtml(post.description || "")}</description>
</item>`).join("\n");

await writeFile(path.join(outDir, "rss.xml"), `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"><channel>
<title>${escapeHtml(site.title)}</title>
<link>${site.url}/</link>
<description>${escapeHtml(site.description)}</description>
${rssItems}
</channel></rss>`);

await writeFile(path.join(outDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${site.url}/</loc></url>
  <url><loc>${site.url}/posts/</loc></url>
${posts.map((post) => `  <url><loc>${site.url}/posts/${post.slug}/</loc></url>`).join("\n")}
</urlset>`);

await writeFile(path.join(outDir, "robots.txt"), `User-agent: *
Allow: /
Sitemap: ${site.url}/sitemap.xml
`);

console.log(`Generated ${posts.length} posts in dist/`);
