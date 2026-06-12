"use client";

import { fmtCurrency, fmtDateTime, isToday, type ReservaAdmin } from "@/lib/admin";
import ReservaTable from "./ReservaTable";
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
            {r.vehicleType === "car" ? "🚗" : "🏍️"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {r.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{r.plate} · {r.terminal}</div>
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
  const monthIncome = reservas
    .filter((r) => {
      const d = new Date(r.checkOut || r.checkIn);
      return r.status !== "cancelled" && d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    })
    .reduce((s, r) => s + (Number(r.price) || 0), 0);

  const stats: { icon: string; color: string; val: string | number; label: string }[] = [
    { icon: "✈️", color: "#e0f0ff", val: entries.length, label: "Entradas hoy" },
    { icon: "🏁", color: "#fef3c7", val: exits.length, label: "Salidas hoy" },
    { icon: "🅿️", color: "#d1fae5", val: inside.length, label: "Reservas activas" },
    { icon: "⏳", color: "#fff7ed", val: upcoming.length, label: "Pendientes" },
    { icon: "💶", color: "#d1fae5", val: fmtCurrency(todayIncome), label: "Ingresos hoy" },
    { icon: "📈", color: "#e0f0ff", val: fmtCurrency(monthIncome), label: "Ingresos del mes" },
  ];

  const recent = [...reservas]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

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
      </div>

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
          <ReservaTable rows={recent} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}
