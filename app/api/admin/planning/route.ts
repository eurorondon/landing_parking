import { NextRequest, NextResponse } from "next/server";

// ── Plan map (planId almacenado en reservas.plan) ──────────────────────────────
const PLAN_NOMBRE: Record<number, string> = {
  1: "Estándar",
  2: "Premium",
  3: "Priority",
};

/** Formatea un Time de Prisma (Date cuya parte de fecha es 1970-01-01) a "HH:MM" */
function horaDB(d: Date | null): string {
  if (!d) return "—";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Formatea un Date de Prisma a "DD/MM/YYYY" en hora local del servidor */
function fechaDB(d: Date | null): string {
  if (!d) return "—";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * GET /api/admin/planning?fecha=YYYY-MM-DD
 *
 * Devuelve { entradas: [...], salidas: [...] }, incluyendo
 * los servicios de cada reserva (campo 'servicios') para el ticket PDF.
 *
 * Se excluyen reservas canceladas (estatus = 0).
 */
export async function GET(req: NextRequest) {
  const fecha = req.nextUrl.searchParams.get("fecha"); // "YYYY-MM-DD"

  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json(
      { ok: false, error: "Parámetro requerido: fecha (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    const dateInicio = new Date(`${fecha}T00:00:00`);
    const dateFin    = new Date(`${fecha}T23:59:59`);

    // Campos de relacionados comunes
    const include = {
      clientes: { select: { nombre_completo: true, movil: true } },
      coches:   { select: { matricula: true, marca: true, modelo: true } },
    } as const;

    const [rowsE, rowsS] = await Promise.all([
      // Entradas del día
      prisma.reservas.findMany({
        where: {
          fecha_entrada: { gte: dateInicio, lte: dateFin },
          estatus:       { not: 0 },
        },
        orderBy: { hora_entrada: "asc" },
        include,
      }),
      // Salidas del día
      prisma.reservas.findMany({
        where: {
          fecha_salida: { gte: dateInicio, lte: dateFin },
          estatus:      { not: 0 },
        },
        orderBy: { hora_salida: "asc" },
        include,
      }),
    ]);

    // Servicios para todas las reservas del día (una sola query)
    const todosIds = [...new Set([...rowsE.map((r) => r.id), ...rowsS.map((r) => r.id)])];

    const serviciosDB = todosIds.length > 0
      ? await prisma.reservas_servicios.findMany({
          where: { id_reserva: { in: todosIds } },
          include: {
            servicios: { select: { nombre_servicio: true, fijo: true } },
          },
        })
      : [];

    // Agrupar por id_reserva
    type Servicio = { nombre_servicio: string; fijo: number };
    const serviciosPor: Record<number, Servicio[]> = {};
    for (const s of serviciosDB) {
      const k = s.id_reserva ?? 0;
      if (!serviciosPor[k]) serviciosPor[k] = [];
      serviciosPor[k].push({
        nombre_servicio: s.servicios.nombre_servicio,
        fijo:            s.servicios.fijo,
      });
    }

    function mapRow(r: (typeof rowsE)[0]) {
      const total =
        typeof (r.monto_total as { toNumber?: () => number }).toNumber === "function"
          ? (r.monto_total as { toNumber: () => number }).toNumber()
          : Number(r.monto_total);

      const marcaModelo = [r.coches?.marca, r.coches?.modelo]
        .filter(Boolean)
        .join(" ")
        .toUpperCase() || "—";

      return {
        id:               r.id,
        nro_reserva:      String(r.nro_reserva),
        fecha_entrada:    fechaDB(r.fecha_entrada),
        hora_entrada:     horaDB(r.hora_entrada as Date | null),
        fecha_salida:     fechaDB(r.fecha_salida),
        hora_salida:      horaDB(r.hora_salida as Date | null),
        terminal_entrada: r.terminal_entrada,
        terminal_salida:  r.terminal_salida,
        monto_total:      total,
        pago_confirmado:  r.pago_confirmado ?? 0,
        id_tipo_pago:     r.id_tipo_pago ?? 0,
        medio_reserva:    r.medio_reserva,
        plan:             r.plan ?? 0,
        plan_nombre:      PLAN_NOMBRE[r.plan ?? 0] ?? "Estándar",
        nombre:           r.clientes?.nombre_completo ?? "—",
        movil:            r.clientes?.movil          ?? "—",
        matricula:        r.coches?.matricula        ?? "—",
        marca:            r.coches?.marca            ?? "",
        modelo:           r.coches?.modelo           ?? "",
        marcaModelo,
        servicios:        serviciosPor[r.id]         ?? [],
      };
    }

    return NextResponse.json({
      ok:       true,
      fecha,
      entradas: rowsE.map(mapRow),
      salidas:  rowsS.map(mapRow),
    });
  } catch (err) {
    console.error("[planning] GET:", err);
    return NextResponse.json(
      { ok: false, error: "Error al consultar la base de datos" },
      { status: 500 },
    );
  }
}
