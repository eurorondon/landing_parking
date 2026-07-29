"use client";

import { useEffect, useState } from "react";
import {
  fmtCurrency,
  type AdminConfig,
  type ReservaAdmin,
  type ReservaStatus,
  type VehicleType,
} from "@/lib/admin";
import { calculateRawParkingDays, aplicaNocturnidad, formatFranjaNocturna, aplicarDescuento } from "@/lib/pricing";
import { OPCIONES_TERMINAL } from "@/lib/config";
import { ID_SERVICIOS_LAVADO } from "@/lib/servicios-reserva";

interface ServicioLavado {
  id: number;
  nombre_servicio: string;
  costo: number;
}

interface Props {
  config: AdminConfig;
  editing: ReservaAdmin | null; // null = nueva reserva
  onClose: () => void;
  /** `enviarEmail`, `enviarParkingPlus` y `servicios` solo viajan al crear */
  onSave: (data: Partial<ReservaAdmin> & { enviarEmail?: boolean; enviarParkingPlus?: boolean; servicios?: number[] }) => void;
}

interface FormState {
  name: string; phone: string; email: string;
  vehicleType: "" | VehicleType;
  plate: string; model: string;
  terminalEntrada: string; terminalSalida: string;
  checkIn: string; checkOut: string;
  status: ReservaStatus; notes: string;
  /** id del servicio de lavado, "" = sin lavado */
  lavadoId: string;
  /** % de descuento manual sobre el total, "" = sin descuento */
  descuentoPct: string;
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
      terminalEntrada: editing.terminalEntrada, terminalSalida: editing.terminalSalida,
      checkIn: editing.checkIn, checkOut: editing.checkOut,
      status: editing.status, notes: editing.notes,
      // El lavado solo se elige al crear: editar una reserva no recalcula servicios
      lavadoId: "",
      descuentoPct: editing.discountPct ? String(editing.discountPct) : "",
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
    terminalEntrada: "", terminalSalida: "",
    checkIn: fmtLocal(tomorrow), checkOut: fmtLocal(nextWeek),
    status: "confirmed", notes: "", lavadoId: "", descuentoPct: "",
  };
}

export default function ReservationFormModal({ editing, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(() => initialState(editing));
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Al crear se avisa al cliente por defecto; al editar no se envía nada
  // (para eso está el reenvío manual desde la ficha de la reserva).
  const [enviarEmail, setEnviarEmail] = useState(true);
  // Al crear también se registra en parkingplus (medio Agencia) por defecto
  const [enviarParkingPlus, setEnviarParkingPlus] = useState(true);

  const set = (campo: keyof FormState, valor: string) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrors((e) => ({ ...e, [campo]: "" }));
  };

  // Precio estimado desde la fuente única (/api/precio, misma BD que la web).
  // Se recalcula al cambiar vehículo o fechas.
  const [price, setPrice] = useState(0);
  const [precioCargando, setPrecioCargando] = useState(false);
  // > 0 cuando las horas de entrada/salida caen en la franja nocturna configurada en BD
  const [costoNocturnidad, setCostoNocturnidad] = useState(0);

  // Servicios de lavado contratables (mismos IDs que el resto de proyectos)
  const [lavados, setLavados] = useState<ServicioLavado[]>([]);
  useEffect(() => {
    fetch("/api/servicios")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { servicios: ServicioLavado[] }) =>
        setLavados((d.servicios ?? []).filter((s) => ID_SERVICIOS_LAVADO.includes(s.id))))
      .catch(() => setLavados([]));
  }, []);

  const lavadoElegido = lavados.find((s) => String(s.id) === form.lavadoId) ?? null;
  const costoLavado   = Number(lavadoElegido?.costo ?? 0);
  const precioBruto   = price > 0 ? price + costoLavado : price;

  // Descuento manual. Aquí es solo una previsualización: el importe definitivo
  // lo recalcula siempre el servidor a partir del %, nunca se envía desde aquí.
  const descuento     = aplicarDescuento(precioBruto, form.descuentoPct);
  const precioTotal   = descuento.total;

  useEffect(() => {
    const entrada = new Date(form.checkIn);
    const salida  = new Date(form.checkOut);
    if (!form.vehicleType || !Number.isFinite(entrada.getTime()) || !Number.isFinite(salida.getTime()) || salida <= entrada) {
      setPrice(0);
      setCostoNocturnidad(0);
      return;
    }
    const dias     = calculateRawParkingDays(entrada, salida);
    const nocturno = aplicaNocturnidad(form.checkIn.slice(11, 16), form.checkOut.slice(11, 16));
    const vehiculoParam = form.vehicleType === "autocaravana" ? "&vehiculo=autocaravana" : "";
    setPrecioCargando(true);
    fetch(`/api/precio?dias=${dias}${nocturno ? "&nocturno=1" : ""}${vehiculoParam}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { total: number; costo_nocturnidad: number }) => {
        setPrice(d.total);
        setCostoNocturnidad(nocturno ? Number(d.costo_nocturnidad || 0) : 0);
      })
      .catch(() => { setPrice(0); setCostoNocturnidad(0); })
      .finally(() => setPrecioCargando(false));
  }, [form.vehicleType, form.checkIn, form.checkOut]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "El nombre es obligatorio.";
    if (!form.phone.trim()) e.phone = "El teléfono es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Introduce un correo válido.";
    if (!form.vehicleType) e.vehicleType = "Selecciona el tipo de vehículo.";
    if (!form.plate.trim()) e.plate = "La matrícula es obligatoria.";
    if (!form.checkIn) e.checkIn = "La fecha de entrada es obligatoria.";
    if (!form.checkOut) e.checkOut = "La fecha de salida es obligatoria.";
    if (!form.terminalEntrada) e.terminalEntrada = "Selecciona la terminal de entrada.";
    if (!form.terminalSalida)  e.terminalSalida  = "Selecciona la terminal de salida.";
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
      terminalEntrada: form.terminalEntrada as ReservaAdmin["terminalEntrada"],
      terminalSalida:  form.terminalSalida  as ReservaAdmin["terminalSalida"],
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      status: form.status,
      notes: form.notes.trim(),
      // Solo el %: el importe descontado lo calcula el servidor
      discountPct: descuento.pct,
      ...(editing ? {} : { enviarEmail, enviarParkingPlus, servicios: lavadoElegido ? [lavadoElegido.id] : [] }),
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
            <span className="price-preview-label">
              {descuento.pct > 0 ? "Precio con descuento" : "Precio estimado"}
            </span>
            <span className="price-preview-val">
              {precioCargando ? "…" : precioTotal > 0 ? fmtCurrency(precioTotal) : "€ —"}
            </span>
          </div>

          {/* Descuento manual sobre el total. Solo lo aplica un administrador:
              no es un cupón, no lleva código ni consume usos. */}
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Descuento sobre el total (%)</label>
            <input
              className="form-input"
              type="number"
              min={0}
              max={100}
              step={0.5}
              inputMode="decimal"
              placeholder="0"
              value={form.descuentoPct}
              onChange={(e) => set("descuentoPct", e.target.value)}
            />
            {!precioCargando && descuento.pct > 0 && precioBruto > 0 && (
              <p className="form-hint" style={{ marginTop: 6 }}>
                Precio sin descuento {fmtCurrency(precioBruto)} · se descuentan{" "}
                <strong>{fmtCurrency(descuento.descuento)}</strong> ({descuento.pct}%)
              </p>
            )}
          </div>

          {/* Mismo aviso de nocturnidad que ve el cliente en la web */}
          {!precioCargando && costoNocturnidad > 0 && (
            <div className="nocturno-aviso">
              🌙 Incluye recargo nocturno de {fmtCurrency(costoNocturnidad)} en la franja {formatFranjaNocturna()}
            </div>
          )}

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
              {!editing && (
                <div className="form-group span-2">
                  <label className="form-label">Servicio de lavado</label>
                  <select className="form-select" value={form.lavadoId} onChange={(e) => set("lavadoId", e.target.value)}>
                    <option value="">Sin lavado</option>
                    {lavados.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.nombre_servicio} · {fmtCurrency(Number(s.costo))}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="modal-divider">Fechas y terminales</div>
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
                <label className="form-label">Terminal de entrada *</label>
                <select className={`form-select${errors.terminalEntrada ? " error" : ""}`} value={form.terminalEntrada} onChange={(e) => set("terminalEntrada", e.target.value)}>
                  <option value="">Terminal de entrada</option>
                  {OPCIONES_TERMINAL.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {err("terminalEntrada")}
              </div>
              <div className="form-group">
                <label className="form-label">Terminal de salida *</label>
                <select className={`form-select${errors.terminalSalida ? " error" : ""}`} value={form.terminalSalida} onChange={(e) => set("terminalSalida", e.target.value)}>
                  <option value="">Terminal de salida</option>
                  {OPCIONES_TERMINAL.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {err("terminalSalida")}
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

            {!editing && (
              <>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 13, color: "var(--gray-600)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={enviarEmail}
                    onChange={(e) => setEnviarEmail(e.target.checked)}
                  />
                  Enviar correo de confirmación al cliente
                  <span style={{ color: "var(--gray-500)" }}>
                    (desmarca para altas antiguas o de teléfono)
                  </span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: "var(--gray-600)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={enviarParkingPlus}
                    onChange={(e) => setEnviarParkingPlus(e.target.checked)}
                  />
                  Registrar también en ParkingPlus
                  <span style={{ color: "var(--gray-500)" }}>
                    (medio Agencia, igual que las reservas de la web)
                  </span>
                </label>
              </>
            )}
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
