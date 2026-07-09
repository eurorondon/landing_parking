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
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Recargo autocaravana (€/día)</label>
            <input className="form-input" type="number" step="0.01" min="0" value={form.autocaravanaSurcharge} onChange={num("autocaravanaSurcharge")} />
          </div>
          <button className="btn btn-amber" onClick={() => onSave(form)}>Guardar tarifas</button>
          <p className="form-hint" style={{ marginTop: 10 }}>
            El precio del parking (base + €/día + seguro) sale de la base de datos
            (<code>registro_precios</code> y <code>servicios</code>), la misma para la web
            y el panel. Aquí solo se configura el recargo por día de las autocaravanas,
            que se suma sobre el precio del coche tanto en la web como en las reservas
            creadas desde el panel.
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
