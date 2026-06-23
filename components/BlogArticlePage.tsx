import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyButtons from "@/components/StickyButtons";
import { NEGOCIO } from "@/lib/config";
import { BlogPost, SEO_PAGES } from "@/lib/blog-data";

const APP_URL = "https://parkingaeromadrid.es";

/* ─── JSON-LD helpers ──────────────────────────────────────────────────────── */

function buildArticleLD(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.h1,
    description: post.metaDescription,
    url: `${APP_URL}/blog/${post.slug}/`,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    inLanguage: "es",
    author: {
      "@type": "Organization",
      name: NEGOCIO.nombre,
      url: APP_URL,
    },
    publisher: {
      "@type": "Organization",
      name: NEGOCIO.nombre,
      url: APP_URL,
    },
  };
}

function buildFaqLD(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

function buildBreadcrumbLD(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: APP_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${APP_URL}/blog/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.h1,
        item: `${APP_URL}/blog/${post.slug}/`,
      },
    ],
  };
}

/* ─── Componente principal ──────────────────────────────────────────────────── */

interface BlogArticlePageProps {
  post: BlogPost;
  /** Todos los posts del blog, para resolver relatedPostSlugs */
  allPosts: BlogPost[];
}

export default function BlogArticlePage({ post, allPosts }: BlogArticlePageProps) {
  // Resolver páginas comerciales vinculadas
  const linkedPages = post.linkedPageSlugs
    .map((slug) => SEO_PAGES.find((p) => p.slug === slug))
    .filter(Boolean) as typeof SEO_PAGES;

  // Resolver artículos relacionados
  const relatedPosts = post.relatedPostSlugs
    .map((slug) => allPosts.find((p) => p.slug === slug))
    .filter(Boolean) as BlogPost[];

  // Formatear fecha
  const dateDisplay = new Date(post.publishDate).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleLD(post)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqLD(post)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbLD(post)) }}
      />

      <Header />

      <main>
        {/* ── Hero ── */}
        <section className="blog-hero">
          <div className="container">
            <nav className="seo-breadcrumb" aria-label="Ruta de navegación">
              <span><a href="/">Inicio</a></span>
              <span className="seo-bc-sep"> › </span>
              <span><a href="/blog/">Blog</a></span>
              <span className="seo-bc-sep"> › </span>
              <span>{post.h1}</span>
            </nav>

            <div className="blog-article-meta">
              <time dateTime={post.publishDate}>📅 {dateDisplay}</time>
              <span>⏱️ {post.readTime}</span>
            </div>

            <h1 className="blog-h1">{post.h1}</h1>

            <div className="blog-intro-box">
              <p className="blog-intro">{post.intro}</p>
            </div>
          </div>
        </section>

        {/* ── Secciones de contenido ── */}
        {post.sections.map((section, i) => (
          <section key={i} className="seo-section">
            <div className="container">
              <h2 className="seo-h2">{section.h2}</h2>
              <div className="seo-content">
                <p>{section.content}</p>
                {section.items && section.items.length > 0 && (
                  <ul>
                    {section.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* ── Páginas relacionadas ── */}
        {linkedPages.length > 0 && (
          <section className="seo-internal-links">
            <div className="container">
              <div className="section-head">
                <p className="section-kicker">Servicios relacionados</p>
                <h2 className="section-title">Páginas relacionadas</h2>
              </div>
              <div className="seo-links-grid">
                {linkedPages.map((page) => (
                  <a
                    key={page.slug}
                    href={`/${page.slug}/`}
                    className="seo-link-card"
                  >
                    <span className="seo-link-icon">🅿️</span>
                    <span>{page.label}</span>
                    <span className="seo-link-arrow">›</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        <section className="seo-faq-section">
          <div className="container">
            <div className="section-head">
              <p className="section-kicker">Preguntas frecuentes</p>
              <h2 className="section-title">Lo que más nos preguntan</h2>
            </div>
            <div className="blog-faq-list">
              {post.faqs.map((faq, i) => (
                <details key={i} className="blog-faq-item">
                  <summary className="blog-faq-q">
                    <span>{faq.question}</span>
                    <span className="blog-faq-chevron" aria-hidden="true">▾</span>
                  </summary>
                  <p className="blog-faq-a">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: "64px 0" }}>
          <div className="container">
            <div className="final-cta">
              <h2>¿Listo para reservar?</h2>
              <p>{post.cta}</p>
              <a href={NEGOCIO.whatsappHref} className="btn" rel="noopener noreferrer" target="_blank">
                Reservar ahora
              </a>
            </div>
          </div>
        </section>

        {/* ── Artículos relacionados ── */}
        {relatedPosts.length > 0 && (
          <section className="blog-related-posts">
            <div className="container">
              <div className="section-head">
                <p className="section-kicker">Sigue leyendo</p>
                <h2 className="section-title">Artículos relacionados</h2>
              </div>
              <div className="blog-posts-grid">
                {relatedPosts.map((related) => (
                  <a
                    key={related.slug}
                    href={`/blog/${related.slug}/`}
                    className="blog-post-link"
                  >
                    <span className="blog-post-link-kicker">Artículo</span>
                    <h3>{related.h1}</h3>
                    <span className="blog-post-link-arrow">›</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <StickyButtons />
    </>
  );
}
