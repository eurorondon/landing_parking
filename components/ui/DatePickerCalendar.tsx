"use client";

import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import "react-day-picker/style.css";

interface Props {
  selected?: Date;
  minDate?: Date;
  onSelect: (d: Date) => void;
}

/** Calendario cargado bajo demanda desde DatePicker (next/dynamic). */
export default function DatePickerCalendar({ selected, minDate, onSelect }: Props) {
  return (
    <DayPicker
      mode="single"
      locale={es}
      showOutsideDays
      selected={selected}
      defaultMonth={selected ?? minDate}
      startMonth={minDate}
      disabled={minDate ? { before: minDate } : undefined}
      onSelect={(d) => {
        if (d) onSelect(d);
      }}
    />
  );
}
