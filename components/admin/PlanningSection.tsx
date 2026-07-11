"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ReservaPDF } from "./pdf/tipos";

// BotonesTickets usa @react-pdf/renderer — solo en cliente
const BotonesTickets = dynamic(() => import("./BotonesTickets"), { ssr: false });

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** "DD/MM/YYYY" para mostrar; la fecha ya viene formateada desde la API */
function fmtEuros(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

/** "YYYY-MM-DD" de hoy en hora local */
function hoyStr() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Añade/resta días a "YYYY-MM-DD" */
function addDias(fecha: string, n: number): string {
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() + n);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** "YYYY-MM-DD" → "DD/MM/YYYY" para mostrar */
function fmtFecha(s: string) {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}


/* ── Componente PlanningSection ─────────────────────────────────────────── */

export default function PlanningSection() {
  const [fecha,    setFecha]    = useState(hoyStr);
  const [cargando, setCargando] = useState(false);
  const [entradas, setEntradas] = useState<ReservaPDF[]>([]);
  const [salidas,  setSalidas]  = useState<ReservaPDF[]>([]);
  const [error,    setError]    = useState<string | null>(null);

  const cargar = useCallback(async (f: string) => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/planning?fecha=${f}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Error al cargar");
      setEntradas(data.entradas ?? []);
      setSalidas(data.salidas ?? []);
    } catch (e) {
      setError((e as Error).message);
      setEntradas([]);
      setSalidas([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(fecha); }, [fecha, cargar]);

  const hoy = hoyStr();

  return (
    <div className="planning-wrap">

      {/* ── Cabecera ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">Planning diario</div>
          <div className="page-desc">
            Entradas y salidas · {fmtFecha(fecha)}
          </div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => cargar(fecha)}
          disabled={cargando}
        >
          {cargando ? "⏳" : "🔄"} Actualizar
        </button>
      </div>

      {/* ── Barra de fecha ── */}
      <div className="planning-datebar">
        <button
          className={`btn btn-sm${fecha === addDias(hoy, -1) ? " btn-teal" : " btn-outline"}`}
          onClick={() => setFecha(addDias(hoy, -1))}
        >Ayer</button>
        <button
          className={`btn btn-sm${fecha === hoy ? " btn-teal" : " btn-outline"}`}
          onClick={() => setFecha(hoy)}
        >Hoy</button>
        <button
          className={`btn btn-sm${fecha === addDias(hoy, 1) ? " btn-teal" : " btn-outline"}`}
          onClick={() => setFecha(addDias(hoy, 1))}
        >Mañana</button>
        <input
          type="date"
          className="planning-date-input"
          value={fecha}
          onChange={(e) => e.target.value && setFecha(e.target.value)}
        />
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Tabla ENTRADAS ── */}
      <PlanningTable
        titulo="🛫 Entradas"
        tipo="entrada"
        filas={entradas}
        cargando={cargando}
      />

      {/* ── Tabla SALIDAS ── */}
      <PlanningTable
        titulo="🛬 Salidas"
        tipo="salida"
        filas={salidas}
        cargando={cargando}
      />

    </div>
  );
}

/* ── Sub-componente: tabla de reservas ─────────────────────────────────── */

interface PlanningTableProps {
  titulo:    string;
  tipo:      "entrada" | "salida";
  filas:     ReservaPDF[];
  cargando:  boolean;
}

function PlanningTable({ titulo, tipo, filas, cargando }: PlanningTableProps) {
  return (
    <div className="planning-table-block">

      {/* ── Header: título + badges + botones de cola ── */}
      <div className="planning-table-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="planning-table-title">{titulo}</span>
          <span className="planning-badge">{filas.length} reservas</span>
        </div>
        {/* Botones para imprimir TODOS en cola (PDF) */}
        <BotonesTickets
          reservas={filas}
          titulo={tipo === "entrada" ? "Entradas" : "Salidas"}
        />
      </div>

      {/* ── Contenido: cargando / vacío / tabla ── */}
      {cargando ? (
        <div className="empty-state" style={{ padding: "32px 0" }}>
          <div className="empty-state-icon">⏳</div>
          <p>Cargando…</p>
        </div>
      ) : filas.length === 0 ? (
        <div className="empty-state" style={{ padding: "32px 0" }}>
          <div className="empty-state-icon">📭</div>
          <p>No hay {tipo === "entrada" ? "entradas" : "salidas"} para este día.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Nº Reserva</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Matrícula</th>
                <th>Vehículo</th>
                <th>{tipo === "entrada" ? "T. Entrada" : "T. Salida"}</th>
                <th>Plan</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((r) => (
                <tr key={r.id}>
                  <td className="planning-hora">
                    <strong>{tipo === "entrada" ? r.hora_entrada : r.hora_salida}</strong>
                  </td>
                  <td>
                    <span className="reservation-id">#{r.nro_reserva}</span>
                  </td>
                  <td>{r.nombre}</td>
                  <td>{r.movil}</td>
                  <td>
                    <span className="planning-matricula">{r.matricula.toUpperCase()}</span>
                  </td>
                  <td className="text-muted">
                    {r.marcaModelo || "—"}
                  </td>
                  <td>
                    <span className="terminal-badge">
                      {tipo === "entrada" ? r.terminal_entrada : r.terminal_salida}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge${r.plan === 3 ? " status-inside" : r.plan === 2 ? " status-confirmed" : ""}`}>
                      {r.plan_nombre}
                    </span>
                  </td>
                  <td>
                    <strong>{fmtEuros(r.monto_total)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
