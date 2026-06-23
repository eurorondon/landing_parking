import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyButtons from "@/components/StickyButtons";
import BookingForm from "@/components/BookingForm";
import { NEGOCIO } from "@/lib/config";

/* ─── Tipos ────────────────────────────────────────────────────────────────── */

export interface FAQItem {
  pregunta: string;
  respuesta: string;
}

export interface InternalLink {
  href: string;
  text: string;
}

export interface SectionH2 {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface LandingPageSEOProps {
  h1: string;
  cta: string;
  secciones: SectionH2[];
  internalLinks: InternalLink[];
  faqs: FAQItem[];
  breadcrumb: { name: string; item: string }[];
  /** URL canónica de esta página, p. ej. "/parking-barajas/" */
  canonicalPath: string;
}

/* ─── JSON-LD helpers ──────────────────────────────────────────────────────── */

function buildLocalBusinessLD(h1: string, canonicalPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: NEGOCIO.nombre,
    description: h1,
    url: `https://parkingaeromadrid.es${canonicalPath}`,
    telephone: NEGOCIO.telefono,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. de la Hispanidad, s/n",
      addressLocality: "Madrid",
      postalCode: "28042",
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 40.4983,
      longitude: -3.5676,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    priceRange: "€€",
  };
}

function buildFAQLD(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.pregunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.respuesta,
      },
    })),
  };
}

function buildBreadcrumbLD(
  breadcrumb: { name: string; item: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumb.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: `https://parkingaeromadrid.es${b.item}`,
    })),
  };
}

/* ─── Componente principal ─────────────────────────────────────────────────── */

export default function LandingPageSEO({
  h1,
  cta,
  secciones,
  internalLinks,
  faqs,
  breadcrumb,
  canonicalPath,
}: LandingPageSEOProps) {
  const localBusinessLD = buildLocalBusinessLD(h1, canonicalPath);
  const faqLD = buildFAQLD(faqs);
  const breadcrumbLD = buildBreadcrumbLD(breadcrumb);

  return (
    <>
      {/* ── JSON-LD ──────────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLD) }}
      />

      <Header />

      <main>
        {/* ── HERO / H1 ────────────────────────────────────────────────── */}
        <section className="seo-hero">
          <div className="container">
            {/* Breadcrumb visible */}
            <nav className="seo-breadcrumb" aria-label="Ruta de navegación">
              {breadcrumb.map((b, i) => (
                <span key={b.item}>
                  {i > 0 && <span className="seo-bc-sep"> › </span>}
                  {i < breadcrumb.length - 1 ? (
                    <a href={b.item}>{b.name}</a>
                  ) : (
                    <span>{b.name}</span>
                  )}
                </span>
              ))}
            </nav>

            <div className="seo-hero-grid">
              {/* Izquierda: H1 + trust + CTA móvil */}
              <div className="seo-hero-left">
                <div className="hero-badge">
                  <span className="hero-badge-stars">★★★★★</span>
                  <span>Más de 8.000 reservas realizadas</span>
                </div>

                <h1>{h1}</h1>

                <div className="hero-terminals">T1 · T2 · T4 &nbsp;&nbsp; Madrid-Barajas</div>

                <div className="hero-feat-3">
                  {[
                    { icon: "✈️", title: "Entrega en terminal", sub: "T1, T2 y T4" },
                    { icon: "🔒", title: "Vigilancia 24h", sub: "Parking privado y seguro" },
                    { icon: "💬", title: "Confirmación WhatsApp", sub: "Atención inmediata" },
                  ].map((f) => (
                    <div className="hero-feat-item" key={f.title}>
                      <div className="hero-feat-icon">{f.icon}</div>
                      <b>{f.title}</b>
                      <span>{f.sub}</span>
                    </div>
                  ))}
                </div>

                {/* CTA para móvil */}
                <a className="cta-orange hero-cta-mobile" href="#calcular">
                  <div className="cta-orange-top">
                    <span>CALCULAR MI PRECIO</span>
                    <span className="cta-arrow">›</span>
                  </div>
                  <div className="cta-sub-text">Precio al instante en menos de 1 minuto</div>
                </a>

                <a
                  className="cta-whatsapp"
                  href={NEGOCIO.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="wp-icon">💬</span>
                  <div className="wp-text">
                    <div className="wp-title">RESERVAR POR WHATSAPP</div>
                    <div className="wp-sub">Atención inmediata</div>
                  </div>
                  <span className="cta-arrow">›</span>
                </a>
              </div>

              {/* Derecha: calculadora (solo escritorio) */}
              <div className="hero-right">
                <BookingForm />
              </div>
            </div>
          </div>
        </section>

        {/* ── Calculadora en móvil ─────────────────────────────────────── */}
        <section className="bform-section" id="calcular">
          <div className="bform-container">
            <BookingForm />
          </div>
        </section>

        {/* ── SECCIONES H2 ─────────────────────────────────────────────── */}
        {secciones.map((sec) => (
          <section key={sec.id} id={sec.id} className="seo-section">
            <div className="container">
              <h2 className="seo-h2">{sec.title}</h2>
              <div className="seo-content">{sec.content}</div>
            </div>
          </section>
        ))}

        {/* ── ENLACES INTERNOS ─────────────────────────────────────────── */}
        <section className="seo-internal-links">
          <div className="container">
            <div className="section-head center">
              <div className="section-kicker">Más opciones de parking</div>
              <h2 className="section-title">Explora nuestros servicios</h2>
            </div>
            <div className="seo-links-grid">
              {internalLinks.map((link) => (
                <a key={link.href} href={link.href} className="seo-link-card">
                  <span className="seo-link-icon">🅿️</span>
                  <span>{link.text}</span>
                  <span className="seo-link-arrow">›</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="seo-faq-section">
          <div className="container faq">
            <div className="section-head">
              <div className="section-kicker">Preguntas frecuentes</div>
              <h2 className="section-title">
                {secciones.find((s) => s.id === "faq")?.title ?? "Preguntas frecuentes"}
              </h2>
              <p className="section-text">
                Respuestas rápidas para que reserves con confianza.
              </p>
            </div>
            <div>
              {faqs.map((faq, i) => (
                <details key={faq.pregunta} open={i === 0}>
                  <summary>{faq.pregunta}</summary>
                  <p>{faq.respuesta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────── */}
        <section>
          <div className="container final-cta">
            <h2>{cta}</h2>
            <p>
              Calcula tu precio, deja tus datos y recibe la confirmación de tu
              reserva para aparcar en Madrid-Barajas.
            </p>
            <a className="btn btn-primary" href="#calcular">
              Calcular mi precio
            </a>
          </div>
        </section>
      </main>

      <Footer />
      <StickyButtons />
    </>
  );
}
