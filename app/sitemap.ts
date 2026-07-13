import type { MetadataRoute } from "next";
import { posts } from "./lib/blog";

const siteUrl = process.env.SITE_URL || "https://blog.liallen.me";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl}/`,
    },
    {
      url: `${siteUrl}/posts`,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/posts/${post.slug}`,
      lastModified: post.date || new Date(post.updated).toISOString(),
    })),
  ];
}
