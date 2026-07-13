import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "./lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Observations and thoughts from everyday life.",
};

export default function Home() {
  const startHere = posts.slice(0, 6);

  return (
    <main className="home">
      <section className="post-list-section">
        <div className="post-list">
          {startHere.map((post) => (
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
        </div>
      </section>
    </main>
  );
}
