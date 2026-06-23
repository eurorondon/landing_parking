import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyButtons from "@/components/StickyButtons";
import { BLOG_POSTS } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Blog de Parking en el Aeropuerto Madrid-Barajas | Guías y Consejos",
  description:
    "Guías prácticas, consejos y respuestas sobre parking en el Aeropuerto Madrid-Barajas. Aprende a reservar mejor, ahorrar y viajar sin imprevistos.",
  alternates: { canonical: "https://parkingaeromadrid.es/blog/" },
};

export default function BlogIndexPage() {
  return (
    <>
      <Header />
      <main>
        <section className="blog-hero">
          <div className="container">
            <nav className="seo-breadcrumb" aria-label="Ruta de navegación">
              <span><a href="/">Inicio</a></span>
              <span className="seo-bc-sep"> › </span>
              <span>Blog</span>
            </nav>
            <h1 className="blog-h1">Blog de Parking en el Aeropuerto Madrid-Barajas</h1>
            <p className="blog-intro">
              Guías prácticas, consejos de reserva y toda la información que necesitas
              para aparcar en Barajas de forma cómoda, segura y al mejor precio.
            </p>
          </div>
        </section>

        <section style={{ padding: "64px 0" }}>
          <div className="container">
            <div className="blog-index-grid">
              {BLOG_POSTS.map((post) => (
                <a key={post.slug} href={`/blog/${post.slug}/`} className="blog-card">
                  <span className="blog-card-kicker">Guía</span>
                  <h2>{post.h1}</h2>
                  <p>{post.metaDescription}</p>
                  <span className="blog-card-arrow">›</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyButtons />
    </>
  );
}
