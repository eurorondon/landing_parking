"use client";

import { useMemo, useState } from "react";
import {
  calcAdminPrice,
  fmtCurrency,
  type AdminConfig,
  type ReservaAdmin,
  type ReservaStatus,
  type VehicleType,
} from "@/lib/admin";

interface Props {
  config: AdminConfig;
  editing: ReservaAdmin | null; // null = nueva reserva
  onClose: () => void;
  onSave: (data: Partial<ReservaAdmin>) => void;
}

interface FormState {
  name: string; phone: string; email: string;
  vehicleType: "" | VehicleType;
  plate: string; model: string; terminal: string;
  checkIn: string; checkOut: string;
  status: ReservaStatus; notes: string;
}

function fmtLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function initialState(editing: ReservaAdmin | null): FormState {
  if (editing) {
    return {
      name: editing.name, phone: editing.phone, email: editing.email,
      vehicleType: editing.vehicleType, plate: editing.plate, model: editing.model,
      terminal: editing.terminal, checkIn: editing.checkIn, checkOut: editing.checkOut,
      status: editing.status, notes: editing.notes,
    };
  }
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(18, 0, 0, 0);
  return {
    name: "", phone: "", email: "", vehicleType: "", plate: "", model: "",
    terminal: "", checkIn: fmtLocal(tomorrow), checkOut: fmtLocal(nextWeek),
    status: "confirmed", notes: "",
  };
}

export default function ReservationFormModal({ config, editing, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(() => initialState(editing));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (campo: keyof FormState, valor: string) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrors((e) => ({ ...e, [campo]: "" }));
  };

  const price = useMemo(
    () => (form.vehicleType ? calcAdminPrice(config, form.vehicleType, form.checkIn, form.checkOut) : 0),
    [config, form.vehicleType, form.checkIn, form.checkOut]
  );

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "El nombre es obligatorio.";
    if (!form.phone.trim()) e.phone = "El teléfono es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Introduce un correo válido.";
    if (!form.vehicleType) e.vehicleType = "Selecciona el tipo de vehículo.";
    if (!form.plate.trim()) e.plate = "La matrícula es obligatoria.";
    if (!form.checkIn) e.checkIn = "La fecha de entrada es obligatoria.";
    if (!form.checkOut) e.checkOut = "La fecha de salida es obligatoria.";
    if (!form.terminal) e.terminal = "Selecciona una terminal.";
    if (form.checkIn && form.checkOut && new Date(form.checkOut) <= new Date(form.checkIn)) {
      e.checkOut = "La salida debe ser posterior a la entrada.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function guardar() {
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      vehicleType: form.vehicleType as VehicleType,
      plate: form.plate.trim().toUpperCase(),
      model: form.model.trim(),
      terminal: form.terminal as ReservaAdmin["terminal"],
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      status: form.status,
      notes: form.notes.trim(),
    });
  }

  const err = (campo: string) =>
    errors[campo] ? <span className="form-error">{errors[campo]}</span> : null;
  const cls = (campo: string) => `form-input${errors[campo] ? " error" : ""}`;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal wide">
        <div className="modal-header">
          <div className="modal-title">{editing ? "Editar reserva" : "Nueva reserva"}</div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="modal-body">
          <div className="price-preview">
            <span className="price-preview-label">Precio estimado</span>
            <span className="price-preview-val">{price > 0 ? fmtCurrency(price) : "€ —"}</span>
          </div>

          <div style={{ marginTop: 18 }}>
            <div className="modal-divider">Datos del cliente</div>
            <div className="form-grid">
              <div className="form-group span-2">
                <label className="form-label">Nombre completo *</label>
                <input className={cls("name")} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="María García López" />
                {err("name")}
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono *</label>
                <input className={cls("phone")} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+34 600 000 000" />
                {err("phone")}
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico *</label>
                <input className={cls("email")} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="maria@email.com" />
                {err("email")}
              </div>
            </div>

            <div className="modal-divider">Vehículo</div>
            <div className="form-grid">
              <div className="form-group span-2">
                <label className="form-label">Tipo de vehículo *</label>
                <div className="radio-group">
                  <label className={`radio-opt${form.vehicleType === "car" ? " selected" : ""}`} onClick={() => set("vehicleType", "car")}>
                    🚗 Coche
                  </label>
                  <label className={`radio-opt${form.vehicleType === "autocaravana" ? " selected" : ""}`} onClick={() => set("vehicleType", "autocaravana")}>
                    🚐 Autocaravana
                  </label>
                </div>
                {err("vehicleType")}
              </div>
              <div className="form-group">
                <label className="form-label">Matrícula *</label>
                <input className={cls("plate")} value={form.plate} onChange={(e) => set("plate", e.target.value.toUpperCase())} placeholder="0000 AAA" style={{ textTransform: "uppercase" }} />
                {err("plate")}
              </div>
              <div className="form-group">
                <label className="form-label">Modelo</label>
                <input className="form-input" value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Toyota Corolla" />
              </div>
            </div>

            <div className="modal-divider">Fechas y terminal</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Fecha y hora de entrada *</label>
                <input className={cls("checkIn")} type="datetime-local" value={form.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
                {err("checkIn")}
              </div>
              <div className="form-group">
                <label className="form-label">Fecha y hora de salida *</label>
                <input className={cls("checkOut")} type="datetime-local" value={form.checkOut} onChange={(e) => set("checkOut", e.target.value)} />
                {err("checkOut")}
              </div>
              <div className="form-group">
                <label className="form-label">Terminal *</label>
                <select className={`form-select${errors.terminal ? " error" : ""}`} value={form.terminal} onChange={(e) => set("terminal", e.target.value)}>
                  <option value="">Selecciona terminal</option>
                  <option value="T1">T1</option>
                  <option value="T2">T2</option>
                  <option value="T3">T3</option>
                  <option value="T4">T4</option>
                </select>
                {err("terminal")}
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select className="form-select" value={form.status} onChange={(e) => set("status", e.target.value as ReservaStatus)}>
                  <option value="confirmed">Pendiente</option>
                  <option value="inside">Activa</option>
                  <option value="finished">Finalizada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 10 }}>
              <label className="form-label">Notas internas</label>
              <textarea className="form-textarea" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Observaciones sobre la reserva…" />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-amber" onClick={guardar}>Guardar reserva</button>
        </div>
      </div>
    </div>
  );
}
