import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  esFechaHoraValida,
  fechaParaColumna,
  horaParaColumna,
  type ParadaPayload,
} from "@/lib/paradas";
import { filaAParada, contarReservasAfectadas } from "@/lib/paradas-db";

/**
 * Gestión de periodos de parada desde el panel (protegido por el middleware
 * de /admin).
 *
 *   GET  /api/admin/paradas  → lista completa, la más reciente primero
 *   POST /api/admin/paradas  → crea una parada
 *
 * El formulario envía `inicio` y `fin` como "YYYY-MM-DDTHH:MM". El intervalo es
 * [inicio, fin): a `inicio` ya estamos cerrados, a `fin` ya hemos reabierto.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const filas = await prisma.paradas.findMany({
    orderBy: [{ fecha_inicio: "desc" }, { hora_inicio: "desc" }],
  });
  return NextResponse.json({
    ok: true,
    paradas: filas.map((f) => ({ ...filaAParada(f), status: f.status })),
  });
}

export async function POST(request: Request) {
  let body: ParadaPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }

  const { inicio, fin } = body;
  if (!esFechaHoraValida(inicio) || !esFechaHoraValida(fin)) {
    return NextResponse.json(
      { ok: false, error: "Indica fecha y hora de inicio y de fin" },
      { status: 400 },
    );
  }
  if (fin <= inicio) {
    return NextResponse.json(
      { ok: false, error: "El fin debe ser posterior al inicio" },
      { status: 400 },
    );
  }

  try {
    const fila = await prisma.paradas.create({
      data: {
        fecha_inicio: fechaParaColumna(inicio),
        hora_inicio:  horaParaColumna(inicio),
        fecha_fin:    fechaParaColumna(fin),
        hora_fin:     horaParaColumna(fin),
        descripcion:  (body.descripcion ?? "").trim().slice(0, 255),
        status:       body.status === "inactivo" ? "inactivo" : "activo",
      },
    });
    const reservasAfectadas = await contarReservasAfectadas(inicio, fin);
    return NextResponse.json({
      ok: true,
      parada: { ...filaAParada(fila), status: fila.status },
      reservasAfectadas,
    });
  } catch (err) {
    console.error("[admin/paradas] Error al crear:", err);
    return NextResponse.json({ ok: false, error: "No se pudo crear la parada" }, { status: 500 });
  }
}
