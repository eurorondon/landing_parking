"use client";

import { useMemo, useState } from "react";
import BookingModal from "./BookingModal";
import { TERMINALES, type Terminal } from "@/lib/config";
import { entradaPorDefecto, salidaPorDefecto } from "@/lib/datetime";
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
    terminal: "T1",
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
              <input
                id="entryTime"
                type="time"
                value={reserva.entryTime}
                onChange={(e) => actualizar("entryTime", e.target.value)}
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
              <input
                id="exitTime"
                type="time"
                value={reserva.exitTime}
                onChange={(e) => actualizar("exitTime", e.target.value)}
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: 14 }}>
            <label>Terminal</label>
          </div>
          <div className="terminal-row">
            {TERMINALES.map((t) => (
              <button
                key={t}
                type="button"
                className={`terminal${reserva.terminal === t ? " active" : ""}`}
                onClick={() => actualizar("terminal", t as Terminal)}
              >
                {t}
              </button>
            ))}
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

      {modalAbierto && calculo && (
        <BookingModal
          reserva={reserva}
          calculo={calculo}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </>
  );
}
