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

/* ── Impresión individual de ticket (ventana popup) ─────────────────────── */

function imprimirTicketIndividual(r: ReservaPDF) {
  const html = `<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><title>Ticket #${r.nro_reserva}</title>
<style>
  @page{size:80mm auto;margin:4mm;}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Courier New',monospace;font-size:12px;color:#000;background:#fff;width:72mm;padding:2mm;}
  .t{text-align:center;font-weight:bold;} .s{font-size:9px;text-align:center;}
  hr{border:none;border-top:1px dashed #000;margin:5px 0;}
  .r{display:flex;justify-content:space-between;margin:3px 0;}
  .l{color:#555;font-size:10px;} .v{font-weight:bold;font-size:11px;text-align:right;}
  .mat{text-align:center;font-size:28px;font-weight:bold;letter-spacing:2px;font-family:Arial,sans-serif;}
  .total{display:flex;justify-content:space-between;font-size:14px;font-weight:bold;border-top:1px solid #000;padding-top:4px;margin-top:4px;}
  .ft{text-align:center;font-size:8px;color:#888;margin-top:8px;line-height:1.4;}
</style></head><body>
  <div class="t">🅿 Parking Aero Madrid</div>
  <div class="s">Aeropuerto Madrid-Barajas T1-T2-T3-T4</div>
  <hr>
  <div class="s">Reserva Nº ${r.nro_reserva}</div>
  <div class="mat">${r.matricula.toUpperCase()}</div>
  <div class="t" style="font-size:10px;background:#000;color:#fff;padding:2px;">Plan ${r.plan_nombre.toUpperCase()}</div>
  <hr>
  <div class="r"><span class="l">Cliente</span><span class="v">${r.nombre}</span></div>
  <div class="r"><span class="l">Teléfono</span><span class="v">${r.movil}</span></div>
  <div class="r"><span class="l">Vehículo</span><span class="v">${r.marcaModelo}</span></div>
  <hr>
  <div class="s" style="font-weight:bold;">ENTRADA</div>
  <div class="r"><span class="l">Fecha</span><span class="v">${r.fecha_entrada}</span></div>
  <div class="r"><span class="l">Hora</span><span class="v">${r.hora_entrada}</span></div>
  <div class="r"><span class="l">Terminal</span><span class="v">${r.terminal_entrada}</span></div>
  <div class="s" style="font-weight:bold;margin-top:4px;">SALIDA</div>
  <div class="r"><span class="l">Fecha</span><span class="v">${r.fecha_salida}</span></div>
  <div class="r"><span class="l">Hora</span><span class="v">${r.hora_salida}</span></div>
  <div class="r"><span class="l">Terminal</span><span class="v">${r.terminal_salida}</span></div>
  <hr>
  <div class="total"><span>TOTAL</span><span>${fmtEuros(r.monto_total)}</span></div>
  <hr>
  <div class="ft">parkingaeromadrid.es · Tel: 622 14 50 87<br>Sin pago anticipado</div>
</body></html>`;

  const win = window.open("", "_blank", "width=380,height=680");
  if (!win) { alert("Activa ventanas emergentes para imprimir."); return; }
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 300);
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
          <div className="page-title">Planificación diaria</div>
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
        onImprimir={imprimirTicketIndividual}
      />

      {/* ── Tabla SALIDAS ── */}
      <PlanningTable
        titulo="🛬 Salidas"
        tipo="salida"
        filas={salidas}
        cargando={cargando}
        onImprimir={imprimirTicketIndividual}
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
  onImprimir: (r: ReservaPDF) => void;
}

function PlanningTable({ titulo, tipo, filas, cargando, onImprimir }: PlanningTableProps) {
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
                <th style={{ width: 90 }}>Ticket</th>
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
                  <td>
                    <button
                      className="btn btn-outline btn-xs"
                      onClick={() => onImprimir(r)}
                      title="Imprimir ticket individual"
                    >
                      🖨️
                    </button>
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
