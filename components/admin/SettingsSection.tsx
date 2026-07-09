"use client";

import { useEffect, useState } from "react";
import type { AdminConfig } from "@/lib/admin";

interface Props {
  config: AdminConfig;
  onSave: (cfg: AdminConfig) => void;
  onClearAll: () => void;
  onRestoreDemo: () => void;
}

/** Precios base editables (se guardan en la BD vía /api/admin/precios) */
interface PricingParams {
  basePrice: number;
  dayPrice: number;
  insurancePrice: number;
}

export default function SettingsSection({ config, onSave, onClearAll, onRestoreDemo }: Props) {
  const [form, setForm] = useState<AdminConfig>(config);

  useEffect(() => setForm(config), [config]);

  const num = (campo: keyof AdminConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [campo]: parseFloat(e.target.value) || 0 }));
  const txt = (campo: keyof AdminConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  // ── Precios base (base + €/día + seguro), leídos y guardados en la BD ──
  const [pricing, setPricing] = useState<PricingParams | null>(null);
  const [pricingMsg, setPricingMsg] = useState("");
  const [guardandoPrecios, setGuardandoPrecios] = useState(false);

  useEffect(() => {
    fetch("/api/admin/precios")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setPricing(d.pricing))
      .catch(() => setPricing({ basePrice: 0, dayPrice: 0, insurancePrice: 0 }));
  }, []);

  const priceNum = (campo: keyof PricingParams) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPricing((p) => (p ? { ...p, [campo]: parseFloat(e.target.value) || 0 } : p));

  async function guardarPrecios() {
    if (!pricing) return;
    setGuardandoPrecios(true);
    setPricingMsg("");
    try {
      const res = await fetch("/api/admin/precios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricing),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Error");
      setPricing(data.pricing);
      setPricingMsg("✓ Precios guardados");
    } catch {
      setPricingMsg("✕ No se pudieron guardar");
    } finally {
      setGuardandoPrecios(false);
    }
  }

  const precio1Dia = pricing ? pricing.basePrice + pricing.dayPrice + pricing.insurancePrice : 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Configuración</div>
      </div>

      <div className="settings-grid">
        <div className="setting-group">
          <div className="setting-group-title">💶 Precios base (coche)</div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Precio base / reserva (€)</label>
            <input className="form-input" type="number" step="0.01" min="0"
              value={pricing?.basePrice ?? 0} onChange={priceNum("basePrice")} disabled={!pricing} />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Precio por día (€)</label>
            <input className="form-input" type="number" step="0.01" min="0"
              value={pricing?.dayPrice ?? 0} onChange={priceNum("dayPrice")} disabled={!pricing} />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Precio seguro (€)</label>
            <input className="form-input" type="number" step="0.01" min="0"
              value={pricing?.insurancePrice ?? 0} onChange={priceNum("insurancePrice")} disabled={!pricing} />
          </div>
          <button className="btn btn-amber" onClick={guardarPrecios} disabled={!pricing || guardandoPrecios}>
            {guardandoPrecios ? "Guardando…" : "Guardar precios base"}
          </button>
          {pricingMsg && <span style={{ marginLeft: 10, fontSize: 13 }}>{pricingMsg}</span>}
          <p className="form-hint" style={{ marginTop: 10 }}>
            Precio de 1 día = base + día + seguro = <strong>{precio1Dia.toFixed(2)} €</strong>.
            Cada día extra suma el precio por día; a partir de <strong>{18}</strong> días el
            parking es plano (descuento de estancia larga). Se aplica igual en la web y en el
            panel. Al guardar se regenera la tabla de precios de la base de datos.
          </p>
        </div>

        <div className="setting-group">
          <div className="setting-group-title">🚐 Autocaravana</div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Recargo autocaravana (€/día)</label>
            <input className="form-input" type="number" step="0.01" min="0" value={form.autocaravanaSurcharge} onChange={num("autocaravanaSurcharge")} />
          </div>
          <button className="btn btn-amber" onClick={() => onSave(form)}>Guardar recargo</button>
          <p className="form-hint" style={{ marginTop: 10 }}>
            Se suma <code>días × €/día</code> sobre el precio del coche cuando el vehículo es
            autocaravana, tanto en la web como en las reservas creadas desde el panel.
          </p>
        </div>

        <div className="setting-group">
          <div className="setting-group-title">🏢 Datos del negocio</div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Nombre comercial</label>
            <input className="form-input" value={form.businessName} onChange={txt("businessName")} />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Email del propietario</label>
            <input className="form-input" type="email" value={form.ownerEmail} onChange={txt("ownerEmail")} />
            <span className="form-hint">Aquí llegarán los avisos de nuevas reservas de la web</span>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Teléfono de contacto</label>
            <input className="form-input" value={form.ownerPhone} onChange={txt("ownerPhone")} />
          </div>
          <button className="btn btn-amber" onClick={() => onSave(form)}>Guardar datos</button>
        </div>

        <div className="setting-group" style={{ gridColumn: "1/-1" }}>
          <div className="setting-group-title">🗑️ Zona de peligro</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-danger" onClick={onClearAll}>Borrar todas las reservas</button>
            <button className="btn btn-ghost" onClick={onRestoreDemo}>Restaurar datos demo</button>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--gray-400)", marginTop: 10 }}>
            Estas acciones son irreversibles. Úsalas con precaución.
          </p>
        </div>
      </div>
    </div>
  );
}
