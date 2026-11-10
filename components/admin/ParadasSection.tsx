"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "./ui";
import { aFechaInput } from "@/lib/datetime";
import { describirRango, esFechaHoraValida } from "@/lib/paradas";

/**
 * Periodos de parada: tramos en los que el parking NO recibe ni entrega
 * vehículos (p. ej. Nochebuena: del 24-dic 12:00 al 25-dic 12:00).
 * CRUD contra /api/admin/paradas.
 *
 * Solo se bloquean las horas de ENTRADA y de SALIDA dentro del periodo: un
 * cliente que entra antes y sale después sigue pudiendo reservar. Desde la hora
 * de inicio ya estamos cerrados y a la hora de fin ya hemos reabierto.
 * La validación real está en POST /api/reserva (lib/paradas.ts).
 */

interface Parada {
  id:          number;
  inicio:      string;   // "YYYY-MM-DDTHH:MM"
  fin:         string;
  descripcion: string;
  status:      string;
}

interface FormState {
  fechaInicio: string;
  horaInicio:  string;
  fechaFin:    string;
  horaFin:     string;
  descripcion: string;
}

const FORM_VACIO: FormState = { fechaInicio: "", horaInicio: "12:00", fechaFin: "", horaFin: "12:00", descripcion: "" };

/** "YYYY-MM-DDTHH:MM" de ahora mismo en hora local, para decidir el estado del chip */
function ahoraLocal(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${aFechaInput(d)}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Estado efectivo de la parada para el chip de la tabla */
function estadoParada(p: Parada): { label: string; clase: string } {
  if (p.status !== "activo") return { label: "Inactiva", clase: "badge-finished" };
  const ahora = ahoraLocal();
  if (ahora >= p.fin)    return { label: "Pasada",     clase: "badge-cancelled" };
  if (ahora < p.inicio)  return { label: "Programada", clase: "badge-confirmed" };
  return { label: "En curso", clase: "badge-inside" };
}

export default function ParadasSection({ toast }: { toast: (msg: string, type?: "success" | "error") => void }) {
  const [paradas, setParadas]       = useState<Parada[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [formAbierto, setFormAbierto] = useState(false);
  const [form, setForm]             = useState<FormState>(FORM_VACIO);
  const [guardando, setGuardando]   = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/paradas");
      if (!res.ok) throw new Error();
      setParadas((await res.json()).paradas ?? []);
    } catch {
      toast("No se pudieron cargar las paradas", "error");
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => { cargar(); }, [cargar]);

  const set = (campo: keyof FormState, valor: string) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  async function crear() {
    const inicio = `${form.fechaInicio}T${form.horaInicio}`;
    const fin    = `${form.fechaFin}T${form.horaFin}`;
    if (!esFechaHoraValida(inicio) || !esFechaHoraValida(fin)) {
      toast("Indica fecha y hora de inicio y de fin", "error");
      return;
    }
    if (fin <= inicio) {
      toast("El fin debe ser posterior al inicio", "error");
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch("/api/admin/paradas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ inicio, fin, descripcion: form.descripcion }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo crear la parada");

      const n: number | null = data.reservasAfectadas ?? null;
      if (n && n > 0) {
        // Aviso importante: la parada no cancela ni mueve reservas que ya existían
        toast(
          `Parada creada, pero hay ${n} reserva${n === 1 ? "" : "s"} confirmada${n === 1 ? "" : "s"} con entrada o salida dentro de ese periodo. Revísalas en Reservas.`,
          "error",
        );
      } else {
        toast("Parada creada", "success");
      }
      setForm(FORM_VACIO);
      setFormAbierto(false);
      await cargar();
    } catch (err) {
      toast(err instanceof Error ? err.message : "No se pudo crear la parada", "error");
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActiva(p: Parada) {
    try {
      const res = await fetch(`/api/admin/paradas/${p.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: p.status === "activo" ? "inactivo" : "activo" }),
      });
      if (!res.ok) throw new Error();
      toast(p.status === "activo" ? "Parada desactivada" : "Parada activada", "success");
      await cargar();
    } catch {
      toast("No se pudo actualizar la parada", "error");
    }
  }

  async function eliminar(p: Parada) {
    if (!confirm(`¿Eliminar esta parada (${describirRango(p)})? Volverá a admitirse cualquier entrada o salida en ese periodo.`)) return;
    try {
      const res = await fetch(`/api/admin/paradas/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Parada eliminada");
      await cargar();
    } catch {
      toast("No se pudo eliminar la parada", "error");
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Paradas</div>
          <div className="page-sub">Periodos en los que no recibimos ni entregamos vehículos (p. ej. Navidad)</div>
        </div>
        <button className="btn btn-amber btn-sm" onClick={() => setFormAbierto((v) => !v)}>
          {formAbierto ? "Cancelar" : "+ Nueva parada"}
        </button>
      </div>

      {/* ── Formulario de alta ── */}
      {formAbierto && (
        <div className="card" style={{ padding: 20, marginBottom: 18 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Cerramos desde (fecha) *</label>
              <input className="form-input" type="date" value={form.fechaInicio} onChange={(e) => set("fechaInicio", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Hora de cierre *</label>
              <input className="form-input" type="time" step={900} value={form.horaInicio} onChange={(e) => set("horaInicio", e.target.value)} />
              <span className="form-hint">Desde esta hora ya no hay entradas ni salidas</span>
            </div>
            <div className="form-group">
              <label className="form-label">Reabrimos el (fecha) *</label>
              <input className="form-input" type="date" value={form.fechaFin} onChange={(e) => set("fechaFin", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Hora de reapertura *</label>
              <input className="form-input" type="time" step={900} value={form.horaFin} onChange={(e) => set("horaFin", e.target.value)} />
              <span className="form-hint">A esta hora exacta ya se admiten entradas y salidas</span>
            </div>
            <div className="form-group span-2">
              <label className="form-label">Descripción</label>
              <input
                className="form-input" placeholder="Navidad" maxLength={255}
                value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)}
              />
              <span className="form-hint">Se muestra a los clientes en la web: escribe algo apto para público</span>
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-amber" onClick={crear} disabled={guardando}>
              {guardando ? "Guardando…" : "Crear parada"}
            </button>
          </div>
        </div>
      )}

      {/* ── Listado ── */}
      <div className="card">
        <div className="table-wrap">
          {cargando ? (
            <EmptyState icon="⏳" text="Cargando paradas…" />
          ) : paradas.length === 0 ? (
            <EmptyState icon="🛑" text="Aún no hay paradas. Crea la primera con «+ Nueva parada»." />
          ) : (
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Periodo sin servicio</th><th>Descripción</th><th>Estado</th><th></th>
                </tr>
              </thead>
              <tbody>
                {paradas.map((p) => {
                  const estado = estadoParada(p);
                  return (
                    <tr key={p.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{describirRango(p)}</td>
                      <td>{p.descripcion || "—"}</td>
                      <td><span className={`badge ${estado.clase}`}>{estado.label}</span></td>
                      <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActiva(p)}>
                          {p.status === "activo" ? "Desactivar" : "Activar"}
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: "var(--red-text)" }} onClick={() => eliminar(p)}>
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
