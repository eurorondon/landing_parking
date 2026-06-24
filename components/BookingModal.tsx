"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Select from "./ui/Select";
import { OPCIONES_TERMINAL } from "@/lib/config";
import { OPCIONES_HORA } from "@/lib/datetime";
import { calculateRawParkingDays, aplicaNocturnidad, formatoEuros, type CalculoPrecio } from "@/lib/pricing";
import type { DatosCliente, DatosReserva } from "@/lib/types";

interface Props {
  reserva: DatosReserva;
  // null cuando las fechas elegidas no son válidas (salida <= entrada)
  calculo: CalculoPrecio | null;
  onChangeReserva: (campo: keyof DatosReserva, valor: string) => void;
  onClose: () => void;
}

const clienteVacio: DatosCliente = {
  nombre: "",
  telefono: "",
  email: "",
  matricula: "",
  modelo: "",
};

/** Validaciones básicas del formulario */
function validarCliente(c: DatosCliente): string | null {
  if (c.nombre.trim().length < 3) return "Escribe tu nombre completo.";
  if (!/^[+\d][\d\s-]{7,}$/.test(c.telefono.trim()))
    return "Escribe un teléfono válido (mínimo 8 dígitos).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim()))
    return "Escribe un correo electrónico válido.";
  if (c.matricula.trim().length < 4) return "Escribe la matrícula del vehículo.";
  if (c.modelo.trim().length < 2) return "Escribe el modelo del vehículo.";
  return null;
}

export default function BookingModal({ reserva, calculo: calculoInicial, onChangeReserva, onClose }: Props) {
  const [cliente, setCliente] = useState<DatosCliente>(clienteVacio);
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // El modal tiene su propio cálculo local por si el usuario cambia fechas dentro del modal
  const [calculo, setCalculo] = useState<CalculoPrecio | null>(calculoInicial);

  // Bloquea el scroll de fondo y permite cerrar con Escape
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Recalcula precio desde la BD cuando cambian las fechas dentro del modal
  useEffect(() => {
    const entrada = new Date(`${reserva.entryDate}T${reserva.entryTime}`);
    const salida  = new Date(`${reserva.exitDate}T${reserva.exitTime}`);
    if (!Number.isFinite(entrada.getTime()) || !Number.isFinite(salida.getTime())) {
      setCalculo(null);
      return;
    }
    const dias     = calculateRawParkingDays(entrada, salida);
    const nocturno = aplicaNocturnidad(reserva.entryTime, reserva.exitTime);
    if (dias <= 0) { setCalculo(null); return; }

    fetch(`/api/precio?dias=${dias}${nocturno ? "&nocturno=1" : ""}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: { costo_parking: number; costo_seguro: number; costo_nocturnidad: number; total: number }) => {
        setCalculo({
          dias,
          costoParking:     data.costo_parking,
          costoSeguro:      data.costo_seguro,
          costoNocturnidad: nocturno ? data.costo_nocturnidad : 0,
          total:            data.total,
        });
      })
      .catch(() => setCalculo(null));
  }, [reserva.entryDate, reserva.entryTime, reserva.exitDate, reserva.exitTime]);

  function actualizar(campo: keyof DatosCliente, valor: string) {
    setCliente((c) => ({ ...c, [campo]: valor }));
    setError(null);
  }

  function cambiarReserva(campo: keyof DatosReserva, valor: string) {
    onChangeReserva(campo, valor);
    setError(null);
  }

  async function confirmarReserva(e: React.FormEvent) {
    e.preventDefault();
    if (!calculo) {
      setError("Revisa las fechas: la salida debe ser posterior a la entrada.");
      return;
    }
    const errorCliente = validarCliente(cliente);
    if (errorCliente) {
      setError(errorCliente);
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      // Envía la reserva a la API, que manda el correo al dueño del parking
      // (el email del dueño se configura en lib/config.ts → NEGOCIO.emailDueno)
      const res = await fetch("/api/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cliente,
          vehiculo: reserva.vehiculo,
          entrada: `${reserva.entryDate}T${reserva.entryTime}`,
          salida: `${reserva.exitDate}T${reserva.exitTime}`,
          terminalEntrada: reserva.terminalEntrada,
          terminalSalida: reserva.terminalSalida,
          dias: calculo.dias,
          total: calculo.total,
        }),
      });
      if (!res.ok) throw new Error("Respuesta no válida del servidor");
      setEnviada(true);
    } catch {
      setError("No se pudo enviar la reserva. Inténtalo de nuevo o llámanos por teléfono.");
    } finally {
      setEnviando(false);
    }
  }

  // Portal a <body>: dentro del hero, el modal hereda su color blanco y queda
  // por debajo del header fijo (el hero crea su propio contexto de apilamiento)
  return createPortal(
    <div
      className="modal open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Completa tu reserva"
    >
      <div className="modal-card">
        <div className="modal-top">
          <div>
            <h2>Completa tu reserva</h2>
            <p>Revisa los datos y deja tu información de contacto.</p>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="vehicle-toggle" role="radiogroup" aria-label="Tipo de vehículo">
            <button
              type="button"
              className={reserva.vehiculo === "car" ? "active" : ""}
              onClick={() => cambiarReserva("vehiculo", "car")}
              disabled={enviada}
            >
              🚗 Coche
            </button>
            <button
              type="button"
              className={reserva.vehiculo === "moto" ? "active" : ""}
              onClick={() => cambiarReserva("vehiculo", "moto")}
              disabled={enviada}
            >
              🏍️ Moto
            </button>
          </div>

          <div className="form-grid" style={{ marginBottom: 12 }}>
            <div className="field">
              <label htmlFor="mEntryDate">Fecha entrada</label>
              <input
                id="mEntryDate"
                type="date"
                value={reserva.entryDate}
                onChange={(e) => cambiarReserva("entryDate", e.target.value)}
                disabled={enviada}
              />
            </div>
            <div className="field">
              <label htmlFor="mEntryTime">Hora entrada</label>
              <Select
                id="mEntryTime"
                ariaLabel="Hora entrada"
                value={reserva.entryTime}
                opciones={OPCIONES_HORA}
                onChange={(v) => cambiarReserva("entryTime", v)}
                disabled={enviada}
              />
            </div>
            <div className="field">
              <label htmlFor="mExitDate">Fecha salida</label>
              <input
                id="mExitDate"
                type="date"
                value={reserva.exitDate}
                onChange={(e) => cambiarReserva("exitDate", e.target.value)}
                disabled={enviada}
              />
            </div>
            <div className="field">
              <label htmlFor="mExitTime">Hora salida</label>
              <Select
                id="mExitTime"
                ariaLabel="Hora salida"
                value={reserva.exitTime}
                opciones={OPCIONES_HORA}
                onChange={(v) => cambiarReserva("exitTime", v)}
                disabled={enviada}
              />
            </div>
            <div className="field">
              <label htmlFor="mTerminalEntrada">Terminal entrada</label>
              <Select
                id="mTerminalEntrada"
                ariaLabel="Terminal entrada"
                value={reserva.terminalEntrada}
                opciones={OPCIONES_TERMINAL}
                onChange={(v) => cambiarReserva("terminalEntrada", v)}
                disabled={enviada}
              />
            </div>
            <div className="field">
              <label htmlFor="mTerminalSalida">Terminal salida</label>
              <Select
                id="mTerminalSalida"
                ariaLabel="Terminal salida"
                value={reserva.terminalSalida}
                opciones={OPCIONES_TERMINAL}
                onChange={(v) => cambiarReserva("terminalSalida", v)}
                disabled={enviada}
              />
            </div>
          </div>

          {!calculo && (
            <div className="form-error" style={{ margin: "0 0 12px" }}>
              La salida debe ser posterior a la entrada.
            </div>
          )}

          <div className="summary-box">
            <div className="summary-item" style={{ gridColumn: "1/-1" }}>
              <span>Estancia ({calculo ? `${calculo.dias} ${calculo.dias === 1 ? "día" : "días"}` : "—"})</span>
              <strong>{calculo ? formatoEuros(calculo.costoParking) : "—"}</strong>
            </div>
            <div className="summary-item" style={{ gridColumn: "1/-1" }}>
              <span>Seguro de vehículo</span>
              <strong>{calculo ? formatoEuros(calculo.costoSeguro) : "—"}</strong>
            </div>
            {calculo && calculo.costoNocturnidad > 0 && (
              <div className="summary-item" style={{ gridColumn: "1/-1", color: "#d97706" }}>
                <span>🌙 Recargo nocturno (00:30–03:30)</span>
                <strong>{formatoEuros(calculo.costoNocturnidad)}</strong>
              </div>
            )}
            <div className="summary-item" style={{ gridColumn: "1/-1", borderTop: "1px solid #e2e8f0", paddingTop: 8, marginTop: 4 }}>
              <span><strong>Total estimado</strong></span>
              <strong style={{ fontSize: "1.1em" }}>{calculo ? formatoEuros(calculo.total) : "—"}</strong>
            </div>
          </div>

          <form onSubmit={confirmarReserva}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="nombre">Nombre completo</label>
                <input
                  id="nombre"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ej. María García"
                  value={cliente.nombre}
                  onChange={(e) => actualizar("nombre", e.target.value)}
                  disabled={enviada}
                />
              </div>
              <div className="field">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="+34 600 000 000"
                  value={cliente.telefono}
                  onChange={(e) => actualizar("telefono", e.target.value)}
                  disabled={enviada}
                />
              </div>
              <div className="field">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="correo@email.com"
                  value={cliente.email}
                  onChange={(e) => actualizar("email", e.target.value)}
                  disabled={enviada}
                />
              </div>
              <div className="field">
                <label htmlFor="matricula">Matrícula</label>
                <input
                  id="matricula"
                  type="text"
                  required
                  placeholder="1234 ABC"
                  value={cliente.matricula}
                  onChange={(e) => actualizar("matricula", e.target.value.toUpperCase())}
                  disabled={enviada}
                />
              </div>
              <div className="field" style={{ gridColumn: "1/-1" }}>
                <label htmlFor="modelo">Modelo del vehículo</label>
                <input
                  id="modelo"
                  type="text"
                  required
                  placeholder="Ej. Toyota Corolla blanco"
                  value={cliente.modelo}
                  onChange={(e) => actualizar("modelo", e.target.value)}
                  disabled={enviada}
                />
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            {!enviada && (
              <button
                style={{ marginTop: 20 }}
                className="btn btn-primary full"
                type="submit"
                disabled={enviando}
              >
                {enviando ? "Enviando reserva…" : "Confirmar reserva"}
              </button>
            )}

            <div className={`success${enviada ? " show" : ""}`}>
              ✅ <strong>Reserva confirmada.</strong> Te hemos enviado la
              confirmación a {cliente.email || "tu correo"}.
              Recuerda: no pagas nada hasta entregar tu vehículo.
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
