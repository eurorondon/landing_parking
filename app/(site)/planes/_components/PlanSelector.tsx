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

  function getPrecio(plan: PlanDef): number {
    const base = baseTotal;
    if (plan.limpiezaId) {
      const svc = servicios.find((s) => s.id === plan.limpiezaId);
      return base + Number(svc?.costo ?? 0);
    }
    return base;
  }

  function seleccionar(plan: PlanDef) {
    if (seleccionando) return;
    setSeleccionando(plan.id);
    const precio = getPrecio(plan);
    const params = new URLSearchParams({
      entryDate, entryTime, exitDate, exitTime,
      terminalEntrada, terminalSalida, vehiculo,
      dias:       String(dias),
      nocturno:   nocturno ? "1" : "0",
      plan:       String(plan.planId),
      planNombre: plan.nombre,
      total:      String(precio),
      ...(plan.limpiezaId ? { limpiezaId: String(plan.limpiezaId) } : {}),
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

            return (
              <div
                key={plan.id}
                className={[
                  "plan-card",
                  plan.destacado ? "plan-card--destacado" : "",
                  apagado ? "plan-card--apagado" : "",
                ].join(" ")}
              >
                {plan.badge && (
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
