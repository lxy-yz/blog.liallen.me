import cms from "../../data/notion-cms.json";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  legacySlug?: string;
  date: string;
  tags: string[];
  description: string;
  html: string;
  markdown?: string;
  updated: number;
};

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
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

    return {
      ...post,
      legacySlug: post.slug === slug ? legacySlugify(post.title, post.id) : post.slug,
      slug,
    };
  });
}

export const posts = cleanPosts((cms.posts as BlogPost[]).filter((post) => post.title)).sort(
  (a, b) => (b.date || "").localeCompare(a.date || ""),
);

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug || post.legacySlug === slug);
}

export function renderPostHtml(post: BlogPost) {
  return post.html;
}
