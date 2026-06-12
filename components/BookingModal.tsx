"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatoFecha } from "@/lib/datetime";
import { formatoEuros, type CalculoPrecio } from "@/lib/pricing";
import type { DatosCliente, DatosReserva } from "@/lib/types";

interface Props {
  reserva: DatosReserva;
  calculo: CalculoPrecio;
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
  if (c.modelo.trim().length < 2) return "Escribe el modelo del coche.";
  return null;
}

export default function BookingModal({ reserva, calculo, onClose }: Props) {
  const [cliente, setCliente] = useState<DatosCliente>(clienteVacio);
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  function actualizar(campo: keyof DatosCliente, valor: string) {
    setCliente((c) => ({ ...c, [campo]: valor }));
    setError(null);
  }

  async function confirmarReserva(e: React.FormEvent) {
    e.preventDefault();
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
          entrada: `${reserva.entryDate}T${reserva.entryTime}`,
          salida: `${reserva.exitDate}T${reserva.exitTime}`,
          terminal: reserva.terminal,
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
          <div className="summary-box">
            <div className="summary-item">
              <span>Entrada</span>
              <strong>{formatoFecha(reserva.entryDate, reserva.entryTime)}</strong>
            </div>
            <div className="summary-item">
              <span>Salida</span>
              <strong>{formatoFecha(reserva.exitDate, reserva.exitTime)}</strong>
            </div>
            <div className="summary-item">
              <span>Terminal</span>
              <strong>{reserva.terminal}</strong>
            </div>
            <div className="summary-item">
              <span>Total estimado</span>
              <strong>{formatoEuros(calculo.total)}</strong>
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
                <label htmlFor="modelo">Modelo del coche</label>
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
              ✅ <strong>Reserva recibida.</strong> Te contactaremos para
              confirmar los detalles en {cliente.email || "tu correo"}.
              Recuerda: no pagas nada hasta entregar tu vehículo.
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
