import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/store";

/**
 * ============================================================
 *  CÁLCULO DE PRECIO — fuente ÚNICA (servidor)
 *
 *  Replica la lógica del dashboard (parkingplus-dashboard) sobre la BD PROPIA
 *  de esta marca: misma estructura de tablas, base distinta. Lo usan tanto la web
 *  pública (/api/precio) como el panel de administración, para que
 *  el precio salga siempre del mismo sitio:
 *    - registro_precios    → precio base por días (base + €/día)
 *    - precio_temporada    → suplemento de temporada (si está activo)
 *    - servicios id=4      → coste del seguro (se suma aparte)
 *    - servicios id=11     → suplemento nocturno (coste + franja horaria)
 *    - config.autocaravanaSurcharge → recargo €/día de autocaravana
 * ============================================================
 */

export interface PrecioReserva {
  costo_parking:      number;
  costo_seguro:       number;
  costo_nocturnidad:  number;
  costo_autocaravana: number;
  total:              number;
}

/** "YYYY-MM-DD..." → medianoche UTC, para comparar contra columnas `@db.Date`
 *  (MySQL las guarda sin hora ni zona; Prisma las representa en UTC). */
function fechaUTC(fechaISO: string): Date {
  return new Date(`${fechaISO.slice(0, 10)}T00:00:00.000Z`);
}

/**
 * Lógica de bloques (igual que Yii2), SIN temporada (se suma aparte, prorrateada
 * por día de calendario — ver `calcularSurchargeTemporada`):
 *   1-18 días   → N × precioDia + planCosto
 *   19-30 días  → precioBloque
 *   >30 días    → bloques de 30; resto >= 18 → bloque completo,
 *                 resto < 18 → resto × precioDia
 */
function calcularPrecioParking(
  dias: number,
  precioBloque: number,
  precioDia: number,
  planCosto: number
): number {
  let total = 0;
  let remaining = dias;

  if (dias <= 18) {
    return dias * precioDia + planCosto;
  }
  if (dias <= 30) {
    return precioBloque;
  }

  while (remaining > 30) {
    total += precioBloque;
    remaining -= 30;
  }
  if (remaining >= 18) {
    total += precioBloque;
  } else {
    total += remaining * precioDia;
  }
  return total;
}

/**
 * Recargo de temporada prorrateado por día de calendario de la estancia
 * (día 1 = fecha de entrada, día 2 = entrada + 1, …). Cada día suma el
 * €/día de la temporada activa que lo cubra (si dos temporadas se solapan,
 * gana la de inicio más reciente); los días fuera de cualquier temporada no
 * suman nada. Sustituye al recargo "todo o nada" que antes solo miraba si
 * la fecha de ENTRADA caía dentro del rango de la temporada.
 */
async function calcularSurchargeTemporada(entrada: string, dias: number): Promise<number> {
  if (dias <= 0) return 0;

  const primerDia = fechaUTC(entrada);
  const ultimoDia = new Date(primerDia);
  ultimoDia.setUTCDate(ultimoDia.getUTCDate() + dias - 1);

  const temporadas = await prisma.precio_temporada.findMany({
    where: {
      status:       "activo",
      fecha_inicio: { lte: ultimoDia },
      fecha_fin:    { gte: primerDia },
    },
    orderBy: { fecha_inicio: "desc" },
  });
  if (temporadas.length === 0) return 0;

  let total = 0;
  for (let i = 0; i < dias; i++) {
    const dia = new Date(primerDia);
    dia.setUTCDate(dia.getUTCDate() + i);
    const temporada = temporadas.find((t) => t.fecha_inicio <= dia && t.fecha_fin >= dia);
    if (temporada) total += Number(temporada.precio);
  }
  return total;
}

/** Solo se usa si la BD no responde al cargar la home (evita tumbar el hero). */
const PRECIO_DESDE_FALLBACK = 30.98;

/**
 * Precio "desde" que se muestra en el hero de la home (1 día de parking +
 * seguro incluido, sin recargos de temporada/nocturnidad/autocaravana).
 */
export async function getPrecioDesde(): Promise<number> {
  try {
    const [registroUnDia, seguro] = await Promise.all([
      prisma.registro_precios.findFirst({ where: { cantidad: 1 }, orderBy: { id: "asc" } }),
      prisma.servicios.findFirst({ where: { id: 4 }, select: { costo: true } }),
    ]);
    return Number(registroUnDia?.costo ?? 0) + Number(seguro?.costo ?? 0);
  } catch (err) {
    console.error("[getPrecioDesde] no se pudo consultar la BD, usando fallback:", err);
    return PRECIO_DESDE_FALLBACK;
  }
}

/**
 * Calcula el precio completo de una reserva a partir de los días de
 * parking, si aplica nocturnidad y si el vehículo es autocaravana.
 * Devuelve el desglose y el total (seguro y recargos incluidos).
 */
export async function calcularPrecioReserva(params: {
  dias: number;
  nocturno: boolean;
  esAutocaravana: boolean;
  /** Fecha de entrada ("YYYY-MM-DD" o "YYYY-MM-DDTHH:mm"). Determina qué
   *  temporada de `precio_temporada` aplica; sin ella no se aplica ninguna. */
  entrada?: string;
}): Promise<PrecioReserva> {
  const { dias, nocturno, esAutocaravana, entrada } = params;

  // Recargo por día de autocaravana (configurable desde el panel)
  const recargoAutocaravanaDia = esAutocaravana
    ? Number((await getConfig()).autocaravanaSurcharge || 0)
    : 0;

  // Consultar seguro (id=4) y nocturnidad (id=11) en paralelo
  const [seguro, nocturnidadSvc] = await Promise.all([
    prisma.servicios.findFirst({ where: { id: 4  }, select: { costo: true } }),
    prisma.servicios.findFirst({ where: { id: 11 }, select: { costo: true } }),
  ]);

  const costoSeguro      = Number(seguro?.costo      || 0);
  const costoNocturnidad = Number(nocturnidadSvc?.costo || 10); // fallback 10 € si no existe en BD

  if (dias <= 0) {
    const total = costoSeguro + (nocturno ? costoNocturnidad : 0);
    return { costo_parking: 0, costo_seguro: costoSeguro, costo_nocturnidad: costoNocturnidad, costo_autocaravana: 0, total };
  }

  // Derivar precioDia, planCosto y precioBloque desde la tabla
  const [r1, r2, r30] = await Promise.all([
    prisma.registro_precios.findFirst({ where: { cantidad: 1  } }),
    prisma.registro_precios.findFirst({ where: { cantidad: 2  } }),
    prisma.registro_precios.findFirst({ where: { cantidad: 30 } }),
  ]);

  const precioDia    = r1 && r2 ? Number(r2.costo) - Number(r1.costo) : 7;
  const planCosto    = r1 ? Number(r1.costo) - precioDia : 23.98;
  const precioBloque = r30 ? Number(r30.costo) : 18 * precioDia + planCosto;

  // Suplemento de temporada: prorrateado por cada día de calendario de la
  // estancia que caiga dentro de [fecha_inicio, fecha_fin] de una temporada
  // activa. Los días fuera de rango no suman nada (p. ej. una reserva que
  // empieza antes de la temporada solo paga el recargo en las noches que
  // realmente se solapan con ella).
  const temporadaSurcharge = entrada ? await calcularSurchargeTemporada(entrada, dias) : 0;

  let costoParking: number;

  if (dias <= 30) {
    // Búsqueda exacta en tabla para 1-30 días
    const registro = await prisma.registro_precios.findFirst({
      where: { cantidad: dias },
      orderBy: { id: "asc" },
    });
    costoParking = Number(registro?.costo ?? dias * precioDia + planCosto) + temporadaSurcharge;
  } else {
    // Fórmula de bloques para >30 días
    costoParking = calcularPrecioParking(dias, precioBloque, precioDia, planCosto) + temporadaSurcharge;
  }

  const costoAutocaravana = dias * recargoAutocaravanaDia;
  const total = costoParking + costoSeguro + (nocturno ? costoNocturnidad : 0) + costoAutocaravana;

  return {
    costo_parking:      costoParking,
    costo_seguro:       costoSeguro,
    costo_nocturnidad:  costoNocturnidad,  // siempre devuelto; el cliente decide si aplica
    costo_autocaravana: costoAutocaravana, // recargo total autocaravana (0 si no aplica)
    total,
  };
}
