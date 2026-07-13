import source from "../../data/notion-collection.json";

type RichTextSegment = [string, unknown[]?];

type NotionBlock = {
  id: string;
  type: string;
  alive?: boolean;
  properties?: Record<string, RichTextSegment[]>;
  content?: string[];
  format?: Record<string, unknown>;
  created_time?: number;
  last_edited_time?: number;
};

type WrappedRecord = {
  value?: {
    value?: {
      value?: NotionBlock;
    } & NotionBlock;
  };
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  description: string;
  contentIds: string[];
  updated: number;
};

const recordMap = source.recordMap.block as Record<string, WrappedRecord>;
const resultIds =
  source.result.reducerResults.collection_group_results.blockIds as string[];

function unwrap(record?: WrappedRecord): NotionBlock | null {
  return record?.value?.value?.value || record?.value?.value || null;
}

const blocks = new Map(
  Object.entries(recordMap)
    .map(([id, record]) => [id, unwrap(record)] as const)
    .filter((entry): entry is readonly [string, NotionBlock] => Boolean(entry[1])),
);

function textFromRichText(rich: RichTextSegment[] = []) {
  return rich.map((segment) => segment?.[0] || "").join("");
}

function dateFromProperty(prop: RichTextSegment[] = []) {
  const dateMark = prop?.[0]?.[1]?.find?.((mark) => {
    return Array.isArray(mark) && mark[0] === "d";
  }) as [string, { start_date?: string }] | undefined;

  return dateMark?.[1]?.start_date || "";
}

function slugify(title: string, id: string) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "post"}-${id.replaceAll("-", "").slice(0, 8)}`;
}

function collectTags(prop: RichTextSegment[] = []) {
  return textFromRichText(prop)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export const posts: BlogPost[] = resultIds
  .map((id) => blocks.get(id))
  .filter((block): block is NotionBlock => block?.type === "page")
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
  .filter((post) => post.contentIds.length > 0)
  .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

const postsById = new Map(posts.map((post) => [post.id, post]));

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pageTitle(id: string) {
  return textFromRichText(blocks.get(id)?.properties?.title) || "Untitled";
}

function markHref(mark: unknown[]) {
  if (mark[0] === "a") return String(mark[1] || "");
  if (mark[0] === "lm" && typeof mark[1] === "object" && mark[1] && "href" in mark[1]) {
    return String(mark[1].href || "");
  }
  return "";
}

function richText(rich: RichTextSegment[] = []): string {
  return rich
    .map((segment) => {
      const raw = segment?.[0] || "";
      const marks = segment?.[1] || [];
      const pageMark = marks.find((mark) => Array.isArray(mark) && mark[0] === "p") as
        | [string, string]
        | undefined;
      const linkMark = marks.find((mark) => Array.isArray(mark) && (mark[0] === "a" || mark[0] === "lm")) as
        | unknown[]
        | undefined;
      const text = raw === "‣" && pageMark ? pageTitle(pageMark[1]) : raw;
      let html = escapeHtml(text);

      for (const mark of marks) {
        if (!Array.isArray(mark)) continue;
        if (mark[0] === "b") html = `<strong>${html}</strong>`;
        if (mark[0] === "i") html = `<em>${html}</em>`;
        if (mark[0] === "s") html = `<s>${html}</s>`;
        if (mark[0] === "c") html = `<code>${html}</code>`;
      }

      if (pageMark) {
        const post = postsById.get(pageMark[1]);
        const href = post ? `/posts/${post.slug}` : `https://blog.liallen.me/${pageMark[1].replaceAll("-", "")}`;
        return `<a href="${escapeHtml(href)}">${html}</a>`;
      }

      if (linkMark) {
        const href = markHref(linkMark);
        if (href) return `<a href="${escapeHtml(href)}">${html}</a>`;
      }

      return html;
    })
    .join("");
}

function renderChildren(block: NotionBlock) {
  return (block.content || []).map((id) => renderBlock(blocks.get(id))).join("");
}

function renderBlock(block?: NotionBlock): string {
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
      const src = String(block.format?.display_source || textFromRichText(block.properties?.source) || "");
      const alt = textFromRichText(block.properties?.caption) || textFromRichText(block.properties?.title) || "";
      return src
        ? `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy">${alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : ""}</figure>`
        : "";
    }
    case "bookmark": {
      const href = textFromRichText(block.properties?.link);
      return href ? `<p><a class="bookmark" href="${escapeHtml(href)}">${title || escapeHtml(href)}</a></p>` : "";
    }
    case "video":
    case "embed":
    case "tweet": {
      const src = String(block.format?.display_source || textFromRichText(block.properties?.source) || "");
      return src ? `<p><a href="${escapeHtml(src)}">${title || escapeHtml(src)}</a></p>` : "";
    }
    default:
      return title ? `<p>${title}</p>${children}` : children;
  }
}

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function renderPostHtml(post: BlogPost) {
  return post.contentIds.map((id) => renderBlock(blocks.get(id))).join("");
}
