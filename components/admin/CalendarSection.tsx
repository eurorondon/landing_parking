"use client";

import { useEffect, useRef, useState } from "react";
import type { ReservaAdmin } from "@/lib/admin";
import { Badge } from "./ui";

interface Props {
  reservas: ReservaAdmin[];
  onDetail: (id: string) => void;
}

function dateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function CalendarSection({ reservas, onDetail }: Props) {
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const dayPanelRef = useRef<HTMLDivElement>(null);

  // En móvil, al tocar un día se hace scroll automático al panel de detalle
  useEffect(() => {
    if (selectedDay && window.innerWidth <= 768) {
      dayPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedDay]);

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevMonthLast = new Date(y, m, 0).getDate();
  const today = new Date();
  const dow = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const entriesOf = (ds: string) =>
    reservas.filter((r) => r.checkIn?.startsWith(ds) && r.status !== "cancelled");
  const exitsOf = (ds: string) =>
    reservas.filter((r) => r.checkOut?.startsWith(ds) && r.status !== "cancelled");
  const insideOf = (ds: string) =>
    reservas.filter((r) => r.status === "inside" && r.checkIn <= ds + "T23:59" && r.checkOut >= ds + "T00:00");

  function moveMonth(dir: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + dir, 1));
  }

  const total = firstDay + daysInMonth;
  const trailing = total % 7 === 0 ? 0 : 7 - (total % 7);

  const dayList = (rows: ReservaAdmin[], icon: string, label: string) =>
    rows.length === 0 ? null : (
      <div style={{ marginBottom: 14 }} key={label}>
        <div className="detail-section-title" style={{ marginBottom: 8 }}>{icon} {label}</div>
        {rows.map((r) => (
          <div
            key={r.id}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--gray-100)", cursor: "pointer" }}
            onClick={() => onDetail(r.id)}
          >
            <div style={{ fontSize: 15 }}>{r.vehicleType === "car" ? "🚗" : "🏍️"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{r.plate} · {r.terminal}</div>
            </div>
            <Badge status={r.status} />
          </div>
        ))}
      </div>
    );

  const selEntries = selectedDay ? entriesOf(selectedDay) : [];
  const selExits = selectedDay ? exitsOf(selectedDay) : [];
  const selInside = selectedDay ? insideOf(selectedDay) : [];
  const selEmpty = selEntries.length + selExits.length + selInside.length === 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Calendario</div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="cal-header">
            <div className="cal-nav">
              <button onClick={() => moveMonth(-1)} aria-label="Mes anterior">‹</button>
              <div className="cal-month">
                {cursor.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </div>
              <button onClick={() => moveMonth(1)} aria-label="Mes siguiente">›</button>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setCursor(new Date())}>Hoy</button>
          </div>

          <div className="cal-grid">
            {dow.map((d) => <div className="cal-dow" key={d}>{d}</div>)}

            {Array.from({ length: firstDay }, (_, i) => (
              <div className="cal-day other-month" key={`p${i}`}>
                <div className="cal-day-num">{prevMonthLast - firstDay + 1 + i}</div>
              </div>
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const ds = dateStr(y, m, d);
              const isT = y === today.getFullYear() && m === today.getMonth() && d === today.getDate();
              const entries = entriesOf(ds);
              const exits = exitsOf(ds);
              const inside = insideOf(ds);
              return (
                <div className={`cal-day${isT ? " today" : ""}`} key={ds} onClick={() => setSelectedDay(ds)}>
                  <div className="cal-day-num">{d}</div>
                  {entries.slice(0, 2).map((r) => (
                    <div className="cal-event entry" key={`e${r.id}`}>✈ {r.name.split(" ")[0]}</div>
                  ))}
                  {exits.slice(0, 1).map((r) => (
                    <div className="cal-event exit" key={`x${r.id}`}>🏁 {r.name.split(" ")[0]}</div>
                  ))}
                  {inside.length > 0 && <div className="cal-event inside">🅿 {inside.length}</div>}
                  {/* En móvil los eventos se sustituyen por puntos de color (CSS) */}
                  <div className="cal-dots">
                    {entries.length > 0 && <span className="cal-dot dot-entry" />}
                    {exits.length > 0 && <span className="cal-dot dot-exit" />}
                    {inside.length > 0 && <span className="cal-dot dot-inside" />}
                  </div>
                </div>
              );
            })}

            {Array.from({ length: trailing }, (_, i) => (
              <div className="cal-day other-month" key={`t${i}`}>
                <div className="cal-day-num">{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16, scrollMarginTop: 70 }} ref={dayPanelRef}>
        <div className="card-header">
          <div className="card-title">
            {selectedDay
              ? new Date(selectedDay + "T12:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
              : "Selecciona un día"}
          </div>
        </div>
        <div className="card-body">
          {!selectedDay && (
            <p style={{ color: "var(--gray-400)", fontSize: 13.5 }}>Haz clic en un día para ver las reservas.</p>
          )}
          {selectedDay && selEmpty && (
            <p style={{ color: "var(--gray-400)", fontSize: 13.5 }}>Sin reservas este día.</p>
          )}
          {selectedDay && !selEmpty && (
            <>
              {dayList(selEntries, "✈️", "Entradas")}
              {dayList(selExits, "🏁", "Salidas")}
              {dayList(selInside, "🅿️", "Dentro")}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
