"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { format } from "date-fns";
import "react-day-picker/style.css";

interface Props {
  /** Valor en formato "YYYY-MM-DD" (o "" si no hay fecha) */
  value: string;
  onChange: (valor: string) => void;
  /** Fecha mínima seleccionable, formato "YYYY-MM-DD" */
  min?: string;
  disabled?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  /** Título mostrado arriba del calendario (ej. "Fecha de entrada") */
  title?: string;
  /** Clase del botón: "datepicker-trigger--light" (form claro) o "--dark" (modal) */
  triggerClassName?: string;
}

/** "YYYY-MM-DD" → Date local (medianoche), sin desfase de zona horaria */
function parse(valor: string): Date | undefined {
  if (!valor) return undefined;
  const [y, m, d] = valor.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** Date → "YYYY-MM-DD" usando componentes locales (sin conversión de zona) */
function toStr(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Selector de fecha con calendario propio (react-day-picker), en lugar del
 * <input type="date"> nativo. Al tocar un día se selecciona y cierra
 * directamente: no aparece el botón "Establecer" de Android.
 *
 * El calendario se renderiza en un portal (document.body) como diálogo
 * centrado con fondo, para que ningún contenedor lo recorte (importante en
 * móvil, dentro de rejillas o modales).
 * Estilos en landing.css (.datepicker, .datepicker-trigger*, .datepicker-overlay,
 * .datepicker-popover).
 */
export default function DatePicker({
  value,
  onChange,
  min,
  disabled,
  ariaLabel,
  placeholder = "Selecciona fecha",
  title,
  triggerClassName = "datepicker-trigger--light",
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const selected = parse(value);
  const minDate = parse(min ?? "");

  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const scrollPrev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = scrollPrev;
    };
  }, [open]);

  return (
    <div className="datepicker">
      <button
        type="button"
        className={`datepicker-trigger ${triggerClassName}${value ? "" : " is-placeholder"}`}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        {selected ? format(selected, "d MMM yyyy", { locale: es }) : placeholder}
      </button>

      {open && mounted &&
        createPortal(
          <div
            className="datepicker-overlay"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div className="datepicker-popover" role="dialog" aria-modal="true" aria-label={title ?? ariaLabel}>
              {title && (
                <div className="datepicker-header">
                  <span className="datepicker-header-title">{title}</span>
                  <button
                    type="button"
                    className="datepicker-header-close"
                    aria-label="Cerrar"
                    onClick={() => setOpen(false)}
                  >
                    ✕
                  </button>
                </div>
              )}
              <DayPicker
                mode="single"
                locale={es}
                showOutsideDays
                selected={selected}
                defaultMonth={selected ?? minDate}
                startMonth={minDate}
                disabled={minDate ? { before: minDate } : undefined}
                onSelect={(d) => {
                  if (d) {
                    onChange(toStr(d));
                    setOpen(false);
                  }
                }}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
