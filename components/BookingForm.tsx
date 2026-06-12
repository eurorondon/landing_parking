"use client";

import { useMemo, useState } from "react";
import BookingModal from "./BookingModal";
import Select from "./ui/Select";
import { OPCIONES_TERMINAL } from "@/lib/config";
import { entradaPorDefecto, salidaPorDefecto, OPCIONES_HORA } from "@/lib/datetime";
import { calcularPrecio, formatoEuros } from "@/lib/pricing";
import type { DatosReserva } from "@/lib/types";

/**
 * Calculador de precio del hero: fechas, horas, terminal y precio en vivo.
 * Al pulsar el botón valida las fechas y abre el modal de reserva.
 */
export default function BookingForm() {
  const [reserva, setReserva] = useState<DatosReserva>({
    entryDate: entradaPorDefecto(),
    entryTime: "08:00",
    exitDate: salidaPorDefecto(),
    exitTime: "18:00",
    terminalEntrada: "T1",
    terminalSalida: "T1",
  });
  const [modalAbierto, setModalAbierto] = useState(false);

  // Precio recalculado en vivo con cada cambio de fecha u hora
  const calculo = useMemo(
    () =>
      calcularPrecio(
        new Date(`${reserva.entryDate}T${reserva.entryTime}`),
        new Date(`${reserva.exitDate}T${reserva.exitTime}`)
      ),
    [reserva]
  );

  function actualizar(campo: keyof DatosReserva, valor: string) {
    setReserva((r) => ({ ...r, [campo]: valor }));
  }

  function abrirModal() {
    if (!calculo) {
      alert("Por favor revisa las fechas de entrada y salida.");
      return;
    }
    setModalAbierto(true);
  }

  return (
    <>
      <div className="booking-card">
        <div className="booking-content">
          <div className="booking-head">
            <div>
              <h2>¿Cuándo vuelas?</h2>
              <p>Calcula tu precio estimado y deja tu reserva lista.</p>
            </div>
            <div className="badge">Sin pago anticipado</div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="entryDate">Fecha entrada</label>
              <input
                id="entryDate"
                type="date"
                value={reserva.entryDate}
                onChange={(e) => actualizar("entryDate", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="entryTime">Hora entrada</label>
              <Select
                id="entryTime"
                ariaLabel="Hora entrada"
                value={reserva.entryTime}
                opciones={OPCIONES_HORA}
                onChange={(v) => actualizar("entryTime", v)}
              />
            </div>
            <div className="field">
              <label htmlFor="exitDate">Fecha salida</label>
              <input
                id="exitDate"
                type="date"
                value={reserva.exitDate}
                onChange={(e) => actualizar("exitDate", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="exitTime">Hora salida</label>
              <Select
                id="exitTime"
                ariaLabel="Hora salida"
                value={reserva.exitTime}
                opciones={OPCIONES_HORA}
                onChange={(v) => actualizar("exitTime", v)}
              />
            </div>
            <div className="field">
              <label htmlFor="terminalEntrada">Terminal entrada</label>
              <Select
                id="terminalEntrada"
                ariaLabel="Terminal entrada"
                value={reserva.terminalEntrada}
                opciones={OPCIONES_TERMINAL}
                onChange={(v) => actualizar("terminalEntrada", v)}
              />
            </div>
            <div className="field">
              <label htmlFor="terminalSalida">Terminal salida</label>
              <Select
                id="terminalSalida"
                ariaLabel="Terminal salida"
                value={reserva.terminalSalida}
                opciones={OPCIONES_TERMINAL}
                onChange={(v) => actualizar("terminalSalida", v)}
              />
            </div>
          </div>

          <div className="price-box">
            <div>
              <small>Precio estimado</small>
              <div className="price">{calculo ? formatoEuros(calculo.total) : "--€"}</div>
            </div>
            <div className="days">
              {calculo
                ? `${calculo.dias} ${calculo.dias === 1 ? "día estimado" : "días estimados"}`
                : "Revisa tus fechas"}
            </div>
          </div>

          <button type="button" className="btn btn-primary full" onClick={abrirModal}>
            Ver disponibilidad y reservar
          </button>
          <p className="note">
            La reserva se confirma por correo o teléfono. Puedes modificarla antes de viajar.
          </p>
        </div>
      </div>

      {modalAbierto && (
        <BookingModal
          reserva={reserva}
          calculo={calculo}
          onChangeReserva={actualizar}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </>
  );
}
