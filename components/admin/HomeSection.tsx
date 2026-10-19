"use client";

import { useState } from "react";
import { fmtCurrency, fmtDateTime, isToday, partesMadrid, type ReservaAdmin } from "@/lib/admin";
import Pagination from "./Pagination";
import ReservaTable from "./ReservaTable";
import ReservasDiariasChart from "./ReservasDiariasChart";
import { Badge, EmptyState } from "./ui";

interface Props {
  reservas: ReservaAdmin[];
  onDetail: (id: string) => void;
  onEdit: (r: ReservaAdmin) => void;
  onDelete: (id: string) => void;
  goReservations: () => void;
}

function MiniList({ rows, emptyMsg, onDetail }: { rows: ReservaAdmin[]; emptyMsg: string; onDetail: (id: string) => void }) {
  if (rows.length === 0) return <EmptyState icon="✅" text={emptyMsg} />;
  return (
    <>
      {rows.slice(0, 5).map((r) => (
        <div
          key={r.id}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--gray-100)", cursor: "pointer" }}
          onClick={() => onDetail(r.id)}
        >
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--teal-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
            {r.vehicleType === "car" ? "🚗" : "🚐"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {r.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{r.plate} · {r.terminalEntrada}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <Badge status={r.status} />
            <div style={{ fontSize: 11.5, color: "var(--gray-400)", marginTop: 3 }}>{fmtDateTime(r.checkIn)}</div>
          </div>
        </div>
      ))}
    </>
  );
}

export default function HomeSection({ reservas, onDetail, onEdit, onDelete, goReservations }: Props) {
  const today = new Date();
  const entries = reservas.filter((r) => isToday(r.checkIn) && r.status !== "cancelled" && r.status !== "finished");
  const exits = reservas.filter((r) => isToday(r.checkOut) && r.status !== "cancelled" && r.status !== "finished");
  const inside = reservas.filter((r) => r.status === "inside");
  const upcoming = reservas.filter((r) => r.status === "confirmed");

  const todayIncome = reservas
    .filter((r) => r.status === "finished" && isToday(r.checkOut))
    .reduce((s, r) => s + (Number(r.price) || 0), 0);
  // Ingresos por mes elegible (por defecto el actual), según la fecha de CREACIÓN
  // de la reserva (para cruzarlo con la inversión en publicidad del mismo mes).
  // Las canceladas no cuentan.
  // created_at viene en UTC: el mes se calcula en hora de Madrid (no la del navegador)
  // para no desplazar reservas hechas cerca de medianoche al mes anterior.
  const mesKey = (iso: string) => {
    const t = partesMadrid(iso);
    return t ? `${t.y}-${t.m}` : "";
  };
  const mesActual = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [mes, setMes] = useState(mesActual);
  const ingresosPorMes = new Map<string, { total: number; n: number }>();
  for (const r of reservas) {
    if (r.status === "cancelled") continue;
    const k = mesKey(r.createdAt);
    const e = ingresosPorMes.get(k) ?? { total: 0, n: 0 };
    e.total += Number(r.price) || 0;
    e.n++;
    ingresosPorMes.set(k, e);
  }
  ingresosPorMes.set(mesActual, ingresosPorMes.get(mesActual) ?? { total: 0, n: 0 });
  const meses = [...ingresosPorMes.keys()].sort().reverse();
  const nombreMes = (k: string) => {
    const [y, m] = k.split("-").map(Number);
    const n = new Date(y, m - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    return n.charAt(0).toUpperCase() + n.slice(1);
  };
  const sel = ingresosPorMes.get(mes) ?? { total: 0, n: 0 };
  const [verMes, setVerMes] = useState(false);
  const [pgMes, setPgMes] = useState(0);
  const [ppMes, setPpMes] = useState(10);
  const [pgRecent, setPgRecent] = useState(0);
  const [ppRecent, setPpRecent] = useState(10);
  const delMes = verMes
    ? reservas
        .filter((r) => r.status !== "cancelled" && mesKey(r.createdAt) === mes)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    : [];
  const pagesMes = Math.max(1, Math.ceil(delMes.length / ppMes));
  const pageMes = Math.min(pgMes, pagesMes - 1);
  const delMesPag = delMes.slice(pageMes * ppMes, (pageMes + 1) * ppMes);

  const stats: { icon: string; color: string; val: string | number; label: string }[] = [
    { icon: "✈️", color: "#e0f0ff", val: entries.length, label: "Entradas hoy" },
    { icon: "🏁", color: "#fef3c7", val: exits.length, label: "Salidas hoy" },
    { icon: "🅿️", color: "#d1fae5", val: inside.length, label: "Reservas activas" },
    { icon: "⏳", color: "#fff7ed", val: upcoming.length, label: "Pendientes" },
    { icon: "💶", color: "#d1fae5", val: fmtCurrency(todayIncome), label: "Ingresos hoy" },
  ];

  const recent = [...reservas]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const pagesRecent = Math.max(1, Math.ceil(recent.length / ppRecent));
  const pageRecent = Math.min(pgRecent, pagesRecent - 1);
  const recentPag = recent.slice(pageRecent * ppRecent, (pageRecent + 1) * ppRecent);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Buenos días 👋</div>
          <div className="page-sub">
            {today.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-card-value">{s.val}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "#e0f0ff" }}>📈</div>
          <div className="stat-card-value">{fmtCurrency(sel.total)}</div>
          <div className="stat-card-label">
            Ingresos por reservas creadas · {sel.n} {sel.n === 1 ? "reserva" : "reservas"}
          </div>
          <select
            value={mes}
            onChange={(e) => { setMes(e.target.value); setPgMes(0); }}
            aria-label="Mes de los ingresos"
            style={{ marginTop: 8, width: "100%", fontSize: 12.5, padding: "5px 8px", borderRadius: 8, border: "1px solid var(--gray-200)", background: "var(--white)", color: "var(--gray-900)" }}
          >
            {meses.map((k) => (
              <option key={k} value={k}>{nombreMes(k)}{k === mesActual ? " (actual)" : ""}</option>
            ))}
          </select>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 6, width: "100%" }}
            onClick={() => { setVerMes((v) => !v); setPgMes(0); }}
          >
            {verMes ? "Ocultar detalle" : "Ver reservas del mes"}
          </button>
        </div>
      </div>

      {verMes && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">🧾 Reservas creadas en {nombreMes(mes)}</div>
            <span className="badge badge-confirmed">{delMes.length} · {fmtCurrency(sel.total)}</span>
          </div>
          <div className="table-wrap">
            {delMes.length === 0 ? (
              <EmptyState icon="📭" text="Sin reservas en este mes" />
            ) : (
              <ReservaTable rows={delMesPag} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} />
            )}
          </div>
          <div style={{ padding: "0 20px 16px" }}>
            <Pagination
              total={delMes.length} page={pageMes} perPage={ppMes}
              onPage={setPgMes} onPerPage={(n) => { setPpMes(n); setPgMes(0); }}
            />
          </div>
        </div>
      )}

      <ReservasDiariasChart reservas={reservas} />

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">✈️ Entradas de hoy</div>
            <span className="badge badge-confirmed">{entries.length}</span>
          </div>
          <div className="card-body" style={{ paddingTop: 12 }}>
            <MiniList rows={entries} emptyMsg="Sin entradas hoy" onDetail={onDetail} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏁 Salidas de hoy</div>
            <span className="badge badge-pending">{exits.length}</span>
          </div>
          <div className="card-body" style={{ paddingTop: 12 }}>
            <MiniList rows={exits} emptyMsg="Sin salidas hoy" onDetail={onDetail} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Últimas reservas</div>
          <button className="btn btn-ghost btn-sm" onClick={goReservations}>Ver todas →</button>
        </div>
        <div className="table-wrap">
          <ReservaTable rows={recentPag} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} />
        </div>
        <div style={{ padding: "0 20px 16px" }}>
          <Pagination
            total={recent.length} page={pageRecent} perPage={ppRecent}
            onPage={setPgRecent} onPerPage={(n) => { setPpRecent(n); setPgRecent(0); }}
          />
        </div>
      </div>
    </div>
  );
}
