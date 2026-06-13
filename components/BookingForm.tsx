"use client";

import { useMemo, useState } from "react";
import BookingModal from "./BookingModal";
import Select from "./ui/Select";
import { OPCIONES_TERMINAL } from "@/lib/config";
import { entradaPorDefecto, salidaPorDefecto, OPCIONES_HORA } from "@/lib/datetime";
import { calcularPrecio, formatoEuros } from "@/lib/pricing";
import type { DatosReserva } from "@/lib/types";

/**
 * Calculadora de precio — tema claro (Pantalla 2 del diseño).
 * Muestra un formulario de fechas/horas/terminal con previsualización
 * del precio en vivo. Al pulsar el CTA abre el modal de confirmación
 * de datos de cliente (BookingModal).
 */
export default function BookingForm() {
  const [reserva, setReserva] = useState<DatosReserva>({
    vehiculo: "car",
    entryDate: entradaPorDefecto(),
    entryTime: "08:00",
    exitDate: salidaPorDefecto(),
    exitTime: "18:00",
    terminalEntrada: "T1",
    terminalSalida: "T1",
  });
  const [modalAbierto, setModalAbierto] = useState(false);

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
      <div className="bform-card">

        {/* ── Cabecera ── */}
        <div className="bform-header">
          <div className="bform-title-row">
            <div className="bform-title-icon">📅</div>
            <h2 className="bform-title">¿Cuándo vuelas?</h2>
          </div>
          <p className="bform-subtitle">
            Calcula tu precio y reserva en menos de 1 minuto.
          </p>
          <div className="bform-trust-badge">
            <LockIcon /> Sin pago anticipado
          </div>
        </div>

        {/* ── Campos ── */}
        <div className="bform-fields">
          {/* Fila 1: entrada */}
          <div className="bform-field">
            <span className="bform-label">Fecha de entrada</span>
            <div className="bform-icon-wrap">
              <span className="bform-field-icon"><CalendarIcon /></span>
              <input
                className="bform-input"
                type="date"
                value={reserva.entryDate}
                onChange={(e) => actualizar("entryDate", e.target.value)}
                aria-label="Fecha de entrada"
              />
            </div>
          </div>

          <div className="bform-field">
            <span className="bform-label">Hora de entrada</span>
            <div className="bform-icon-wrap">
              <span className="bform-field-icon"><ClockIcon /></span>
              <Select
                ariaLabel="Hora de entrada"
                value={reserva.entryTime}
                opciones={OPCIONES_HORA}
                onChange={(v) => actualizar("entryTime", v)}
              />
            </div>
          </div>

          {/* Fila 2: salida */}
          <div className="bform-field">
            <span className="bform-label">Fecha de salida</span>
            <div className="bform-icon-wrap">
              <span className="bform-field-icon"><CalendarIcon /></span>
              <input
                className="bform-input"
                type="date"
                value={reserva.exitDate}
                onChange={(e) => actualizar("exitDate", e.target.value)}
                aria-label="Fecha de salida"
              />
            </div>
          </div>

          <div className="bform-field">
            <span className="bform-label">Hora de salida</span>
            <div className="bform-icon-wrap">
              <span className="bform-field-icon"><ClockIcon /></span>
              <Select
                ariaLabel="Hora de salida"
                value={reserva.exitTime}
                opciones={OPCIONES_HORA}
                onChange={(v) => actualizar("exitTime", v)}
              />
            </div>
          </div>

          {/* Fila 3: terminales */}
          <div className="bform-field">
            <span className="bform-label">Terminal de entrada</span>
            <div className="bform-icon-wrap">
              <span className="bform-field-icon"><PlaneIcon /></span>
              <Select
                ariaLabel="Terminal de entrada"
                value={reserva.terminalEntrada}
                opciones={OPCIONES_TERMINAL}
                onChange={(v) => actualizar("terminalEntrada", v)}
              />
            </div>
          </div>

          <div className="bform-field">
            <span className="bform-label">Terminal de salida</span>
            <div className="bform-icon-wrap">
              <span className="bform-field-icon"><PlaneIcon /></span>
              <Select
                ariaLabel="Terminal de salida"
                value={reserva.terminalSalida}
                opciones={OPCIONES_TERMINAL}
                onChange={(v) => actualizar("terminalSalida", v)}
              />
            </div>
          </div>
        </div>

        {/* ── Caja de precio ── */}
        <div className="bform-price-box">
          <div className="bform-price-left">
            <div className="bform-price-label">Precio estimado</div>
            <div className="bform-price-amount">
              {calculo ? formatoEuros(calculo.total) : "—€"}
            </div>
            <div className="bform-price-iva">IVA incluido</div>
          </div>
          <div className="bform-price-divider" />
          <div className="bform-price-right">
            <div className="bform-price-days">
              {calculo ? calculo.dias : "—"}{" "}
              <span className="bform-price-days-unit">días</span>
            </div>
            <div className="bform-price-days-label">de estancia</div>
          </div>
        </div>

        {/* ── Botón CTA ── */}
        <button
          className="bform-cta"
          onClick={abrirModal}
          disabled={!calculo}
          type="button"
        >
          VER DISPONIBILIDAD<br />Y RESERVAR
        </button>

        {/* ── Nota de confianza ── */}
        <div className="bform-trust-note">
          <LockIcon />
          Sin pago anticipado · Confirmación rápida por WhatsApp
        </div>

      </div>

      {/* ── Modal de datos del cliente ── */}
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

/* ── Iconos SVG inline ──────────────────────────────── */

function CalendarIcon() {
  return (
    <svg
      width="15" height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="15" height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg
      width="15" height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.7 1l.8 1.8c.2.5.6.8 1.1.8h2.8l-1.7 3.9c-.1.4.1.8.5 1.1l2.1 1.5c.4.3.9.3 1.3 0l3.9-2.8v2.8c0 .5.3.9.8 1.1l1.8.8c.5.2.9-.2 1-.7z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="13" height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
