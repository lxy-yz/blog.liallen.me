import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts, renderPostHtml } from "../../lib/blog";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description || "Observe first. Understand later.",
  };
}

function Comments() {
  const repo = process.env.GISCUS_REPO;
  const repoId = process.env.GISCUS_REPO_ID;
  const category = process.env.GISCUS_CATEGORY || "Comments";
  const categoryId = process.env.GISCUS_CATEGORY_ID;

  if (!repo || !repoId || !categoryId) {
    return (
      <section className="comments muted">
        <h2>Comments</h2>
        <p>
          Set <code>GISCUS_REPO</code>, <code>GISCUS_REPO_ID</code>, and{" "}
          <code>GISCUS_CATEGORY_ID</code> in hosting environment variables to
          enable free GitHub Discussions comments.
        </p>
      </section>
    );
  }

  return (
    <section className="comments">
      <h2>Comments</h2>
      <script
        src="https://giscus.app/client.js"
        data-repo={repo}
        data-repo-id={repoId}
        data-category={category}
        data-category-id={categoryId}
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="en"
        crossOrigin="anonymous"
        async
      />
    </section>
  );
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  return (
    <main className="post">
      <article>
        <Link className="back" href="/posts">
          Posts
        </Link>
        <header className="post-header">
          <p className="date">{post.date}</p>
          <h1>{post.title}</h1>
          {post.description ? <p>{post.description}</p> : null}
          {post.tags.length ? (
            <div className="tags">
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}
        </header>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: renderPostHtml(post) }}
        />
      </article>
      <Comments />
    </main>
  );
}
