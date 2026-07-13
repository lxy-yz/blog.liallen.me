import { posts } from "../lib/blog";

const siteUrl = process.env.SITE_URL || "https://blog.liallen.me";

function escapeXml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function GET() {
  const items = posts
    .slice(0, 30)
    .map((post) => {
      const url = `${siteUrl}/posts/${post.slug}`;
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${url}</link>
  <guid>${url}</guid>
  <pubDate>${new Date(post.date || post.updated).toUTCString()}</pubDate>
  <description>${escapeXml(post.description)}</description>
</item>`;
    })
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"><channel>
<title>Blog</title>
<link>${siteUrl}/</link>
<description>Observe first. Understand later.</description>
${items}
</channel></rss>`, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
    },
  });
}
