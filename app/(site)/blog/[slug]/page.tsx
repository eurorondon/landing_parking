import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug, BLOG_POSTS } from "@/lib/blog-data";
import BlogArticlePage from "@/components/BlogArticlePage";
import { pageMetadata } from "@/lib/seo";

/* ─── SSG: genera una ruta por cada artículo ──────────────────────────────── */

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

/* ─── Metadata dinámica por artículo ─────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return pageMetadata({
    title: post.title,
    description: post.metaDescription,
    path: `/blog/${post.slug}/`,
    type: "article",
    publishedTime: post.publishDate,
  });
}

/* ─── Página ──────────────────────────────────────────────────────────────── */

export default async function BlogArticleRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  return <BlogArticlePage post={post} allPosts={BLOG_POSTS} />;
}
