"use client";
/**
 * BotonesTickets — 3 botones para generar PDFs en cola de impresión.
 *
 * Genera UN PDF con TODAS las reservas del día (una página por reserva)
 * y lo abre en una nueva pestaña para imprimir.
 *
 * Tipos:
 *  • "ticket"   → TicketCompleto (227×637.8pt) — ticket térmico largo
 *  • "sobre"    → TicketSobre   (227×391pt)    — etiqueta sobre
 *  • "parking"  → TicketParking (227×198pt)    — solo matrícula + fecha salida
 */

import React, { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReservaPDF } from "./pdf/tipos";

// Carga diferida: los módulos PDF usan APIs de browser
const cargarTicketCompleto = () => import("./pdf/TicketCompleto").then((m) => m.default);
const cargarTicketSobre    = () => import("./pdf/TicketSobre").then((m) => m.default);
const cargarTicketParking  = () => import("./pdf/TicketParking").then((m) => m.default);

interface Props {
  reservas: ReservaPDF[];
  titulo:   string;  // "Entradas" o "Salidas" — para el label del botón
}

export default function BotonesTickets({ reservas, titulo }: Props) {
  const [listo,    setListo]    = useState(false);
  const [cargando, setCargando] = useState(false);

  // Precarga los módulos PDF al montar para que el primer clic sea rápido
  useEffect(() => {
    Promise.all([
      cargarTicketCompleto(),
      cargarTicketSobre(),
      cargarTicketParking(),
    ])
      .then(() => setListo(true))
      .catch(() => setListo(true)); // aunque falle preload, dejamos intentar al usuario
  }, []);

  async function abrirPDF(tipo: "ticket" | "sobre" | "parking") {
    if (reservas.length === 0) {
      alert(`No hay ${titulo.toLowerCase()} para imprimir.`);
      return;
    }
    setCargando(true);
    try {
      let doc: React.ReactElement;

      switch (tipo) {
        case "ticket": {
          const Comp = await cargarTicketCompleto();
          doc = React.createElement(Comp, { reservas });
          break;
        }
        case "sobre": {
          const Comp = await cargarTicketSobre();
          doc = React.createElement(Comp, { reservas });
          break;
        }
        case "parking": {
          const Comp = await cargarTicketParking();
          doc = React.createElement(Comp, { reservas });
          break;
        }
      }

      const blob = await pdf(doc as React.ReactElement<DocumentProps>).toBlob();
      const url  = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("[BotonesTickets] Error generando PDF:", err);
      alert("Error al generar el PDF. Revisa la consola.");
    } finally {
      setCargando(false);
    }
  }

  const disabled = cargando || !listo || reservas.length === 0;

  return (
    <div className="botones-tickets">
      <button
        className="btn btn-sm btn-primary"
        disabled={disabled}
        onClick={() => abrirPDF("ticket")}
        title={`Generar tickets completos de todas las ${titulo}`}
      >
        {cargando ? "⏳ Generando…" : `🎫 Tickets (${reservas.length})`}
      </button>
      <button
        className="btn btn-sm btn-ghost"
        disabled={disabled}
        onClick={() => abrirPDF("sobre")}
        title={`Generar etiquetas de sobre de todas las ${titulo}`}
      >
        {cargando ? "⏳" : `✉️ Sobres`}
      </button>
      <button
        className="btn btn-sm btn-ghost"
        disabled={disabled}
        onClick={() => abrirPDF("parking")}
        title={`Generar tickets parking de todas las ${titulo}`}
      >
        {cargando ? "⏳" : `🅿️ Parking`}
      </button>
      {!listo && (
        <span className="text-muted" style={{ fontSize: 11 }}>
          Precargando módulos PDF…
        </span>
      )}
    </div>
  );
}
