import type { MetadataRoute } from "next";
import { BLOG_POSTS, SEO_PAGES } from "@/lib/blog-data";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const comerciales = SEO_PAGES.map((p) => ({
    url: `${SITE_URL}/${p.slug}/`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blog = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}/`,
    lastModified: new Date(p.publishDate),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    ...comerciales,
    { url: `${SITE_URL}/blog/`, changeFrequency: "weekly", priority: 0.7 },
    ...blog,
    { url: `${SITE_URL}/aviso-legal/`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacidad/`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cookies/`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
