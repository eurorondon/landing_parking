/**
 * ============================================================
 *  UTILIDADES DE PRECIO — landing_parking
 *
 *  El precio real se obtiene desde la BD (registro_precios2 +
 *  precio_temporada + servicios) a través de /api/precio?dias=N.
 *  Este módulo sólo exporta helpers de cálculo de días y formato.
 * ============================================================
 */

const MS_POR_HORA = 1000 * 3600;

export interface CalculoPrecio {
  dias: number;
  costoParking: number;
  costoSeguro:  number;
  total: number;
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

/** Formatea un importe con 2 decimales: 82.5 → "82.50 €" */
export function formatoEuros(importe: number): string {
  return `${Number(importe).toFixed(2)} €`;
}
