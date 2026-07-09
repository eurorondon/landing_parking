/**
 * ============================================================
 *  UTILIDADES DE PRECIO — landing_parking
 *
 *  El precio real se obtiene desde la BD (registro_precios +
 *  precio_temporada + servicios) a través de /api/precio?dias=N.
 *  Este módulo exporta helpers de cálculo de días, nocturnidad
 *  y formato — sin tarifas hardcodeadas.
 * ============================================================
 */

const MS_POR_HORA = 1000 * 3600;

export interface CalculoPrecio {
  dias:             number;
  costoParking:     number;
  costoSeguro:      number;
  /** 0 cuando no aplica nocturnidad */
  costoNocturnidad: number;
  /** 0 cuando el vehículo no es autocaravana; recargo total (dias × €/día) */
  costoAutocaravana: number;
  total:            number;
}

/**
 * Días de parking reales replicando la lógica Yii2 del dashboard:
 *   diffHours = round(diffMs / 3600000)
 *   dias      = ceil(diffHours / 24)
 *
 * → Exactamente 24 h = 1 día. Fracciones se redondean hacia arriba.
 */
export function calculateRawParkingDays(entrada: Date, salida: Date): number {
  const diffMs    = salida.getTime() - entrada.getTime();
  const diffHours = Math.round(diffMs / MS_POR_HORA);
  return Math.ceil(diffHours / 24);
}

/**
 * Rango de nocturnidad: 00:30 – 03:30 (en minutos del día).
 * Igual que el dashboard: cualquier hora de entrada O salida
 * dentro del rango genera el suplemento.
 */
const NOCTURNO_INICIO = 30;   // 00:30
const NOCTURNO_FIN    = 210;  // 03:30

/** True si una hora "HH:MM" cae dentro del rango nocturno */
export function esHoraNocturna(hora: string): boolean {
  const [h, m] = hora.split(":").map(Number);
  const totalMin = (h || 0) * 60 + (m || 0);
  return totalMin >= NOCTURNO_INICIO && totalMin <= NOCTURNO_FIN;
}

/** True si la hora de entrada O la de salida es nocturna */
export function aplicaNocturnidad(entryTime: string, exitTime: string): boolean {
  return esHoraNocturna(entryTime) || esHoraNocturna(exitTime);
}

/** Formatea un importe con 2 decimales: 82.5 → "82.50 €" */
export function formatoEuros(importe: number): string {
  return `${Number(importe).toFixed(2)} €`;
}
