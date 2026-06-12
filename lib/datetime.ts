/** Utilidades de fechas compartidas entre el calculador, el modal y el email */

/** Opciones de hora en pasos de 30 min: "00:00", "00:30", … "23:30" */
export const OPCIONES_HORA = Array.from({ length: 48 }, (_, i) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(i / 2))}:${i % 2 === 0 ? "00" : "30"}`;
});

/** Convierte un Date a "YYYY-MM-DD" (hora local) para <input type="date"> */
export function aFechaInput(fecha: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}

/** Fecha de entrada por defecto: hoy */
export function entradaPorDefecto(): string {
  return aFechaInput(new Date());
}

/** Fecha de salida por defecto: dentro de 3 días */
export function salidaPorDefecto(): string {
  return aFechaInput(new Date(Date.now() + 86400000 * 3));
}

/** ("2026-06-15", "08:00") → "15 jun 2026 · 08:00" */
export function formatoFecha(fecha: string, hora: string): string {
  if (!fecha) return "--";
  const d = new Date(`${fecha}T${hora || "00:00"}`);
  if (Number.isNaN(d.getTime())) return "--";
  return (
    d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    hora
  );
}

/** "2026-06-15T08:00" → "15 jun 2026 · 08:00" (para el email) */
export function formatoLegible(valor: string): string {
  const [fecha, hora] = valor.split("T");
  return formatoFecha(fecha, hora ?? "00:00");
}
