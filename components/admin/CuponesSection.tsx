"use client";

import { useCallback, useEffect, useState } from "react";
import { fmtCurrency } from "@/lib/admin";
import { EmptyState } from "./ui";

/**
 * Gestión de cupones promocionales (códigos de descuento para campañas,
 * p. ej. Google Ads). CRUD contra /api/admin/cupones.
 */

interface Cupon {
  id:           number;
  codigo:       string;
  tipo:         "porcentaje" | "fijo";
  valor:        number;
  valido_desde: string | null;
  valido_hasta: string | null;
  max_usos:     number | null;
  usos:         number;
  activo:       boolean;
  campana:      string | null;
  created_at:   string;
}

interface FormState {
  codigo:      string;
  tipo:        "porcentaje" | "fijo";
  valor:       string;
  validoDesde: string;
  validoHasta: string;
  maxUsos:     string;
  campana:     string;
}

const FORM_VACIO: FormState = {
  codigo: "", tipo: "porcentaje", valor: "",
  validoDesde: "", validoHasta: "", maxUsos: "", campana: "",
};

/** Estado efectivo del cupón para el chip de la tabla */
function estadoCupon(c: Cupon): { label: string; clase: string } {
  if (!c.activo) return { label: "Inactivo", clase: "badge-finished" };
  const ahora = new Date();
  if (c.valido_hasta && ahora > new Date(c.valido_hasta)) return { label: "Caducado", clase: "badge-cancelled" };
  if (c.max_usos !== null && c.usos >= c.max_usos)        return { label: "Agotado",  clase: "badge-cancelled" };
  if (c.valido_desde && ahora < new Date(c.valido_desde)) return { label: "Programado", clase: "badge-confirmed" };
  return { label: "Activo", clase: "badge-inside" };
}

const fmtFecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function CuponesSection({ toast }: { toast: (msg: string, type?: "success" | "error") => void }) {
  const [cupones, setCupones]   = useState<Cupon[]>([]);
  const [cargando, setCargando] = useState(true);
  const [formAbierto, setFormAbierto] = useState(false);
  const [form, setForm]         = useState<FormState>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cupones");
      if (!res.ok) throw new Error();
      setCupones((await res.json()).cupones ?? []);
    } catch {
      toast("No se pudieron cargar los cupones", "error");
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => { cargar(); }, [cargar]);

  const set = (campo: keyof FormState, valor: string) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  async function crear() {
    const valor = parseFloat(form.valor);
    if (!form.codigo.trim()) { toast("Escribe el código del cupón", "error"); return; }
    if (!Number.isFinite(valor) || valor <= 0) { toast("Escribe un valor de descuento válido", "error"); return; }

    setGuardando(true);
    try {
      const res = await fetch("/api/admin/cupones", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo:      form.codigo,
          tipo:        form.tipo,
          valor,
          validoDesde: form.validoDesde || null,
          validoHasta: form.validoHasta || null,
          maxUsos:     form.maxUsos ? parseInt(form.maxUsos, 10) : null,
          campana:     form.campana,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo crear el cupón");
      toast(`Cupón ${data.cupon.codigo} creado`, "success");
      setForm(FORM_VACIO);
      setFormAbierto(false);
      await cargar();
    } catch (err) {
      toast(err instanceof Error ? err.message : "No se pudo crear el cupón", "error");
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo(c: Cupon) {
    try {
      const res = await fetch(`/api/admin/cupones/${c.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ activo: !c.activo }),
      });
      if (!res.ok) throw new Error();
      toast(c.activo ? `Cupón ${c.codigo} desactivado` : `Cupón ${c.codigo} activado`, "success");
      await cargar();
    } catch {
      toast("No se pudo actualizar el cupón", "error");
    }
  }

  async function eliminar(c: Cupon) {
    if (!confirm(`¿Eliminar el cupón ${c.codigo}? Las reservas que ya lo usaron no cambian.`)) return;
    try {
      const res = await fetch(`/api/admin/cupones/${c.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast(`Cupón ${c.codigo} eliminado`);
      await cargar();
    } catch {
      toast("No se pudo eliminar el cupón", "error");
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Cupones</div>
          <div className="page-sub">Códigos promocionales para campañas (Google Ads, redes…)</div>
        </div>
        <button className="btn btn-amber btn-sm" onClick={() => setFormAbierto((v) => !v)}>
          {formAbierto ? "Cancelar" : "+ Nuevo cupón"}
        </button>
      </div>

      {/* ── Formulario de alta ── */}
      {formAbierto && (
        <div className="card" style={{ padding: 20, marginBottom: 18 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Código *</label>
              <input
                className="form-input" placeholder="VERANO10" maxLength={50}
                value={form.codigo}
                onChange={(e) => set("codigo", e.target.value.toUpperCase().replace(/\s/g, ""))}
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de descuento *</label>
              <select className="form-select" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="fijo">Importe fijo (€)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{form.tipo === "porcentaje" ? "Porcentaje *" : "Importe (€) *"}</label>
              <input
                className="form-input" type="number" min="0.01" step="0.01"
                max={form.tipo === "porcentaje" ? 100 : undefined}
                placeholder={form.tipo === "porcentaje" ? "10" : "5.00"}
                value={form.valor} onChange={(e) => set("valor", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Válido desde</label>
              <input className="form-input" type="date" value={form.validoDesde} onChange={(e) => set("validoDesde", e.target.value)} />
              <span className="form-hint">Vacío = desde ya</span>
            </div>
            <div className="form-group">
              <label className="form-label">Válido hasta</label>
              <input className="form-input" type="date" value={form.validoHasta} onChange={(e) => set("validoHasta", e.target.value)} />
              <span className="form-hint">Vacío = sin caducidad (día incluido)</span>
            </div>
            <div className="form-group">
              <label className="form-label">Máximo de usos</label>
              <input
                className="form-input" type="number" min="1" step="1" placeholder="Ilimitado"
                value={form.maxUsos} onChange={(e) => set("maxUsos", e.target.value)}
              />
            </div>
            <div className="form-group span-2">
              <label className="form-label">Campaña / origen</label>
              <input
                className="form-input" placeholder="Google Ads · Verano 2026" maxLength={100}
                value={form.campana} onChange={(e) => set("campana", e.target.value)}
              />
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-amber" onClick={crear} disabled={guardando}>
              {guardando ? "Guardando…" : "Crear cupón"}
            </button>
          </div>
        </div>
      )}

      {/* ── Listado ── */}
      <div className="card">
        <div className="table-wrap">
          {cargando ? (
            <EmptyState icon="⏳" text="Cargando cupones…" />
          ) : cupones.length === 0 ? (
            <EmptyState icon="🎟️" text="Aún no hay cupones. Crea el primero con «+ Nuevo cupón»." />
          ) : (
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Código</th><th>Descuento</th><th>Vigencia</th><th>Usos</th>
                  <th>Campaña</th><th>Estado</th><th></th>
                </tr>
              </thead>
              <tbody>
                {cupones.map((c) => {
                  const estado = estadoCupon(c);
                  return (
                    <tr key={c.id}>
                      <td><strong style={{ fontFamily: "monospace", fontSize: 13 }}>{c.codigo}</strong></td>
                      <td>{c.tipo === "porcentaje" ? `${c.valor}%` : fmtCurrency(c.valor)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {c.valido_desde || c.valido_hasta
                          ? `${fmtFecha(c.valido_desde)} → ${fmtFecha(c.valido_hasta)}`
                          : "Siempre"}
                      </td>
                      <td>{c.usos}{c.max_usos !== null ? ` / ${c.max_usos}` : ""}</td>
                      <td>{c.campana || "—"}</td>
                      <td><span className={`badge ${estado.clase}`}>{estado.label}</span></td>
                      <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActivo(c)}>
                          {c.activo ? "Desactivar" : "Activar"}
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: "var(--red-text)" }} onClick={() => eliminar(c)}>
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
