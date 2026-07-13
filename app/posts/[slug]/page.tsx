import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, posts, renderPostHtml } from "../../lib/blog";
import { GiscusComments } from "./comments";

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
  const repo = process.env.GISCUS_REPO || "lxy-yz/blog.liallen.me";
  const repoId = process.env.GISCUS_REPO_ID || "R_kgDOTWz0SA";
  const category = process.env.GISCUS_CATEGORY || "General";
  const categoryId =
    process.env.GISCUS_CATEGORY_ID || "DIC_kwDOTWz0SM4DBFid";

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
    <GiscusComments
      repo={repo}
      repoId={repoId}
      category={category}
      categoryId={categoryId}
    />
  );
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  return (
    <main className="post">
      <article>
        <header className="post-header">
          <div className="post-meta">
            <span className="date">{post.date}</span>
            {post.tags.length ? (
              <div className="tags">
                {post.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            ) : null}
          </div>
          <h1>{post.title}</h1>
          {post.description ? <p>{post.description}</p> : null}
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
