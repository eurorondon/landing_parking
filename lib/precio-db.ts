import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/store";

/**
 * ============================================================
 *  CÁLCULO DE PRECIO — fuente ÚNICA (servidor)
 *
 *  Replica la lógica del dashboard (parkingplus-dashboard) usando
 *  las tablas del schema Prisma compartido. Lo usan tanto la web
 *  pública (/api/precio) como el panel de administración, para que
 *  el precio salga siempre del mismo sitio:
 *    - registro_precios    → precio base por días (base + €/día)
 *    - precio_temporada    → suplemento de temporada (si está activo)
 *    - servicios id=4      → coste del seguro (se suma aparte)
 *    - servicios id=11     → suplemento nocturno (00:30–03:30)
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

/**
 * Lógica de bloques (igual que Yii2):
 *   1-18 días   → N × precioDia + planCosto  [+ N × temporadaRate]
 *   19-30 días  → precioBloque               [+ 30 × temporadaRate]
 *   >30 días    → bloques de 30; resto >= 18 → bloque completo,
 *                 resto < 18 → resto × precioDia (sin temporada)
 */
function calcularPrecioParking(
  dias: number,
  precioBloque: number,
  precioDia: number,
  planCosto: number,
  temporadaRate: number
): number {
  let total = 0;
  let remaining = dias;

  if (dias <= 18) {
    return dias * precioDia + planCosto + dias * temporadaRate;
  }
  if (dias <= 30) {
    return precioBloque + 30 * temporadaRate;
  }

  while (remaining > 30) {
    total += precioBloque + 30 * temporadaRate;
    remaining -= 30;
  }
  if (remaining >= 18) {
    total += precioBloque + 30 * temporadaRate;
  } else {
    total += remaining * precioDia; // sin temporada en el resto (igual que Yii2)
  }
  return total;
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
}): Promise<PrecioReserva> {
  const { dias, nocturno, esAutocaravana } = params;

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

  // Suplemento de temporada activa
  const precioTemporada = await prisma.precio_temporada.findFirst({
    where: { status: "activo" },
  });
  const temporadaRate = precioTemporada ? Number(precioTemporada.precio) : 0;

  let costoParking: number;

  if (dias <= 30) {
    // Búsqueda exacta en tabla para 1-30 días
    const registro = await prisma.registro_precios.findFirst({
      where: { cantidad: dias },
      orderBy: { id: "asc" },
    });
    costoParking = Number(registro?.costo ?? dias * precioDia + planCosto);
    if (temporadaRate > 0) {
      costoParking += dias * temporadaRate;
    }
  } else {
    // Fórmula de bloques para >30 días
    costoParking = calcularPrecioParking(dias, precioBloque, precioDia, planCosto, temporadaRate);
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
