import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "vercel-dist");
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("export", String(Date.now()));

const { default: worker } = await import(workerUrl.href);

function frontmatterValue(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed.replace(/^["']|["']$/g, "");
  }
}

async function readPosts() {
  const postsDir = path.join(root, "content", "posts");
  const files = (await readdir(postsDir)).filter((file) => file.endsWith(".md"));
  const posts = [];

  for (const file of files) {
    const raw = await readFile(path.join(postsDir, file), "utf8");
    const match = raw.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?/);
    if (!match) throw new Error(`Missing frontmatter in ${path.join("content/posts", file)}`);

    const frontmatter = {};
    for (const line of match[1].split("\n")) {
      const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (!field) continue;
      frontmatter[field[1]] = frontmatterValue(field[2]);
    }

    posts.push({
      id: String(frontmatter.id || file.replace(/\.md$/, "")),
      title: String(frontmatter.title || file.replace(/\.md$/, "")),
      slug: String(frontmatter.slug || file.replace(/\.md$/, "")),
    });
  }

  return posts;
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

function legacySlugify(title, id) {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "post"}-${id.replaceAll("-", "").slice(0, 8)}`;
}

function postRoutes(posts) {
  const seen = new Map();
  const routes = [];

  for (const post of posts) {
    const baseSlug = slugify(post.title);
    const count = seen.get(baseSlug) || 0;
    seen.set(baseSlug, count + 1);

    const slug = count ? `${baseSlug}-${count + 1}` : baseSlug;
    const legacySlugs = Array.from(
      new Set([post.slug, legacySlugify(post.title, post.id)].filter((value) => value !== slug)),
    );

    routes.push({
      pathname: `/posts/${slug}`,
      file: `posts/${slug}/index.html`,
    });

    for (const legacySlug of legacySlugs) {
      routes.push({
        pathname: `/posts/${legacySlug}`,
        file: `posts/${legacySlug}/index.html`,
      });
    }
  }

  return routes;
}

const routes = [
  { pathname: "/", file: "index.html" },
  { pathname: "/posts", file: "posts/index.html" },
  { pathname: "/rss.xml", file: "rss.xml" },
  { pathname: "/sitemap.xml", file: "sitemap.xml" },
  ...postRoutes(await readPosts()),
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
