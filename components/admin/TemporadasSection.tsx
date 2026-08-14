"use client";

import { useCallback, useEffect, useState } from "react";
import { fmtCurrency } from "@/lib/admin";
import { EmptyState } from "./ui";

/**
 * Gestión de temporadas de precio (recargo o descuento por día durante un
 * rango de fechas, p. ej. verano). CRUD contra /api/admin/temporadas.
 *
 * Solo se aplica a reservas cuya fecha de ENTRADA cae dentro del rango: una
 * reserva de agosto nunca paga el precio de una temporada de septiembre,
 * aunque esté marcada "Activa" (lib/precio-db.ts → calcularPrecioReserva).
 */

interface Temporada {
  id:           number;
  fecha_inicio: string;
  fecha_fin:    string;
  precio:       number;
  descripcion:  string | null;
  status:       string;
}

interface FormState {
  fechaInicio: string;
  fechaFin:    string;
  precio:      string;
  descripcion: string;
}

const FORM_VACIO: FormState = { fechaInicio: "", fechaFin: "", precio: "", descripcion: "" };

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

/** Estado efectivo de la temporada para el chip de la tabla */
function estadoTemporada(t: Temporada): { label: string; clase: string } {
  if (t.status !== "activo") return { label: "Inactiva", clase: "badge-finished" };
  const hoy = new Date().toISOString().slice(0, 10);
  if (hoy > t.fecha_fin.slice(0, 10))    return { label: "Pasada",     clase: "badge-cancelled" };
  if (hoy < t.fecha_inicio.slice(0, 10)) return { label: "Programada", clase: "badge-confirmed" };
  return { label: "En curso", clase: "badge-inside" };
}

export default function TemporadasSection({ toast }: { toast: (msg: string, type?: "success" | "error") => void }) {
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [formAbierto, setFormAbierto] = useState(false);
  const [form, setForm]             = useState<FormState>(FORM_VACIO);
  const [guardando, setGuardando]   = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/temporadas");
      if (!res.ok) throw new Error();
      setTemporadas((await res.json()).temporadas ?? []);
    } catch {
      toast("No se pudieron cargar las temporadas", "error");
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => { cargar(); }, [cargar]);

  const set = (campo: keyof FormState, valor: string) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  async function crear() {
    const precio = parseFloat(form.precio);
    if (!form.fechaInicio || !form.fechaFin) { toast("Indica fecha de inicio y de fin", "error"); return; }
    if (form.fechaFin < form.fechaInicio) { toast("La fecha de fin debe ser posterior a la de inicio", "error"); return; }
    if (!Number.isFinite(precio) || precio === 0) { toast("Escribe un precio extra por día distinto de 0", "error"); return; }

    setGuardando(true);
    try {
      const res = await fetch("/api/admin/temporadas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fechaInicio: form.fechaInicio,
          fechaFin:    form.fechaFin,
          precio,
          descripcion: form.descripcion,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo crear la temporada");
      toast("Temporada creada", "success");
      setForm(FORM_VACIO);
      setFormAbierto(false);
      await cargar();
    } catch (err) {
      toast(err instanceof Error ? err.message : "No se pudo crear la temporada", "error");
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActiva(t: Temporada) {
    try {
      const res = await fetch(`/api/admin/temporadas/${t.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: t.status === "activo" ? "inactivo" : "activo" }),
      });
      if (!res.ok) throw new Error();
      toast(t.status === "activo" ? "Temporada desactivada" : "Temporada activada", "success");
      await cargar();
    } catch {
      toast("No se pudo actualizar la temporada", "error");
    }
  }

  async function eliminar(t: Temporada) {
    if (!confirm(`¿Eliminar esta temporada (${fmtFecha(t.fecha_inicio)} → ${fmtFecha(t.fecha_fin)})? Las reservas ya calculadas no cambian.`)) return;
    try {
      const res = await fetch(`/api/admin/temporadas/${t.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Temporada eliminada");
      await cargar();
    } catch {
      toast("No se pudo eliminar la temporada", "error");
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Temporadas de precio</div>
          <div className="page-sub">Sube o baja el precio por día durante un rango de fechas (p. ej. verano)</div>
        </div>
        <button className="btn btn-amber btn-sm" onClick={() => setFormAbierto((v) => !v)}>
          {formAbierto ? "Cancelar" : "+ Nueva temporada"}
        </button>
      </div>

      {/* ── Formulario de alta ── */}
      {formAbierto && (
        <div className="card" style={{ padding: 20, marginBottom: 18 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Fecha de inicio *</label>
              <input className="form-input" type="date" value={form.fechaInicio} onChange={(e) => set("fechaInicio", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de fin *</label>
              <input className="form-input" type="date" value={form.fechaFin} onChange={(e) => set("fechaFin", e.target.value)} />
              <span className="form-hint">Día incluido</span>
            </div>
            <div className="form-group">
              <label className="form-label">Precio extra por día (€) *</label>
              <input
                className="form-input" type="number" step="0.01" placeholder="3.00"
                value={form.precio} onChange={(e) => set("precio", e.target.value)}
              />
              <span className="form-hint">Se suma a cada día de la reserva; negativo para bajar el precio</span>
            </div>
            <div className="form-group span-2">
              <label className="form-label">Descripción</label>
              <input
                className="form-input" placeholder="Verano 2026" maxLength={255}
                value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)}
              />
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-amber" onClick={crear} disabled={guardando}>
              {guardando ? "Guardando…" : "Crear temporada"}
            </button>
          </div>
        </div>
      )}

      {/* ── Listado ── */}
      <div className="card">
        <div className="table-wrap">
          {cargando ? (
            <EmptyState icon="⏳" text="Cargando temporadas…" />
          ) : temporadas.length === 0 ? (
            <EmptyState icon="🗓️" text="Aún no hay temporadas. Crea la primera con «+ Nueva temporada»." />
          ) : (
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Rango de fechas</th><th>Precio extra/día</th>
                  <th>Descripción</th><th>Estado</th><th></th>
                </tr>
              </thead>
              <tbody>
                {temporadas.map((t) => {
                  const estado = estadoTemporada(t);
                  return (
                    <tr key={t.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{fmtFecha(t.fecha_inicio)} → {fmtFecha(t.fecha_fin)}</td>
                      <td>{t.precio > 0 ? "+" : ""}{fmtCurrency(t.precio)}</td>
                      <td>{t.descripcion || "—"}</td>
                      <td><span className={`badge ${estado.clase}`}>{estado.label}</span></td>
                      <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActiva(t)}>
                          {t.status === "activo" ? "Desactivar" : "Activar"}
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: "var(--red-text)" }} onClick={() => eliminar(t)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
