import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outFile = path.join(root, "data/notion-cms.json");
const legacyFile = path.join(root, "data/notion-collection.json");

await loadLocalEnv(path.join(root, ".env.local"));

const config = {
  token: process.env.NOTION_TOKEN || process.env.NOTION_API_KEY || "",
  dataSourceId:
    process.env.NOTION_DATA_SOURCE_ID ||
    process.env.NOTION_DATABASE_ID ||
    "eb6eb762-fc74-4201-bf9b-5727a50256d2",
  notionVersion: process.env.NOTION_VERSION || "2026-03-11",
  optional: process.argv.includes("--optional"),
};

async function loadLocalEnv(file) {
  let contents = "";
  try {
    contents = await readFile(file, "utf8");
  } catch {
    return;
  }

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

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

async function notionRequest(endpoint, init = {}) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "Notion-Version": config.notionVersion,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion API ${response.status} for ${endpoint}: ${body}`);
  }

  return response.json();
}

function richPlain(rich = []) {
  return rich.map((item) => item.plain_text || item.text?.content || "").join("");
}

function propertyText(properties, name) {
  const prop = properties?.[name];
  if (!prop) return "";
  if (prop.type === "title") return richPlain(prop.title);
  if (prop.type === "rich_text") return richPlain(prop.rich_text);
  return "";
}

function propertyDate(properties, name) {
  const prop = properties?.[name];
  return prop?.type === "date" ? prop.date?.start || "" : "";
}

function propertyTags(properties, name) {
  const prop = properties?.[name];
  return prop?.type === "multi_select"
    ? prop.multi_select.map((tag) => tag.name).filter(Boolean)
    : [];
}

async function queryNotionPosts() {
  const results = [];
  let cursor;

  do {
    const body = {
      page_size: 100,
      sorts: [{ property: "Published", direction: "descending" }],
      ...(cursor ? { start_cursor: cursor } : {}),
    };
    const page = await notionRequest(`/data_sources/${config.dataSourceId}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    results.push(...page.results);
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);

  return results;
}

async function getMarkdown(pageId) {
  const body = await notionRequest(`/pages/${pageId}/markdown`);
  return body.markdown || "";
}

function inlineMarkdown(value) {
  let html = escapeHtml(value);
  html = html.replace(/&lt;mention-page url=&quot;([^"]+)&quot;\/&gt;/g, (_match, url) => {
    return `<a href="${url}">linked page</a>`;
  });
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');
  return html;
}

function markdownToHtml(markdown = "") {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let inCode = false;
  let code = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${paragraph.map((line) => inlineMarkdown(line)).join("<br>")}</p>`);
    paragraph = [];
  }

  function flushCode() {
    if (!code.length) return;
    html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
    code = [];
  }

  for (const line of lines) {
    if (/^\s*<empty-block\/>\s*$/.test(line)) {
      flushParagraph();
      continue;
    }

    if (line.startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/);
    if (image) {
      flushParagraph();
      html.push(`<figure><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" loading="lazy"></figure>`);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = Math.min(heading[1].length + 1, 3);
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      flushParagraph();
      html.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      html.push(`<ul><li>${inlineMarkdown(listItem[1])}</li></ul>`);
      continue;
    }

    const orderedItem = line.match(/^\d+\.\s+(.+)$/);
    if (orderedItem) {
      flushParagraph();
      html.push(`<ol><li>${inlineMarkdown(orderedItem[1])}</li></ol>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushCode();
  return html.join("");
}

async function syncFromNotion() {
  const pages = await queryNotionPosts();
  const posts = [];

  for (const page of pages) {
    const title = propertyText(page.properties, "Name").trim();
    if (!title) continue;

    const markdown = await getMarkdown(page.id);
    posts.push({
      id: page.id,
      title,
      slug: slugify(title, page.id),
      date: propertyDate(page.properties, "Published"),
      tags: propertyTags(page.properties, "Tags"),
      description: propertyText(page.properties, "Description").trim(),
      html: markdownToHtml(markdown),
      markdown,
      updated: Date.parse(page.last_edited_time || page.created_time || "") || Date.now(),
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    source: {
      type: "notion-api",
      dataSourceId: config.dataSourceId,
      notionVersion: config.notionVersion,
    },
    posts,
  };
}

function unwrap(record) {
  return record?.value?.value?.value || record?.value?.value || null;
}

function legacyText(rich = []) {
  return rich.map((segment) => segment?.[0] || "").join("");
}

function legacyDate(prop = []) {
  return prop?.[0]?.[1]?.find?.((mark) => mark[0] === "d")?.[1]?.start_date || "";
}

function legacyTags(prop = []) {
  return legacyText(prop)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function legacyRichText(rich = []) {
  return rich
    .map((segment) => {
      const raw = segment?.[0] || "";
      const marks = segment?.[1] || [];
      let html = escapeHtml(raw);
      for (const mark of marks) {
        if (mark[0] === "b") html = `<strong>${html}</strong>`;
        if (mark[0] === "i") html = `<em>${html}</em>`;
        if (mark[0] === "s") html = `<s>${html}</s>`;
        if (mark[0] === "c") html = `<code>${html}</code>`;
      }
      return html;
    })
    .join("");
}

function legacyRenderBlock(blocks, block) {
  if (!block || block.alive === false) return "";
  const title = legacyRichText(block.properties?.title);
  const plainTitle = legacyText(block.properties?.title).trim();
  const children = (block.content || []).map((id) => legacyRenderBlock(blocks, blocks.get(id))).join("");

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
    case "code":
      return `<pre><code>${escapeHtml(plainTitle)}</code></pre>`;
    case "divider":
      return "<hr>";
    case "callout":
      return `<aside class="callout">${title}${children}</aside>`;
    case "image": {
      const src = String(block.format?.display_source || legacyText(block.properties?.source) || "");
      const alt = legacyText(block.properties?.caption) || legacyText(block.properties?.title) || "";
      return src ? `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy"></figure>` : "";
    }
    default:
      return title ? `<p>${title}</p>${children}` : children;
  }
}

async function syncFromLegacyCache() {
  const source = JSON.parse(await readFile(legacyFile, "utf8"));
  const blocks = new Map(
    Object.entries(source.recordMap.block || {})
      .map(([id, record]) => [id, unwrap(record)])
      .filter(([, block]) => block),
  );
  const resultIds = source.result.reducerResults.collection_group_results.blockIds;
  const posts = resultIds
    .map((id) => blocks.get(id))
    .filter((block) => block?.type === "page")
    .map((block) => {
      const title = legacyText(block.properties?.title).trim() || "Untitled";
      return {
        id: block.id,
        title,
        slug: slugify(title, block.id),
        date: legacyDate(block.properties?.["0375f232-634c-4444-bd57-f9270cd74806"]),
        tags: legacyTags(block.properties?.["XDaG"]),
        description: legacyText(block.properties?.["YXu:"]).trim(),
        html: (block.content || []).map((id) => legacyRenderBlock(blocks, blocks.get(id))).join("") || "<p></p>",
        updated: block.last_edited_time || block.created_time || Date.now(),
      };
    })
    .filter((post) => post.title);

  return {
    generatedAt: new Date().toISOString(),
    source: {
      type: "legacy-notion-cache",
      note: "Generated from the checked-in Notion export cache because NOTION_TOKEN was not set.",
    },
    posts,
  };
}

let cms;
let shouldWrite = true;
if (config.token) {
  cms = await syncFromNotion();
} else if (config.optional) {
  try {
    cms = JSON.parse(await readFile(outFile, "utf8"));
    shouldWrite = false;
  } catch {
    cms = await syncFromLegacyCache();
  }
} else {
  throw new Error("Set NOTION_TOKEN or run with --optional to regenerate from the checked-in cache.");
}

if (shouldWrite) {
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(cms, null, 2)}\n`);
  console.log(`Synced ${cms.posts.length} posts from ${cms.source.type} into ${path.relative(root, outFile)}`);
} else {
  console.log(`Using ${cms.posts.length} cached Notion CMS posts from ${path.relative(root, outFile)}`);
}
