type RawPost = {
  id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  description: string;
  markdown: string;
  updated: number;
};

export type BlogPost = RawPost & {
  legacySlugs?: string[];
  html: string;
};

const postFiles = import.meta.glob("../../content/posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function frontmatterValue(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed.replace(/^["']|["']$/g, "");
  }
}

function parsePostFile(filePath: string, raw = ""): RawPost {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Missing frontmatter in ${filePath}`);
  }

  const frontmatter: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!field) continue;
    frontmatter[field[1]] = frontmatterValue(field[2]);
  }

  const fallbackSlug = filePath.split("/").pop()?.replace(/\.md$/, "") || "post";
  const updated = Number(frontmatter.updated) || Date.now();
  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.map(String).filter(Boolean)
    : [];

  return {
    id: String(frontmatter.id || fallbackSlug),
    title: String(frontmatter.title || fallbackSlug),
    slug: String(frontmatter.slug || fallbackSlug),
    date: String(frontmatter.date || ""),
    tags,
    description: String(frontmatter.description || ""),
    markdown: match[2].trimEnd(),
    updated,
  };
}

export function slugify(title: string) {
  const pinyin: Record<string, string> = {
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

  return (
    asciiTitle
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "post"
  );
}

function legacySlugify(title: string, id: string) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "post"}-${id.replaceAll("-", "").slice(0, 8)}`;
}

function normalizeMarkdownHref(href: string) {
  if (href.startsWith("../../public/assets/")) {
    return href.replace("../../public", "");
  }

  const localPost = href.match(/^\.\/([^?#]+)\.md([?#].*)?$/);
  if (localPost) {
    return `/posts/${localPost[1]}${localPost[2] || ""}`;
  }

  return href;
}

function inlineMarkdown(value: string) {
  let html = escapeHtml(value);
  html = html.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^\w])_([^_\n]+)_/g, "$1<em>$2</em>");
  html = html.replace(/(^|[^\w])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  html = html.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|\.{1,2}\/)[^)]+)\)/g, (_match, label, href) => {
    return `<a href="${normalizeMarkdownHref(href)}">${label}</a>`;
  });
  return html;
}

function splitTableRow(line: string) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let cell = "";

  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    const previous = trimmed[index - 1];

    if (char === "|" && previous !== "\\") {
      cells.push(cell.trim().replaceAll("\\|", "|"));
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell.trim().replaceAll("\\|", "|"));
  return cells;
}

function isTableSeparator(line = "") {
  const cells = splitTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function isTableRow(line = "") {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.includes("|");
}

function renderTable(rows: string[]) {
  const [headerRow, , ...bodyRows] = rows;
  const headers = splitTableRow(headerRow);
  const body = bodyRows.map(splitTableRow);

  return [
    '<div class="table-scroll"><table>',
    `<thead><tr>${headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead>`,
    `<tbody>${body
      .map((row) => `<tr>${headers.map((_, index) => `<td>${inlineMarkdown(row[index] || "")}</td>`).join("")}</tr>`)
      .join("")}</tbody>`,
    "</table></div>",
  ].join("");
}

function markdownToHtml(markdown = "") {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let inCode = false;
  let code: string[] = [];
  let list: { tag: "ul" | "ol"; items: string[] } | null = null;

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${paragraph.map((line) => inlineMarkdown(line)).join("<br>")}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!list) return;
    html.push(`<${list.tag}>${list.items.map((item) => `<li>${item}</li>`).join("")}</${list.tag}>`);
    list = null;
  }

  function flushCode() {
    if (!code.length) return;
    html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
    code = [];
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (/^\s*---+\s*$/.test(line)) {
      flushParagraph();
      flushList();
      html.push("<hr>");
      continue;
    }

    if (line.trimStart().startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
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
      flushList();
      continue;
    }

    if (isTableRow(line) && isTableSeparator(lines[index + 1])) {
      const tableRows = [line, lines[index + 1]];
      index += 2;

      while (index < lines.length && isTableRow(lines[index])) {
        tableRows.push(lines[index]);
        index += 1;
      }

      index -= 1;
      flushParagraph();
      flushList();
      html.push(renderTable(tableRows));
      continue;
    }

    const image = line.trim().match(/^!\[(.*)\]\(((?:https?:\/\/|\/|\.{1,2}\/).*)\)$/);
    if (image) {
      flushParagraph();
      flushList();
      html.push(`<figure><img src="${escapeHtml(normalizeMarkdownHref(image[2]))}" alt="${escapeHtml(image[1])}" loading="lazy"></figure>`);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(Math.max(heading[1].length, 2), 4);
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      if (list?.tag !== "ul") flushList();
      list ??= { tag: "ul", items: [] };
      list.items.push(inlineMarkdown(listItem[1]));
      continue;
    }

    const orderedItem = line.match(/^\d+\.\s+(.+)$/);
    if (orderedItem) {
      flushParagraph();
      if (list?.tag !== "ol") flushList();
      list ??= { tag: "ol", items: [] };
      list.items.push(inlineMarkdown(orderedItem[1]));
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushCode();
  return html.join("");
}

function cleanPosts(rawPosts: RawPost[]) {
  const seen = new Map<string, number>();

  return rawPosts.map((post) => {
    const baseSlug = slugify(post.title);
    const count = seen.get(baseSlug) || 0;
    seen.set(baseSlug, count + 1);

    const slug = count ? `${baseSlug}-${count + 1}` : baseSlug;
    const legacySlugs = Array.from(
      new Set([post.slug, legacySlugify(post.title, post.id)].filter((value) => value !== slug)),
    );

    return {
      ...post,
      legacySlugs,
      slug,
      html: "",
    };
  });
}

const cleanedPosts = cleanPosts(
  Object.entries(postFiles)
    .map(([filePath, raw]) => parsePostFile(filePath, raw))
    .filter((post) => post.title),
);

export const posts = cleanedPosts
  .map((post) => ({
    ...post,
    html: markdownToHtml(post.markdown),
  }))
  .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug || post.legacySlugs?.includes(slug));
}

export function renderPostHtml(post: BlogPost) {
  return post.html;
}
