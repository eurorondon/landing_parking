import { NEGOCIO } from "@/lib/config";

const SERVICIOS = [
  {
    id:       1,
    icon:     "🚿",
    nombre:   "Lavado exterior",
    precio:   "10,00 €",
    lema:     "Tu vehículo lucirá impecable",
    detalle:  "Lavado a mano de la carrocería, llantas y de todo el exterior.",
    popular:  false,
  },
  {
    id:       2,
    icon:     "✨",
    nombre:   "Lavado exterior + interior",
    precio:   "24,00 €",
    lema:     "El más solicitado",
    detalle:  "Lavado a mano de carrocería, llantas y cristales. Limpieza interior de salpicadero, aspirado completo incluido maletero. Aplicación de brillo en neumáticos.",
    popular:  true,
  },
  {
    id:       3,
    icon:     "💎",
    nombre:   "Limpieza completa + tapicería",
    precio:   "80,00 €",
    lema:     "El tratamiento definitivo",
    detalle:  "Todo lo anterior más limpieza de tapicería (solo asientos) y tratamiento de higiene del habitáculo: ácaros y bacterias.",
    popular:  false,
  },
];

/** Mensaje predefinido de WhatsApp para solicitar limpieza */
function waLimpieza(servicio: string) {
  const msg = encodeURIComponent(
    `Hola, me interesa añadir el servicio de "${servicio}" a mi reserva de parking. ¿Me podéis informar?`
  );
  return `${NEGOCIO.whatsappHref}?text=${msg}`;
}

export default function ServiciosLimpieza() {
  return (
    <section className="limpieza-section" id="servicios-limpieza">
      <div className="container">

        {/* ── Cabecera ── */}
        <div className="limpieza-header">
          <p className="limpieza-label">Servicios extras</p>
          <h2 className="limpieza-titulo">
            Servicio de Limpieza<br />
            de Vehículos en el<br />
            <span className="limpieza-titulo-accent">Aeropuerto de Madrid</span>
          </h2>
          <p className="limpieza-desc">
            Deja tu coche impecable mientras disfrutas de tu viaje.
            Lo lavamos mientras está estacionado — sin coste de tiempo para ti.
          </p>
        </div>

        {/* ── Cards ── */}
        <div className="limpieza-grid">
          {SERVICIOS.map((s) => (
            <div
              key={s.id}
              className={`limpieza-card${s.popular ? " limpieza-card--popular" : ""}`}
            >
              {s.popular && (
                <div className="limpieza-badge">⭐ Más popular</div>
              )}

              <div className="limpieza-card-icon">{s.icon}</div>

              <h3 className="limpieza-card-nombre">{s.nombre}</h3>
              <p className="limpieza-card-lema">{s.lema}</p>
              <p className="limpieza-card-precio">{s.precio}</p>
              <p className="limpieza-card-detalle">{s.detalle}</p>

              <a
                href={waLimpieza(s.nombre)}
                target="_blank"
                rel="noreferrer"
                className={`limpieza-btn${s.popular ? " limpieza-btn--popular" : ""}`}
              >
                Solicitar por WhatsApp
              </a>
            </div>
          ))}
        </div>

        {/* ── Nota informativa ── */}
        <p className="limpieza-nota">
          💡 El servicio de limpieza se coordina con tu reserva de parking.
          Contáctanos por WhatsApp o al{" "}
          <a href={NEGOCIO.telefonoHref}>{NEGOCIO.telefono}</a> para añadirlo.
        </p>

      </div>
    </section>
  );
}
