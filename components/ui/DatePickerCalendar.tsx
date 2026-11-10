"use client";

import { DayPicker, type Matcher } from "react-day-picker";
import { es } from "react-day-picker/locale";
import "react-day-picker/style.css";

interface Props {
  selected?: Date;
  minDate?: Date;
  /** Devuelve true para los días ("YYYY-MM-DD") que no se pueden elegir */
  isDateDisabled?: (fecha: string) => boolean;
  onSelect: (d: Date) => void;
}

/** Date local → "YYYY-MM-DD" con componentes locales (sin conversión de zona) */
function aTexto(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Calendario cargado bajo demanda desde DatePicker (next/dynamic). */
export default function DatePickerCalendar({ selected, minDate, isDateDisabled, onSelect }: Props) {
  const deshabilitados: Matcher[] = [];
  if (minDate) deshabilitados.push({ before: minDate });
  if (isDateDisabled) deshabilitados.push((d: Date) => isDateDisabled(aTexto(d)));

  return (
    <DayPicker
      mode="single"
      locale={es}
      showOutsideDays
      selected={selected}
      defaultMonth={selected ?? minDate}
      startMonth={minDate}
      disabled={deshabilitados.length > 0 ? deshabilitados : undefined}
      onSelect={(d) => {
        if (d) onSelect(d);
      }}
    />
  );
}
