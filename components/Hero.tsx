import BookingForm from "./BookingForm";
import { NEGOCIO } from "@/lib/config";

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="container">
        <div className="hero-desktop-grid">

          {/* ════════════════════════════════════
              IZQUIERDA — contenido de marketing
              ════════════════════════════════════ */}
          <div className="hero-left">

            {/* Stars badge */}
            <div className="hero-badge">
              <span className="hero-badge-stars">★★★★★</span>
              <span>Más de 20.000 clientes satisfechos</span>
            </div>

            <h1>
              Parking Aeropuerto
              <br />
              <span className="hero-h1-accent">Madrid</span>
            </h1>

            <div className="hero-subtitle">
              Entrega tu coche en <span className="hero-subtitle-accent">T1</span>,{" "}
              <span className="hero-subtitle-accent">T2</span> o{" "}
              <span className="hero-subtitle-accent">T4</span> y vete directamente a tu vuelo.
            </div>

            {/* 4 ventajas */}
            <div className="hero-feat-4">
              {[
                { icon: "✈️", title: "Entrega en terminal" },
                { icon: "🚌", title: "Sin autobuses ni esperas" },
                { icon: "🛡️", title: "Seguro y vigilancia 24h" },
                { icon: "💳", title: "Paga al entregar" },
              ].map((f) => (
                <div className="hero-feat-item" key={f.title}>
                  <div className="hero-feat-icon">{f.icon}</div>
                  <b>{f.title}</b>
                </div>
              ))}
            </div>

            {/* CTA calcular (solo visible en móvil; en desktop el form está a la derecha) */}
            <a className="cta-orange hero-cta-mobile" href="#calcular">
              <div className="cta-orange-top">
                <span>CONSULTAR PRECIO</span>
                <span className="cta-arrow">›</span>
              </div>
            </a>

            {/* Checks bajo el CTA (solo visible en móvil, igual que el botón) */}
            <div className="hero-cta-checks hero-cta-mobile">
              {["Sin compromiso", "Paga al entregar", "Confirmación inmediata"].map((t) => (
                <span className="hero-cta-check-item" key={t}>
                  <span className="hero-cta-check-icon">✅</span>
                  {t}
                </span>
              ))}
            </div>

            {/* WhatsApp */}
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

            {/* Stats */}
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-icon">👥</span>
                <div className="stat-text">Más de <b>20.000</b><br />clientes satisfechos</div>
              </div>
              <div className="hero-stat">
                <span className="stat-icon">🛡️</span>
                <div className="stat-text">Seguro<br />incluido</div>
              </div>
              <div className="hero-stat">
                <span className="stat-icon">🎧</span>
                <div className="stat-text">Atención 24/7<br />Siempre disponibles</div>
              </div>
            </div>

            {/* Franja inferior (móvil) */}
            <div className="hero-footer-strip">
              <div><span>📍</span> Cobertura total T1 · T2 · T4</div>
              <div><span>🎧</span> Atención 24/7 Siempre disponibles</div>
            </div>

          </div>

          {/* ════════════════════════════════════
              DERECHA — formulario (solo escritorio)
              ════════════════════════════════════ */}
          <div className="hero-right">
            <BookingForm />
          </div>

        </div>
      </div>
    </section>
  );
}
