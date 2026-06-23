/**
 * SeoHubSection — sección de enlazado interno en la homepage.
 *
 * Muestra las 7 páginas SEO de parking como tarjetas clicables y
 * un enlace al blog. Distribuye autoridad (PageRank) desde la
 * homepage —la página con mayor peso— hacia las páginas objetivo.
 */

import { SEO_PAGES } from "@/lib/blog-data";

const SLUG_EMOJI: Record<string, string> = {
  "parking-barajas":                          "🅿️",
  "parking-terminal-1-barajas":               "1️⃣",
  "parking-terminal-2-barajas":               "2️⃣",
  "parking-terminal-4-barajas":               "4️⃣",
  "parking-valet-aeropuerto-madrid":          "🤵",
  "parking-aeropuerto-madrid-barato":         "💸",
  "parking-larga-estancia-aeropuerto-madrid": "📅",
};

export default function SeoHubSection() {
  return (
    <section className="seo-hub-section">
      <div className="container">

        {/* Cabecera */}
        <div className="section-head center">
          <p className="section-kicker">Servicios de parking</p>
          <h2 className="section-title">Elige el parking perfecto para tu viaje</h2>
          <p className="section-text">
            Parking privado cerca del Aeropuerto Madrid-Barajas. Filtra por
            terminal, tipo de servicio o precio y reserva en minutos.
          </p>
        </div>

        {/* Grid de páginas SEO */}
        <div className="seo-hub-grid">
          {SEO_PAGES.map((page) => (
            <a
              key={page.slug}
              href={`/${page.slug}/`}
              className="seo-hub-card"
            >
              <span className="seo-hub-emoji" aria-hidden="true">
                {SLUG_EMOJI[page.slug] ?? "🅿️"}
              </span>
              <span className="seo-hub-label">{page.label}</span>
            </a>
          ))}
        </div>

        {/* Enlace al blog */}
        <div className="seo-hub-blog-link">
          <a href="/blog/" className="seo-hub-blog-btn">
            📖 Ver guías y consejos en el blog →
          </a>
        </div>

      </div>
    </section>
  );
}
