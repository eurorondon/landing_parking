"use client";

import { useEffect, useState } from "react";
import type { AdminConfig } from "@/lib/admin";

interface Props {
  config: AdminConfig;
  onSave: (cfg: AdminConfig) => void;
  onClearAll: () => void;
  onRestoreDemo: () => void;
}

export default function SettingsSection({ config, onSave, onClearAll, onRestoreDemo }: Props) {
  const [form, setForm] = useState<AdminConfig>(config);

  useEffect(() => setForm(config), [config]);

  const num = (campo: keyof AdminConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [campo]: parseFloat(e.target.value) || 0 }));
  const txt = (campo: keyof AdminConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Configuración</div>
      </div>

      <div className="settings-grid">
        <div className="setting-group">
          <div className="setting-group-title">💶 Tarifas</div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Precio coche (€/día)</label>
            <input className="form-input" type="number" step="0.01" min="0" value={form.carPrice} onChange={num("carPrice")} />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Precio moto (€/día)</label>
            <input className="form-input" type="number" step="0.01" min="0" value={form.motoPrice} onChange={num("motoPrice")} />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Precio valet (€/reserva)</label>
            <input className="form-input" type="number" step="0.01" min="0" value={form.valetPrice} onChange={num("valetPrice")} />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Precio seguro (€/reserva)</label>
            <input className="form-input" type="number" step="0.01" min="0" value={form.insurancePrice} onChange={num("insurancePrice")} />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Mínimo de días</label>
            <input className="form-input" type="number" min="1" value={form.minDays} onChange={(e) => setForm((f) => ({ ...f, minDays: parseInt(e.target.value) || 1 }))} />
          </div>
          <button className="btn btn-amber" onClick={() => onSave(form)}>Guardar tarifas</button>
          <p className="form-hint" style={{ marginTop: 10 }}>
            Estas tarifas se aplican a las reservas creadas o editadas desde el panel.
            El valet y el seguro se suman a cada reserva, y todo día empezado se
            cobra completo, así que el precio mínimo es: 1 día + valet + seguro.
            Las tarifas del calculador de la web se editan en <code>lib/pricing.ts</code>.
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
