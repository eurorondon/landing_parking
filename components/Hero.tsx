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
              <span>Más de 8.000 clientes satisfechos</span>
            </div>

            <h1>Parking Aeropuerto Madrid</h1>

            <div className="hero-slogan">
              Entrega tu coche en la terminal<br />y viaja sin esperas
            </div>

            <div className="hero-terminals">T1 · T2 · T4 &nbsp;&nbsp; Madrid-Barajas</div>

            <div className="hero-desc">
              Recogemos tu coche en la terminal y te lo devolvemos allí mismo
              a tu regreso. Sin autobuses. Sin esperas. Sin pagar por adelantado.
            </div>

            {/* 3 ventajas */}
            <div className="hero-feat-3">
              {[
                { icon: "✈️", title: "Entrega en terminal", sub: "Recogida en tu regreso" },
                { icon: "🚌", title: "Sin autobuses", sub: "Directo al aeropuerto" },
                { icon: "🛡️", title: "Vigilancia 24h", sub: "Vehículo protegido" },
              ].map((f) => (
                <div className="hero-feat-item" key={f.title}>
                  <div className="hero-feat-icon">{f.icon}</div>
                  <b>{f.title}</b>
                  <span>{f.sub}</span>
                </div>
              ))}
            </div>

            {/* 2 ventajas */}
            <div className="hero-feat-2">
              {[
                { icon: "💬", title: "Reserva inmediata", sub: "Confirmación al instante" },
                { icon: "💳", title: "Sin pago por adelantado", sub: "Paga al entregar" },
              ].map((f) => (
                <div className="hero-feat-item" key={f.title}>
                  <div className="hero-feat-icon">{f.icon}</div>
                  <b>{f.title}</b>
                  <span>{f.sub}</span>
                </div>
              ))}
            </div>

            {/* CTA calcular (solo visible en móvil; en desktop el form está a la derecha) */}
            <a className="cta-orange hero-cta-mobile" href="#calcular">
              <div className="cta-orange-top">
                <span>CONSULTAR PRECIO</span>
                <span className="cta-arrow">›</span>
              </div>
              <div className="cta-sub-text">🟢 Sin compromiso • Pago al entregar • Confirmación inmediata</div>
            </a>

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
                <div className="stat-text">Más de <b>8.000</b><br />clientes satisfechos</div>
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
