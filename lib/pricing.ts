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
 * Franja de nocturnidad. Cualquier hora de entrada O salida dentro del rango
 * genera el suplemento.
 *
 * La franja se configura en la BD de ESTA marca
 * (`parkingaeromadrid_db.servicios.hora_inicio` / `hora_fin`, servicio id=11),
 * igual que ya se hace con el coste. Antes estaba fija en 00:30–03:30 aquí.
 *
 * Los llamadores de servidor deben pasar la franja leída de BD
 * (`getFranjaNocturna()` en `lib/precio-db.ts`). Los componentes de cliente no
 * pueden consultar la BD, así que caen al fallback: para ellos es solo una
 * pista visual — el importe que se cobra siempre lo recalcula el servidor.
 */
export interface FranjaNocturna {
  hora_inicio?: string | null;
  hora_fin?: string | null;
}

/** Solo se usa si la BD no trae la franja configurada. */
export const FRANJA_NOCTURNA_FALLBACK = { inicio: "00:29", fin: "04:15" };

/** "HH:MM" → minutos desde medianoche. `null` si no es una hora válida. */
export function horaAMinutos(hora?: string | null): number | null {
  if (!hora) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(String(hora).trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

/** Minutos desde medianoche → "HH:MM". */
function minutosAHora(minutos: number): string {
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

/** Límites de la franja en minutos desde medianoche. */
export function limitesFranjaNocturna(franja?: FranjaNocturna | null): { inicio: number; fin: number } {
  return {
    inicio: horaAMinutos(franja?.hora_inicio) ?? horaAMinutos(FRANJA_NOCTURNA_FALLBACK.inicio)!,
    fin:    horaAMinutos(franja?.hora_fin)    ?? horaAMinutos(FRANJA_NOCTURNA_FALLBACK.fin)!,
  };
}

/** True si una hora "HH:MM" cae dentro de la franja nocturna */
export function esHoraNocturna(hora: string, franja?: FranjaNocturna | null): boolean {
  const totalMin = horaAMinutos(hora);
  if (totalMin === null) return false;
  const { inicio, fin } = limitesFranjaNocturna(franja);
  // Si la franja cruza medianoche (p.ej. 23:00–04:15) el rango se invierte.
  return inicio <= fin
    ? totalMin >= inicio && totalMin <= fin
    : totalMin >= inicio || totalMin <= fin;
}

/** True si la hora de entrada O la de salida es nocturna */
export function aplicaNocturnidad(
  entryTime: string,
  exitTime: string,
  franja?: FranjaNocturna | null
): boolean {
  return esHoraNocturna(entryTime, franja) || esHoraNocturna(exitTime, franja);
}

/** Etiqueta para mostrar al usuario, p.ej. "00:29 - 04:15". */
export function formatFranjaNocturna(franja?: FranjaNocturna | null): string {
  const { inicio, fin } = limitesFranjaNocturna(franja);
  return `${minutosAHora(inicio)} - ${minutosAHora(fin)}`;
}

/* ------------------------------------------------------------------
 *  DESCUENTO MANUAL (panel de administración)
 *
 *  Rebaja un % sobre el total ya calculado. No es un cupón: no lleva
 *  código, no consume usos y solo lo aplica un administrador.
 * ------------------------------------------------------------------ */

/** Normaliza un % de descuento al rango [0, 100]. Devuelve 0 si no es válido. */
export function normalizarDescuentoPct(pct?: number | string | null): number {
  const n = Number(pct);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(100, Math.round(n * 100) / 100);
}

/**
 * Aplica un % de descuento sobre un importe base.
 * Ambos valores se redondean a céntimos para que `base − descuento === total`.
 */
export function aplicarDescuento(
  base: number,
  pct?: number | string | null
): { pct: number; descuento: number; total: number } {
  const p = normalizarDescuentoPct(pct);
  const centimos = (n: number) => Math.round(n * 100) / 100;
  if (p === 0 || !Number.isFinite(base) || base <= 0) {
    return { pct: 0, descuento: 0, total: centimos(Math.max(0, base || 0)) };
  }
  const descuento = centimos((base * p) / 100);
  return { pct: p, descuento, total: centimos(base - descuento) };
}

/** Formatea un importe con 2 decimales: 82.5 → "82.50 €" */
export function formatoEuros(importe: number): string {
  return `${Number(importe).toFixed(2)} €`;
}
