import { OPCIONES_HORA, formatoLegible } from "@/lib/datetime";

/**
 * ============================================================
 *  PARADAS (periodos sin servicio) — landing_parking
 *
 *  Tabla `paradas` (copiada del schema de parkingplus; sin otro sistema que la
 *  administre). Un periodo de parada es un tramo en el que el parking NO recibe
 *  ni entrega vehículos (p. ej. Nochebuena: 24-dic 12:00 → 25-dic 12:00).
 *
 *  Regla (opción A): solo se bloquean las HORAS DE ENTRADA y de SALIDA que caen
 *  dentro del periodo. Un cliente que deja el coche el 23 y lo recoge el 26
 *  puede reservar: su vehículo ya está guardado durante la parada.
 *
 *  El intervalo es [inicio, fin): a la hora de inicio ya estamos cerrados y a
 *  la hora de fin ya hemos reabierto.
 *
 *  Este módulo es PURO (sin Prisma) para poder usarlo en el navegador y en el
 *  servidor. El acceso a la BD está en `lib/paradas-db.ts`.
 *
 *  Zona horaria: todo son "horas de pared" en formato "YYYY-MM-DDTHH:MM" sin
 *  zona (el servidor corre en Europe/Madrid). Se comparan como TEXTO, que en
 *  este formato equivale a comparar cronológicamente. No usar Date.UTC.
 * ============================================================
 */

/** Periodo de parada. `inicio` y `fin` son "YYYY-MM-DDTHH:MM" (hora de pared). */
export interface Parada {
  id:          number;
  inicio:      string;
  fin:         string;
  /** Texto libre; se muestra al cliente (p. ej. "Navidad") */
  descripcion: string;
}

/** Body que envía el formulario de paradas del panel */
export interface ParadaPayload {
  inicio?:      string;
  fin?:         string;
  descripcion?: string | null;
  status?:      "activo" | "inactivo";
}

const RE_FECHA_HORA = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** ¿Es un "YYYY-MM-DDTHH:MM" real (mes 1-12, día existente, hora 0-23, min 0-59)? */
export function esFechaHoraValida(valor: string | null | undefined): valor is string {
  if (!valor) return false;
  const m = RE_FECHA_HORA.exec(valor);
  if (!m) return false;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  if (mo < 1 || mo > 12 || h > 23 || mi > 59) return false;
  // Comprueba que el día exista (31-feb, etc.) con aritmética pura, sin Date
  const bisiesto = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const diasMes = [31, bisiesto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
  return d >= 1 && d <= diasMes;
}

/** "2026-12-24T12:00" → Date a medianoche UTC, para la columna `@db.Date` */
export function fechaParaColumna(valor: string): Date {
  return new Date(`${valor.slice(0, 10)}T00:00:00.000Z`);
}

/** "2026-12-24T12:00" → Date "1970-01-01T12:00:00Z", para la columna `@db.Time` */
export function horaParaColumna(valor: string): Date {
  return new Date(`1970-01-01T${valor.slice(11, 16)}:00.000Z`);
}

/**
 * Parada que contiene el momento dado, o null si está abierto.
 * `momento` acepta "YYYY-MM-DDTHH:MM" (se ignoran segundos si los hubiera).
 */
export function paradaQueContiene(momento: string, paradas: Parada[]): Parada | null {
  const t = momento.slice(0, 16);
  return paradas.find((p) => t >= p.inicio && t < p.fin) ?? null;
}

/** ¿Está cerrado a esa fecha ("YYYY-MM-DD") y hora ("HH:MM")? */
export function horaBloqueada(fecha: string, hora: string, paradas: Parada[]): boolean {
  if (!fecha || !hora) return false;
  return paradaQueContiene(`${fecha}T${hora}`, paradas) !== null;
}

/** ¿Está cerrado TODO el día (ninguna hora de entrada/salida disponible)? */
export function diaCerrado(fecha: string, paradas: Parada[]): boolean {
  if (!fecha || paradas.length === 0) return false;
  return OPCIONES_HORA.every((h) => horaBloqueada(fecha, h, paradas));
}

/** Horas de la lista base que NO caen dentro de ninguna parada ese día */
export function horasDisponibles(
  fecha: string,
  paradas: Parada[],
  base: readonly string[] = OPCIONES_HORA,
): string[] {
  if (!fecha || paradas.length === 0) return [...base];
  return base.filter((h) => !horaBloqueada(fecha, h, paradas));
}

/**
 * Hora libre más cercana a `hora` ese día: primero hacia delante y, si no hay,
 * hacia atrás. null si no queda ninguna.
 */
export function horaLibreMasCercana(
  fecha: string,
  hora: string,
  paradas: Parada[],
  base: readonly string[] = OPCIONES_HORA,
): string | null {
  const libres = horasDisponibles(fecha, paradas, base);
  if (libres.length === 0) return null;
  const siguiente = libres.find((h) => h >= hora);
  if (siguiente) return siguiente;
  return libres[libres.length - 1];
}

/** "24 dic 2026 · 12:00 → 25 dic 2026 · 12:00" */
export function describirRango(p: Pick<Parada, "inicio" | "fin">): string {
  return `${formatoLegible(p.inicio)} → ${formatoLegible(p.fin)}`;
}

/** "del 24 dic 2026 · 12:00 al 25 dic 2026 · 12:00" (para frases) */
export function rangoEnFrase(p: Pick<Parada, "inicio" | "fin">): string {
  return `del ${formatoLegible(p.inicio)} al ${formatoLegible(p.fin)}`;
}
