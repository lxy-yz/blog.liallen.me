import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "../lib/blog";

export const metadata: Metadata = {
  title: "Posts",
  description: "All posts synced from the Notion CMS.",
};

export default function PostsPage() {
  return (
    <main className="archive">
      <h1>Posts</h1>
      <p>{posts.length} posts synced from Notion CMS.</p>
      <section className="post-list">
        {posts.map((post) => (
          <article className="post-card" key={post.id}>
            <Link href={`/posts/${post.slug}`}>
              <span className="date">{post.date}</span>
              <h2>{post.title}</h2>
              {post.description ? <p>{post.description}</p> : null}
              {post.tags.length ? (
                <div className="tags">
                  {post.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
