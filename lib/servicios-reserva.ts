/**
 * ============================================================
 *  DETALLE DE SERVICIOS DE UNA RESERVA (reservas_servicios)
 *
 *  Misma convención que parkingplus-dashboard y el Yii2 original:
 *    · `id_reserva` guarda el nro_reserva, no el id de la fila
 *    · el sobre imprime bajo "INCLUYE:" los servicios con fijo = 2
 *      (lavados, techado, nocturnidad…), de ahí que haya que
 *      registrarlos y no solo el parking
 *    · la suma de `precio_total` tiene que cuadrar con el
 *      `monto_total` de la reserva
 * ============================================================
 */

import type { PrismaClient } from "@prisma/client";

/** IDs del catálogo `servicios` (idénticos en la BD del dashboard) */
export const ID_SERVICIO_PARKING     = 6;
export const ID_SERVICIO_SEGURO      = 4;
export const ID_SERVICIO_NOCTURNIDAD = 11;

/**
 * Servicios de lavado que se pueden contratar aparte del plan.
 * Misma lista que el resto de proyectos (useServicios → serviciosExtrasLimpieza).
 */
export const ID_SERVICIOS_LAVADO = [1, 2, 3, 8];

/** Lavado que ya lleva incluido cada plan (mismo mapa que /planes → PlanSelector) */
export const LIMPIEZA_POR_PLAN: Record<number, number> = {
  2: 1, // Premium  → Lavado Exterior
  3: 2, // Priority → Lavado Interior / Exterior
};

/**
 * Crea las filas de `reservas_servicios` de una reserva recién dada de alta.
 * El importe del parking absorbe el resto para que la suma siga cuadrando
 * con el total cobrado, aunque el catálogo tenga otros precios.
 */
export async function registrarServiciosReserva(
  db: PrismaClient,
  params: {
    nroReserva: number;
    /** Días de parking (cantidad de la fila del servicio 6) */
    dias: number;
    /** Total cobrado por la reserva, con descuentos ya aplicados */
    total: number;
    /** 1=Estándar, 2=Premium, 3=Priority, 4=Económico */
    plan?: number;
    /** IDs de `servicios` contratados aparte del parking */
    servicios?: number[];
    /** true si la entrada o la salida caen en la franja nocturna */
    nocturno?: boolean;
  },
): Promise<void> {
  const { nroReserva, total, plan, nocturno } = params;
  const dias = Math.max(1, params.dias);

  const idsExtra: number[] = [ID_SERVICIO_SEGURO];
  const agregar = (id: number) => {
    if (Number.isInteger(id) && id > 0 && id !== ID_SERVICIO_PARKING && !idsExtra.includes(id)) {
      idsExtra.push(id);
    }
  };
  agregar(LIMPIEZA_POR_PLAN[Number(plan)]);
  (params.servicios ?? []).forEach((id) => agregar(Number(id)));
  if (nocturno) agregar(ID_SERVICIO_NOCTURNIDAD);

  const serviciosExtra = await db.servicios.findMany({
    where:  { id: { in: idsExtra } },
    select: { id: true, costo: true },
  });

  // Todos los extras son de cobro único (fijo 1 o 2): cantidad = 1
  const filasExtra = serviciosExtra.map((s) => {
    const costo = Number(s.costo);
    return {
      id_reserva:      nroReserva,
      id_servicio:     s.id,
      cantidad:        1,
      precio_unitario: costo,
      precio_total:    costo,
    };
  });

  const totalExtras  = filasExtra.reduce((acc, f) => acc + f.precio_total, 0);
  const totalParking = Math.max(0, Number((total - totalExtras).toFixed(2)));

  await db.reservas_servicios.createMany({
    data: [
      {
        id_reserva:      nroReserva,
        id_servicio:     ID_SERVICIO_PARKING,
        cantidad:        dias,
        precio_unitario: Number((totalParking / dias).toFixed(2)),
        precio_total:    totalParking,
      },
      ...filasExtra,
    ],
  });
}

/**
 * Reajusta el importe del parking cuando se cambia el precio de una reserva
 * ya creada, para que la suma de `precio_total` siga cuadrando con el total.
 * Los extras (seguro, lavados, nocturnidad) mantienen su precio de catálogo.
 */
export async function reajustarParkingReserva(
  db: PrismaClient,
  nroReserva: number,
  total: number,
): Promise<void> {
  const filas = await db.reservas_servicios.findMany({
    where:  { id_reserva: nroReserva },
    select: { id: true, id_servicio: true, cantidad: true, precio_total: true },
  });

  const parking = filas.find((f) => f.id_servicio === ID_SERVICIO_PARKING);
  if (!parking) return; // reserva antigua sin detalle: nada que reajustar

  const totalExtras = filas
    .filter((f) => f.id_servicio !== ID_SERVICIO_PARKING)
    .reduce((acc, f) => acc + Number(f.precio_total), 0);

  const totalParking = Math.max(0, Number((total - totalExtras).toFixed(2)));
  const dias = Math.max(1, parking.cantidad);

  await db.reservas_servicios.update({
    where: { id: parking.id },
    data: {
      precio_unitario: Number((totalParking / dias).toFixed(2)),
      precio_total:    totalParking,
    },
  });
}
