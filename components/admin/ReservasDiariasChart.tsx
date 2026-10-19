"use client";

import { useMemo, useState } from "react";
import { partesMadrid, type ReservaAdmin } from "@/lib/admin";

const RANGOS = [30, 60, 90] as const;
const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, "0");
const key = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Gráfico de barras: reservas que entran por día (según fecha de creación). Sin librerías. */
export default function ReservasDiariasChart({ reservas }: { reservas: ReservaAdmin[] }) {
  const [rango, setRango] = useState<number>(30);
  const [hover, setHover] = useState<number | null>(null);

  const { dias, max, total } = useMemo(() => {
    // "Hoy" y el día de cada reserva se calculan en hora de Madrid (no la del navegador)
    const hm = partesMadrid(new Date().toISOString())!;
    const hoy = new Date(Number(hm.y), Number(hm.m) - 1, Number(hm.d), 12, 0, 0, 0);
    const dias: { k: string; label: string; full: string; n: number }[] = [];
    for (let i = rango; i >= 0; i--) {
      const d = new Date(hoy.getTime() - i * DAY_MS);
      dias.push({
        k: key(d),
        label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
        full: d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        n: 0,
      });
    }
    const idx = new Map(dias.map((d, i) => [d.k, i]));
    for (const r of reservas) {
      if (r.status === "cancelled" || !r.createdAt) continue;
      const t = partesMadrid(r.createdAt);
      if (!t) continue;
      const i = idx.get(`${t.y}-${t.m}-${t.d}`);
      if (i !== undefined) dias[i].n++;
    }
    const total = dias.reduce((s, d) => s + d.n, 0);
    return { dias, max: Math.max(1, ...dias.map((d) => d.n)), total };
  }, [reservas, rango]);

  const W = 700, H = 240, L = 30, R = 8, T = 12, B = 26;
  const iw = W - L - R, ih = H - T - B;
  const slot = iw / dias.length;
  const bw = Math.max(2, slot * 0.7);
  const ticks = Array.from(new Set([0, Math.ceil(max / 2), max]));
  const everyLabel = Math.ceil(dias.length / 8);
  const h = hover !== null ? dias[hover] : null;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header" style={{ flexWrap: "wrap", gap: 8 }}>
        <div className="card-title">📊 Nuevas reservas por día</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {RANGOS.map((r) => (
            <button
              key={r}
              className={`btn btn-sm ${rango === r ? "btn-primary" : "btn-ghost"}`}
              onClick={() => { setRango(r); setHover(null); }}
            >
              {r} días
            </button>
          ))}
        </div>
      </div>
      <div className="card-body" style={{ paddingTop: 8 }}>
        <div style={{ fontSize: 12.5, color: "var(--gray-400)", marginBottom: 6, minHeight: 18 }}>
          {total} reservas en los últimos {rango} días
        </div>
        <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Nuevas reservas por día">
          {ticks.map((t) => {
            const y = T + ih - (t / max) * ih;
            return (
              <g key={t}>
                <line x1={L} x2={W - R} y1={y} y2={y} stroke="var(--gray-100)" strokeDasharray="3 3" />
                <text x={L - 6} y={y + 3} fontSize="10" textAnchor="end" fill="var(--gray-400)">{t}</text>
              </g>
            );
          })}
          {dias.map((d, i) => {
            const bh = (d.n / max) * ih;
            const x = L + i * slot + (slot - bw) / 2;
            return (
              <g key={d.k} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(i)}>
                <rect x={L + i * slot} y={T} width={slot} height={ih} fill={hover === i ? "var(--gray-100)" : "transparent"} />
                <rect x={x} y={T + ih - bh} width={bw} height={bh} rx={2} fill={hover === i ? "var(--teal-400)" : "var(--teal-500)"} />
                {i % everyLabel === 0 && (
                  <text x={L + i * slot + slot / 2} y={H - 8} fontSize="10" textAnchor="middle" fill="var(--gray-400)">{d.label}</text>
                )}
              </g>
            );
          })}
        </svg>
        {h && hover !== null && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `${((L + hover * slot + slot / 2) / W) * 100}%`,
              transform: `translateX(${hover > dias.length * 0.7 ? "-105%" : hover < dias.length * 0.3 ? "5%" : "-50%"})`,
              pointerEvents: "none",
              background: "var(--gray-900)",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 12,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,.2)",
              zIndex: 2,
            }}
          >
            <div style={{ textTransform: "capitalize" }}>{h.full}</div>
            <div><b>{h.n}</b> {h.n === 1 ? "reserva" : "reservas"}</div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
