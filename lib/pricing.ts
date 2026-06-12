/**
 * ============================================================
 *  TARIFAS DEL PARKING
 *  ➜ ⚠️ CAMBIAR: ajustar aquí los precios reales del negocio.
 *
 *  Funcionamiento (igual que el calculador de la landing):
 *  - Se cobra por días. Un día empezado cuenta como día completo.
 *  - Estancias de 1 a 6 días:  BASE + días × PRECIO_DIA_CORTO
 *  - De 7 a 14 días:           PRECIO_SEMANA + días extra × PRECIO_DIA_MEDIO
 *  - 15 días o más:            PRECIO_QUINCENA + días extra × PRECIO_DIA_LARGO
 *  - El total se redondea hacia arriba al euro.
 * ============================================================
 */
export const TARIFAS = {
  BASE: 18,             // € fijos de la estancia corta
  PRECIO_DIA_CORTO: 5,  // €/día (1-6 días)
  PRECIO_SEMANA: 45,    // € por los primeros 7 días
  PRECIO_DIA_MEDIO: 4,  // €/día extra (7-14 días)
  PRECIO_QUINCENA: 76,  // € por los primeros 15 días
  PRECIO_DIA_LARGO: 3.5 // €/día extra (15+ días)
} as const;

const MS_POR_DIA = 1000 * 60 * 60 * 24;

export interface CalculoPrecio {
  dias: number;
  total: number;
}

/**
 * Calcula el precio de la reserva.
 * Devuelve null si las fechas no son válidas (salida <= entrada).
 */
export function calcularPrecio(entrada: Date, salida: Date): CalculoPrecio | null {
  const ms = salida.getTime() - entrada.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;

  const dias = Math.max(1, Math.ceil(ms / MS_POR_DIA));

  let total = TARIFAS.BASE + dias * TARIFAS.PRECIO_DIA_CORTO;
  if (dias >= 7) total = TARIFAS.PRECIO_SEMANA + (dias - 7) * TARIFAS.PRECIO_DIA_MEDIO;
  if (dias >= 15) total = TARIFAS.PRECIO_QUINCENA + (dias - 15) * TARIFAS.PRECIO_DIA_LARGO;

  return { dias, total: Math.ceil(total) };
}

/** Formatea un importe: 82 → "82€" */
export function formatoEuros(importe: number): string {
  return `${importe}€`;
}
