"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import BookingForm from "./BookingForm";

/**
 * Envuelve <BookingForm> en un overlay modal con tema oscuro.
 * Se abre desde el botón "CALCULAR MI PRECIO" del Hero.
 * Cierra con Escape o clic en el fondo.
 */
export default function BookingFormModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="bform-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Calculadora de precio"
    >
      <div className="bform-modal-wrap">
        <button
          className="bform-close-btn"
          onClick={onClose}
          aria-label="Cerrar calculadora"
          type="button"
        >
          ×
        </button>
        <BookingForm />
      </div>
    </div>,
    document.body
  );
}
