import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "./lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Observations and thoughts from everyday life.",
};

const startHereTitles = [
  "Who stole my pace?",
  "5 kilometers",
  "山路夜骑",
  "Why I left the US",
  "好久不见",
  "即兴山河",
];

export default function Home() {
  const startHere = startHereTitles
    .map((title) => posts.find((post) => post.title === title))
    .filter((post) => post !== undefined);

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
