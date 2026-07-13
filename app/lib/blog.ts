import cms from "../../data/notion-cms.json";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  description: string;
  html: string;
  markdown?: string;
  updated: number;
};

export const posts = (cms.posts as BlogPost[])
  .filter((post) => post.title)
  .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function renderPostHtml(post: BlogPost) {
  return post.html;
}
