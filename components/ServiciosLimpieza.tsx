"use client";

/**
 * ServiciosLimpieza — Sección de lavado de vehículos.
 *
 * Comportamiento igual al dashboard (Seccion4):
 * - "Solicitar" guarda el servicio en sessionStorage
 * - Hace scroll al formulario de reserva (#calcular)
 * - Muestra un toast de confirmación
 * - El BookingForm lee el sessionStorage y muestra el badge de lavado incluido
 */

import { useEffect, useState } from "react";

/** Detalle "solo exterior" para autocaravana (oculta cualquier mención a interior) */
const DETALLE_EXTERIOR = "Lavado a mano de la carrocería, llantas y de todo el exterior.";
/** IDs de servicios cuyo texto menciona interior/tapicería */
const SERVICIOS_CON_INTERIOR = [2, 3];

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

export default function ServiciosLimpieza() {
  const [toast, setToast] = useState<string | null>(null);
  const [esAutocaravana, setEsAutocaravana] = useState(false);

  // Escucha el tipo de vehículo elegido en el formulario de reserva.
  // Para autocaravana ocultamos el texto "interior": esos servicios se
  // muestran solo como "Lavado" (el ID y el precio no cambian → se cobra igual).
  useEffect(() => {
    const leer = (v: string | null | undefined) => setEsAutocaravana(v === "autocaravana");
    leer(sessionStorage.getItem("vehiculo"));
    const onVehiculo = (e: Event) => leer((e as CustomEvent<string>).detail);
    window.addEventListener("vehiculo-cambiado", onVehiculo);
    return () => window.removeEventListener("vehiculo-cambiado", onVehiculo);
  }, []);

  /** Nombre/detalle a mostrar según el vehículo (autocaravana oculta "interior") */
  function textos(s: (typeof SERVICIOS)[number]) {
    if (esAutocaravana && SERVICIOS_CON_INTERIOR.includes(s.id)) {
      return { nombre: "Lavado", detalle: DETALLE_EXTERIOR };
    }
    return { nombre: s.nombre, detalle: s.detalle };
  }

  /** Equivalente a handleSelectService del dashboard */
  function solicitar(id: number, nombre: string, precio: string) {
    // 1. Guardar en sessionStorage (persiste si el usuario recarga)
    sessionStorage.setItem("lavado_id",     String(id));
    sessionStorage.setItem("lavado_nombre", nombre);
    sessionStorage.setItem("lavado_precio", precio);

    // 2. Notificar al BookingForm en tiempo real mediante evento personalizado
    //    (el useEffect del form ya corrió al montar, así que no releerá sessionStorage)
    window.dispatchEvent(
      new CustomEvent("lavado-seleccionado", { detail: { id, nombre, precio } })
    );

    // 3. Scroll al formulario de reserva
    const form = document.getElementById("calcular");
    if (form) {
      form.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // 4. Toast de confirmación (equivalente al toast del dashboard)
    setToast("✅ Servicio agregado · Por favor completa la reserva.");
    setTimeout(() => setToast(null), 4500);
  }

  return (
    <section className="limpieza-section" id="servicios-limpieza">
      <div className="container">

        {/* ── Toast de confirmación ── */}
        {toast && (
          <div className="limpieza-toast" role="status" aria-live="polite">
            {toast}
          </div>
        )}

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
          {SERVICIOS.map((s) => {
            const { nombre, detalle } = textos(s);
            return (
            <div
              key={s.id}
              className={`limpieza-card${s.popular ? " limpieza-card--popular" : ""}`}
            >
              {s.popular && (
                <div className="limpieza-badge">⭐ Más popular</div>
              )}

              <div className="limpieza-card-icon">{s.icon}</div>

              <h3 className="limpieza-card-nombre">{nombre}</h3>
              <p className="limpieza-card-lema">{s.lema}</p>
              <p className="limpieza-card-precio">{s.precio}</p>
              <p className="limpieza-card-detalle">{detalle}</p>

              <button
                type="button"
                onClick={() => solicitar(s.id, nombre, s.precio)}
                className={`limpieza-btn${s.popular ? " limpieza-btn--popular" : ""}`}
              >
                Solicitar
              </button>
            </div>
            );
          })}
        </div>

        {/* ── Nota informativa ── */}
        <p className="limpieza-nota">
          💡 El servicio de limpieza se añade a tu reserva de parking.
          Selecciónalo aquí y completa tu reserva en el formulario de arriba.
        </p>

      </div>
    </section>
  );
}
