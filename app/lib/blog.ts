import cms from "../../data/notion-cms.json";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  legacySlugs?: string[];
  date: string;
  tags: string[];
  description: string;
  html: string;
  markdown?: string;
  updated: number;
};

function slugify(title: string) {
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

function cleanPosts(posts: BlogPost[]) {
  const seen = new Map<string, number>();

  return posts.map((post) => {
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
    };
  });
}

export const posts = cleanPosts((cms.posts as BlogPost[]).filter((post) => post.title)).sort(
  (a, b) => (b.date || "").localeCompare(a.date || ""),
);

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug || post.legacySlugs?.includes(slug));
}

export function renderPostHtml(post: BlogPost) {
  return post.html;
}
