import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFechaTemporada, type TemporadaPayload } from "@/lib/temporadas";

/**
 * Gestión de temporadas de precio desde el panel (protegido por el
 * middleware de /admin).
 *
 *   GET  /api/admin/temporadas  → lista completa, fecha de inicio más reciente primero
 *   POST /api/admin/temporadas  → crea una temporada
 */

export async function GET() {
  const temporadas = await prisma.precio_temporada.findMany({ orderBy: { fecha_inicio: "desc" } });
  return NextResponse.json({
    ok: true,
    temporadas: temporadas.map((t) => ({ ...t, precio: Number(t.precio) })),
  });
}

export async function POST(request: Request) {
  let body: TemporadaPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }

  const fechaInicio = parseFechaTemporada(body.fechaInicio);
  const fechaFin    = parseFechaTemporada(body.fechaFin);
  const precio      = Number(body.precio);

  if (!fechaInicio || !fechaFin) {
    return NextResponse.json({ ok: false, error: "Indica fecha de inicio y de fin (YYYY-MM-DD)" }, { status: 400 });
  }
  if (fechaFin < fechaInicio) {
    return NextResponse.json({ ok: false, error: "La fecha de fin debe ser posterior a la de inicio" }, { status: 400 });
  }
  if (!Number.isFinite(precio) || precio === 0) {
    return NextResponse.json({ ok: false, error: "El precio extra por día no puede ser 0" }, { status: 400 });
  }

  try {
    const temporada = await prisma.precio_temporada.create({
      data: {
        fecha_inicio: fechaInicio,
        fecha_fin:    fechaFin,
        precio,
        descripcion:  (body.descripcion ?? "").trim() || null,
        status:       body.status === "inactivo" ? "inactivo" : "activo",
      },
    });
    return NextResponse.json({ ok: true, temporada: { ...temporada, precio: Number(temporada.precio) } });
  } catch (err) {
    console.error("[admin/temporadas] Error al crear:", err);
    return NextResponse.json({ ok: false, error: "No se pudo crear la temporada" }, { status: 500 });
  }
}
