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

function slugify(title) {
  const pinyin = {
    不: "bu",
    个: "ge",
    久: "jiu",
    么: "me",
    习: "xi",
    了: "le",
    介: "jie",
    何: "he",
    你: "ni",
    信: "xin",
    入: "ru",
    兴: "xing",
    别: "bie",
    制: "zhi",
    动: "dong",
    医: "yi",
    卖: "mai",
    即: "ji",
    变: "bian",
    后: "hou",
    告: "gao",
    命: "ming",
    四: "si",
    回: "hui",
    境: "jing",
    夜: "ye",
    太: "tai",
    失: "shi",
    奇: "qi",
    好: "hao",
    如: "ru",
    媒: "mei",
    子: "zi",
    季: "ji",
    寻: "xun",
    将: "jiang",
    小: "xiao",
    山: "shan",
    巷: "xiang",
    市: "shi",
    年: "nian",
    廊: "lang",
    忙: "mang",
    怎: "zen",
    息: "xi",
    惯: "guan",
    感: "gan",
    手: "shou",
    抱: "bao",
    拥: "yong",
    控: "kong",
    摆: "bai",
    改: "gai",
    无: "wu",
    机: "ji",
    束: "shu",
    来: "lai",
    样: "yang",
    根: "gen",
    河: "he",
    消: "xiao",
    游: "you",
    焦: "jiao",
    玩: "wan",
    生: "sheng",
    由: "you",
    的: "de",
    笑: "xiao",
    笼: "long",
    粥: "zhou",
    缚: "fu",
    胖: "pang",
    脱: "tuo",
    自: "zi",
    蒙: "meng",
    虑: "lv",
    见: "jian",
    觉: "jue",
    记: "ji",
    贩: "fan",
    路: "lu",
    轮: "lun",
    轻: "qing",
    运: "yun",
    那: "na",
    都: "du",
    随: "sui",
    雨: "yu",
    题: "ti",
    骑: "qi",
    鼓: "gu",
  };
  const asciiTitle = Array.from(title, (char) =>
    pinyin[char] ? ` ${pinyin[char]} ` : char,
  ).join("");
  const base = asciiTitle
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return base || "post";
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

function normalizeNotionId(value = "") {
  const id = String(value)
    .split("?")[0]
    .replace(/\/$/, "")
    .split("/")
    .pop()
    ?.replaceAll("-", "");

  if (!id || !/^[0-9a-f]{32}$/i.test(id)) return "";
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`.toLowerCase();
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

function inlineMarkdown(value, postById = new Map()) {
  let html = escapeHtml(value);
  html = html.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  html = html.replace(/&lt;mention-page url=&quot;([^"]+)&quot;\/&gt;/g, (_match, url) => {
    const post = postById.get(normalizeNotionId(url));
    if (post) return `<a href="/posts/${post.slug}">${escapeHtml(post.title)}</a>`;
    return `<a href="${url}">linked page</a>`;
  });
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');
  return html;
}

function youtubeEmbedUrl(value = "") {
  try {
    const url = new URL(value);
    let id = "";

    if (url.hostname === "youtu.be") {
      id = url.pathname.slice(1);
    } else if (url.hostname.endsWith("youtube.com")) {
      id = url.searchParams.get("v") || "";
      if (!id && url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2] || "";
      if (!id && url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2] || "";
    }

    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : "";
  } catch {
    return "";
  }
}

function notionBlockTag(line) {
  const trimmed = line.trim();

  if (/^<callout(?:\s[^>]*)?>$/i.test(trimmed)) {
    const icon = trimmed.match(/\sicon="([^"]+)"/i)?.[1] || "";
    return {
      type: "open",
      html: `<aside class="notion-callout">${icon ? `<span class="notion-callout-icon">${escapeHtml(icon)}</span>` : ""}<div>`,
    };
  }

  if (/^<\/callout>$/i.test(trimmed)) {
    return { type: "close", html: "</div></aside>" };
  }

  if (/^<columns(?:\s[^>]*)?>$/i.test(trimmed)) {
    return { type: "open", html: '<div class="notion-columns">' };
  }

  if (/^<\/columns>$/i.test(trimmed)) {
    return { type: "close", html: "</div>" };
  }

  if (/^<column(?:\s[^>]*)?>$/i.test(trimmed)) {
    return { type: "open", html: '<div class="notion-column">' };
  }

  if (/^<\/column>$/i.test(trimmed)) {
    return { type: "close", html: "</div>" };
  }

  const database = trimmed.match(/^<database\b[^>]*\burl="([^"]+)"[^>]*>(?:<\/database>)?$/i);
  if (database) {
    return {
      type: "self",
      html: `<aside class="notion-fallback"><a href="${escapeHtml(database[1])}">Embedded Notion database</a></aside>`,
    };
  }

  const video = trimmed.match(/^<video\b[^>]*\bsrc="([^"]+)"[^>]*>(?:<\/video>)?$/i);
  if (video) {
    const embedUrl = youtubeEmbedUrl(video[1]);
    if (embedUrl) {
      return {
        type: "self",
        html: `<figure class="notion-video"><iframe src="${embedUrl}" title="Embedded video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></figure>`,
      };
    }

    return {
      type: "self",
      html: `<aside class="notion-fallback"><a href="${escapeHtml(video[1])}">Embedded video</a></aside>`,
    };
  }

  const unknown = trimmed.match(/^<unknown\b[^>]*\burl="([^"]+)"(?:[^>]*\balt="([^"]+)")?[^>]*\/>$/i);
  if (unknown) {
    const label = unknown[2] || "Embedded Notion block";
    const className = label.toLowerCase() === "tweet" ? "notion-fallback notion-tweet" : "notion-fallback";
    return {
      type: "self",
      html: `<aside class="${className}"><a href="${escapeHtml(unknown[1])}">${escapeHtml(label)}</a></aside>`,
    };
  }

  return null;
}

function markdownToHtml(markdown = "", postById = new Map()) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let inCode = false;
  let code = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${paragraph.map((line) => inlineMarkdown(line, postById)).join("<br>")}</p>`);
    paragraph = [];
  }

  function flushCode() {
    if (!code.length) return;
    html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
    code = [];
  }

  for (const line of lines) {
    const notionTag = notionBlockTag(line);
    if (notionTag) {
      flushParagraph();
      html.push(notionTag.html);
      continue;
    }

    if (/^\s*<empty-block\/>\s*$/.test(line)) {
      flushParagraph();
      continue;
    }

    if (line.trimStart().startsWith("```")) {
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

    const image = line.trim().match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/);
    if (image) {
      flushParagraph();
      html.push(`<figure><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" loading="lazy"></figure>`);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = Math.min(heading[1].length + 1, 3);
      html.push(`<h${level}>${inlineMarkdown(heading[2], postById)}</h${level}>`);
      continue;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      flushParagraph();
      html.push(`<blockquote>${inlineMarkdown(quote[1], postById)}</blockquote>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      html.push(`<ul><li>${inlineMarkdown(listItem[1], postById)}</li></ul>`);
      continue;
    }

    const orderedItem = line.match(/^\d+\.\s+(.+)$/);
    if (orderedItem) {
      flushParagraph();
      html.push(`<ol><li>${inlineMarkdown(orderedItem[1], postById)}</li></ol>`);
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
  const rawPosts = [];

  for (const page of pages) {
    const title = propertyText(page.properties, "Name").trim();
    if (!title) continue;

    const markdown = await getMarkdown(page.id);
    rawPosts.push({
      id: page.id,
      title,
      slug: slugify(title, page.id),
      date: propertyDate(page.properties, "Published"),
      tags: propertyTags(page.properties, "Tags"),
      description: propertyText(page.properties, "Description").trim(),
      markdown,
      updated: Date.parse(page.last_edited_time || page.created_time || "") || Date.now(),
    });
  }

  const postById = new Map(
    rawPosts.map((post) => [
      normalizeNotionId(post.id),
      {
        title: post.title,
        slug: post.slug,
      },
    ]),
  );

  const posts = rawPosts.map((post) => ({
    ...post,
    html: markdownToHtml(post.markdown, postById),
  }));

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
