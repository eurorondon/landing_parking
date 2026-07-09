"use client";

import { STATUS_LABEL, fmtCurrency, type ReservaAdmin, type ReservaStatus } from "@/lib/admin";

function Bar({ label, value, pct, fill }: { label: string; value: string; pct: number; fill?: string }) {
  return (
    <div className="report-bar-wrap">
      <div className="report-bar-label">
        <span>{label}</span>
        <span style={{ fontWeight: 500 }}>{value}</span>
      </div>
      <div className="report-bar-track">
        <div className={`report-bar-fill${fill ? ` ${fill}` : ""}`} style={{ width: `${pct.toFixed(1)}%` }} />
      </div>
    </div>
  );
}

export default function ReportsSection({ reservas }: { reservas: ReservaAdmin[] }) {
  const today = new Date();

  const activas = reservas.filter((r) => r.status !== "cancelled");
  const totalIncome = activas.reduce((s, r) => s + (Number(r.price) || 0), 0);
  const monthIncome = activas
    .filter((r) => {
      const d = new Date(r.checkIn || r.createdAt);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    })
    .reduce((s, r) => s + (Number(r.price) || 0), 0);

  const termCount: Record<string, number> = { T1: 0, T2: 0, T3: 0, T4: 0 };
  reservas.forEach((r) => { if (termCount[r.terminal] !== undefined) termCount[r.terminal]++; });
  const maxTerm = Math.max(...Object.values(termCount)) || 1;

  const statCount: Record<ReservaStatus, number> = { confirmed: 0, inside: 0, finished: 0, cancelled: 0 };
  reservas.forEach((r) => { if (statCount[r.status] !== undefined) statCount[r.status]++; });
  const maxStat = Math.max(...Object.values(statCount)) || 1;

  const cars = reservas.filter((r) => r.vehicleType === "car").length;
  const autocaravanas = reservas.filter((r) => r.vehicleType === "autocaravana").length;
  const totalVeh = cars + autocaravanas || 1;

  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6 + i);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const income = reservas
      .filter((r) => r.checkIn?.startsWith(ds) && r.status !== "cancelled")
      .reduce((s, r) => s + (Number(r.price) || 0), 0);
    return { label: d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }), income };
  });
  const maxDay = Math.max(...days7.map((d) => d.income)) || 1;

  const stats = [
    { icon: "💶", color: "#d1fae5", val: fmtCurrency(totalIncome), label: "Ingresos totales" },
    { icon: "📅", color: "#e0f0ff", val: fmtCurrency(monthIncome), label: "Ingresos este mes" },
    { icon: "📋", color: "#ede9fe", val: reservas.length, label: "Total reservas" },
    { icon: "🚗", color: "#fef3c7", val: cars, label: "Reservas coche" },
    { icon: "🚐", color: "#fff7ed", val: autocaravanas, label: "Reservas autocaravana" },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Reportes</div>
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
          <div className="card-header"><div className="card-title">📈 Ingresos últimos 7 días</div></div>
          <div className="card-body">
            {days7.map((d) => (
              <Bar key={d.label} label={d.label} value={fmtCurrency(d.income)} pct={(d.income / maxDay) * 100} />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">🅿️ Uso por terminal</div></div>
          <div className="card-body">
            {Object.entries(termCount).map(([t, n]) => (
              <Bar key={t} label={t} value={`${n} reservas`} pct={(n / maxTerm) * 100} fill="amber" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">📊 Estado de reservas</div></div>
          <div className="card-body">
            {(Object.entries(statCount) as [ReservaStatus, number][]).map(([st, n]) => (
              <Bar key={st} label={STATUS_LABEL[st]} value={String(n)} pct={(n / maxStat) * 100} fill="green" />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">🚗 Distribución por vehículo</div></div>
          <div className="card-body" style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: 30, paddingBottom: 30 }}>
            <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36 }}>🚗</div>
                <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 28, fontWeight: 600, color: "var(--teal-600)" }}>{cars}</div>
                <div style={{ fontSize: 12, color: "var(--gray-400)" }}>Coches ({((cars / totalVeh) * 100).toFixed(0)}%)</div>
              </div>
              <div style={{ width: 1, height: 60, background: "var(--gray-200)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36 }}>🚐</div>
                <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 28, fontWeight: 600, color: "var(--amber)" }}>{autocaravanas}</div>
                <div style={{ fontSize: 12, color: "var(--gray-400)" }}>Autocaravanas ({((autocaravanas / totalVeh) * 100).toFixed(0)}%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
