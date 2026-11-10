import { prisma } from "@/lib/prisma";
import type { Parada } from "@/lib/paradas";

/**
 * Acceso a la tabla `paradas` (solo servidor). La lógica pura de intervalos
 * está en `lib/paradas.ts`, que también usa el navegador.
 *
 * Columnas: `fecha_*` es DATE y `hora_*` es TIME. Prisma las entrega como Date
 * en UTC ("2026-12-24T00:00:00Z" y "1970-01-01T12:00:00Z"), así que se leen
 * con toISOString() y no con los getters locales.
 */

type FilaParada = {
  id:           number;
  fecha_inicio: Date;
  hora_inicio:  Date;
  fecha_fin:    Date;
  hora_fin:     Date;
  descripcion:  string | null;
};

/** Fila de la BD → Parada con "YYYY-MM-DDTHH:MM" */
export function filaAParada(f: FilaParada): Parada {
  return {
    id:          f.id,
    inicio:      `${f.fecha_inicio.toISOString().slice(0, 10)}T${f.hora_inicio.toISOString().slice(11, 16)}`,
    fin:         `${f.fecha_fin.toISOString().slice(0, 10)}T${f.hora_fin.toISOString().slice(11, 16)}`,
    descripcion: (f.descripcion ?? "").trim(),
  };
}

/** Hoy (hora del servidor, Europe/Madrid) a medianoche UTC, para filtrar columnas DATE */
function hoyParaColumna(): Date {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return new Date(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T00:00:00.000Z`);
}

/**
 * Paradas ACTIVAS que aún no han terminado (fin hoy o posterior), ordenadas
 * cronológicamente. Es lo que consulta la web pública y la validación de
 * /api/reserva. Las ya pasadas se descartan: no pueden afectar a una reserva.
 */
export async function obtenerParadasActivas(): Promise<Parada[]> {
  const filas = await prisma.paradas.findMany({
    where:   { status: "activo", fecha_fin: { gte: hoyParaColumna() } },
    orderBy: [{ fecha_inicio: "asc" }, { hora_inicio: "asc" }],
  });
  return filas.map(filaAParada);
}

/**
 * Nº de reservas CONFIRMADAS (estatus 1) cuya entrada o salida cae dentro del
 * periodo. Sirve para avisar al admin al crear una parada. Es solo informativo:
 * si falla devuelve null y no impide crear la parada.
 *
 * `fecha_*_completa` es DATETIME; se escribe con `new Date("YYYY-MM-DDTHH:MM")`
 * (hora local de Madrid) en lib/store.ts, así que aquí se construye igual para
 * que la comparación sea simétrica.
 */
export async function contarReservasAfectadas(inicio: string, fin: string): Promise<number | null> {
  try {
    const desde = new Date(inicio);
    const hasta = new Date(fin);
    return await prisma.reservas.count({
      where: {
        estatus: 1,
        OR: [
          { fecha_entrada_completa: { gte: desde, lt: hasta } },
          { fecha_salida_completa:  { gte: desde, lt: hasta } },
        ],
      },
    });
  } catch (err) {
    console.error("[paradas] No se pudo contar reservas afectadas:", err);
    return null;
  }
}
