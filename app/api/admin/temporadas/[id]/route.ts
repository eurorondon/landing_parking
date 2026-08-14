import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFechaTemporada, type TemporadaPayload } from "@/lib/temporadas";

/**
 * PATCH  /api/admin/temporadas/[id] → edita campos de la temporada (incl. activar/desactivar)
 * DELETE /api/admin/temporadas/[id] → elimina la temporada
 */

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ ok: false, error: "ID no válido" }, { status: 400 });
  }

  let body: TemporadaPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  let fechaInicio: Date | null = null;
  let fechaFin:    Date | null = null;

  if (body.status !== undefined) data.status = body.status === "inactivo" ? "inactivo" : "activo";
  if (body.precio !== undefined) {
    const precio = Number(body.precio);
    if (!Number.isFinite(precio) || precio === 0) {
      return NextResponse.json({ ok: false, error: "El precio extra por día no puede ser 0" }, { status: 400 });
    }
    data.precio = precio;
  }
  if (body.fechaInicio !== undefined) {
    fechaInicio = parseFechaTemporada(body.fechaInicio);
    if (!fechaInicio) return NextResponse.json({ ok: false, error: "Fecha de inicio no válida" }, { status: 400 });
    data.fecha_inicio = fechaInicio;
  }
  if (body.fechaFin !== undefined) {
    fechaFin = parseFechaTemporada(body.fechaFin);
    if (!fechaFin) return NextResponse.json({ ok: false, error: "Fecha de fin no válida" }, { status: 400 });
    data.fecha_fin = fechaFin;
  }
  if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
    return NextResponse.json({ ok: false, error: "La fecha de fin debe ser posterior a la de inicio" }, { status: 400 });
  }
  if (body.descripcion !== undefined) data.descripcion = (body.descripcion ?? "").trim() || null;

  try {
    const temporada = await prisma.precio_temporada.update({ where: { id: numId }, data });
    return NextResponse.json({ ok: true, temporada: { ...temporada, precio: Number(temporada.precio) } });
  } catch (err) {
    console.error("[admin/temporadas/[id]] Error al actualizar:", err);
    return NextResponse.json({ ok: false, error: "No se pudo actualizar la temporada" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ ok: false, error: "ID no válido" }, { status: 400 });
  }
  try {
    await prisma.precio_temporada.delete({ where: { id: numId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/temporadas/[id]] Error al eliminar:", err);
    return NextResponse.json({ ok: false, error: "No se pudo eliminar la temporada" }, { status: 500 });
  }
}
