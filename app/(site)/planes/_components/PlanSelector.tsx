"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatoEuros } from "@/lib/pricing";

interface Servicio {
  id: number;
  nombre_servicio: string;
  costo: number;
}

interface PlanDef {
  id: string;
  planId: number;
  nombre: string;
  subtitulo: string;
  features: string[];
  /** ID del servicio de lavado (undefined = sin lavado) */
  limpiezaId?: number;
  badge?: string;
  destacado?: boolean;
}

const PLANES: PlanDef[] = [
  {
    id: "standard",
    planId: 1,
    nombre: "Estándar",
    subtitulo: "Cómodo y seguro",
    features: [
      "Plaza reservada",
      "Conductor te recoge y entrega",
      "Vigilancia 24 h",
      "Seguro de vehículo incluido",
    ],
  },
  {
    id: "premium",
    planId: 2,
    nombre: "Premium",
    subtitulo: "Con lavado exterior",
    features: [
      "Plaza reservada",
      "Conductor te recoge y entrega",
      "✨ Lavado exterior incluido",
      "Vigilancia 24 h",
      "Seguro de vehículo incluido",
    ],
    limpiezaId: 1,
  },
  {
    id: "priority",
    planId: 3,
    nombre: "Priority",
    subtitulo: "Servicio VIP completo",
    features: [
      "Plaza reservada",
      "Conductor te recoge y entrega",
      "✨ Lavado interior y exterior",
      "Guardia de llaves",
      "Vigilancia 24 h",
      "Seguro de vehículo incluido",
    ],
    limpiezaId: 2,
    badge: "⭐ Más Popular",
    destacado: true,
  },
];

export default function PlanSelector() {
  const router = useRouter();
  const sp = useSearchParams();

  const entryDate       = sp.get("entryDate")       ?? "";
  const entryTime       = sp.get("entryTime")       ?? "";
  const exitDate        = sp.get("exitDate")        ?? "";
  const exitTime        = sp.get("exitTime")        ?? "";
  const terminalEntrada = sp.get("terminalEntrada") ?? "T1";
  const terminalSalida  = sp.get("terminalSalida")  ?? "T1";
  const vehiculo        = sp.get("vehiculo")        ?? "car";
  const dias            = parseInt(sp.get("dias")  ?? "0", 10);
  const nocturno        = sp.get("nocturno") === "1";
  const baseTotal       = parseFloat(sp.get("baseTotal") ?? "0");
  // Servicio de lavado elegido desde la sección de servicios
  const lavadoId        = parseInt(sp.get("lavadoId") ?? "0", 10);
  const lavadoNombre    = sp.get("lavadoNombre") ?? "";

  const [servicios, setServicios]   = useState<Servicio[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [seleccionando, setSeleccionando] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/servicios")
      .then((r) => r.json())
      .then((d) => setServicios(d.servicios ?? []))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  /**
   * Calcula el precio final del plan:
   * - Si el plan ya incluye limpieza → suma solo el costo del plan (sin extra)
   * - Si el plan NO incluye limpieza y el usuario eligió un lavado extra
   *   en ServiciosLimpieza → suma ese lavado como servicio adicional
   */
  function getPrecio(plan: PlanDef): number {
    const base = baseTotal;

    if (plan.limpiezaId) {
      // El plan ya incluye limpieza — no se añade el lavado extra para evitar
      // cobrar dos veces el mismo servicio
      const svc = servicios.find((s) => s.id === plan.limpiezaId);
      return base + Number(svc?.costo ?? 0);
    }

    if (lavadoId > 0) {
      // El plan no tiene limpieza → se añade el lavado elegido en ServiciosLimpieza
      const extraSvc = servicios.find((s) => s.id === lavadoId);
      return base + Number(extraSvc?.costo ?? 0);
    }

    return base;
  }

  function seleccionar(plan: PlanDef) {
    if (seleccionando) return;
    setSeleccionando(plan.id);
    const precio = getPrecio(plan);

    // El lavado extra solo se propaga al resumen si el plan no lo incluye ya.
    // Si el plan ya incluye limpieza, mostrar el lavado extra causaría confusión
    // (el usuario vería el servicio dos veces en el resumen).
    const lavadoEsExtra = lavadoId > 0 && !plan.limpiezaId;

    const params = new URLSearchParams({
      entryDate, entryTime, exitDate, exitTime,
      terminalEntrada, terminalSalida, vehiculo,
      dias:       String(dias),
      nocturno:   nocturno ? "1" : "0",
      plan:       String(plan.planId),
      planNombre: plan.nombre,
      total:      String(precio),
      ...(plan.limpiezaId ? { limpiezaId: String(plan.limpiezaId) } : {}),
      ...(lavadoEsExtra   ? { lavadoId: String(lavadoId), lavadoNombre } : {}),
    });
    router.push(`/reservar?${params.toString()}`);
  }

  const fmtFecha = (d: string) =>
    d ? new Date(d + "T00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "";

  return (
    <div className="planes-page">
      {/* ── Cabecera ── */}
      <div className="planes-header">
        <button className="planes-back" onClick={() => router.back()} type="button">
          ← Cambiar fechas
        </button>

        <h1 className="planes-titulo">Elige tu plan de parking</h1>
        <p className="planes-subtitulo">Aeropuerto de Madrid · Barajas</p>

        {/* Resumen de fechas */}
        <div className="planes-fechas">
          <span className="planes-fecha-chip">📅 Entrada: <strong>{fmtFecha(entryDate)} · {entryTime}</strong></span>
          <span className="planes-fecha-chip">📅 Salida: <strong>{fmtFecha(exitDate)} · {exitTime}</strong></span>
          {dias > 0 && (
            <span className="planes-fecha-chip planes-fecha-chip--days">
              🅿️ {dias} {dias === 1 ? "día" : "días"}
            </span>
          )}
        </div>

        {/* Aviso del lavado seleccionado previamente */}
        {lavadoId > 0 && lavadoNombre && (
          <div className="planes-lavado-aviso">
            🧹 Has seleccionado <strong>{lavadoNombre}</strong> — elige un plan para incluirlo en tu reserva.
          </div>
        )}

        {nocturno && (
          <p className="planes-nocturno-aviso">
            🌙 Se aplica recargo nocturno por horario entre las 00:30 y las 03:30
          </p>
        )}
      </div>

      {/* ── Cards de planes ── */}
      {cargando ? (
        <div className="planes-loading">Cargando planes…</div>
      ) : (
        <div className="planes-grid">
          {PLANES.map((plan) => {
            const precio = getPrecio(plan);
            const activo = seleccionando === plan.id;
            const apagado = seleccionando !== null && !activo;
            // El plan ya incluye el lavado elegido (igual o mejor)
            const incluyeLavado = lavadoId > 0 && !!plan.limpiezaId;
            // El plan no tiene limpieza pero el usuario eligió un lavado extra
            const tieneExtra    = lavadoId > 0 && !plan.limpiezaId;

            return (
              <div
                key={plan.id}
                className={[
                  "plan-card",
                  plan.destacado ? "plan-card--destacado" : "",
                  apagado ? "plan-card--apagado" : "",
                  incluyeLavado ? "plan-card--lavado" : "",
                ].join(" ")}
              >
                {incluyeLavado && (
                  <span className="plan-badge plan-badge--lavado">🧹 Limpieza incluida</span>
                )}
                {!incluyeLavado && plan.badge && (
                  <span className="plan-badge">{plan.badge}</span>
                )}

                <h2 className="plan-nombre">{plan.nombre}</h2>
                <p className="plan-subtitulo">{plan.subtitulo}</p>

                <div className="plan-precio">
                  <span className="plan-precio-num">{formatoEuros(precio)}</span>
                  <span className="plan-precio-label">/ estancia</span>
                </div>

                <ul className="plan-features">
                  {plan.features.map((f) => (
                    <li key={f}><span className="plan-check">✓</span>{f}</li>
                  ))}
                  {/* Muestra el lavado extra solo en el plan sin limpieza */}
                  {tieneExtra && (
                    <li className="plan-feature--extra">
                      <span className="plan-check">✓</span>🧹 {lavadoNombre} (añadido)
                    </li>
                  )}
                </ul>

                <button
                  className={["plan-btn", plan.destacado ? "plan-btn--destacado" : ""].join(" ")}
                  onClick={() => seleccionar(plan)}
                  disabled={seleccionando !== null}
                  type="button"
                >
                  {activo ? "Cargando…" : `Seleccionar ${plan.nombre}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
