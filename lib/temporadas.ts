/**
 * ============================================================
 *  TEMPORADAS DE PRECIO — landing_parking
 *
 *  Tabla `precio_temporada` (copiada del schema de parkingplus, sin otro
 *  sistema que la administre). Permite subir/bajar el precio por día durante
 *  un rango de fechas concreto (p. ej. verano: 1-20 sept, +3 €/día).
 *
 *  `calcularPrecioReserva` (lib/precio-db.ts) solo aplica una temporada si la
 *  fecha de ENTRADA de la reserva cae dentro de [fecha_inicio, fecha_fin]:
 *  una reserva de agosto nunca cobra el recargo de una temporada de
 *  septiembre, aunque esté marcada "activo".
 * ============================================================
 */

/** "YYYY-MM-DD" (formulario del admin) → Date a medianoche UTC, para columnas `@db.Date`. */
export function parseFechaTemporada(valor: string | null | undefined): Date | null {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  return new Date(`${valor}T00:00:00.000Z`);
}

/** Body que envía el formulario de temporadas del panel */
export interface TemporadaPayload {
  fechaInicio?: string;
  fechaFin?:    string;
  precio?:      number;
  descripcion?: string | null;
  status?:      "activo" | "inactivo";
}
