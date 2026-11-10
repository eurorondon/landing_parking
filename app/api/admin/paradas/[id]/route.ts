import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { type ParadaPayload } from "@/lib/paradas";
import { filaAParada } from "@/lib/paradas-db";

/**
 * PATCH  /api/admin/paradas/[id] → activar/desactivar o cambiar la descripción
 * DELETE /api/admin/paradas/[id] → elimina la parada
 *
 * Para cambiar fechas u horas se elimina y se vuelve a crear (igual que las
 * temporadas): así la comprobación de reservas afectadas se hace siempre.
 */

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ ok: false, error: "ID no válido" }, { status: 400 });
  }

  let body: ParadaPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.status !== undefined)      data.status      = body.status === "inactivo" ? "inactivo" : "activo";
  if (body.descripcion !== undefined) data.descripcion = (body.descripcion ?? "").trim().slice(0, 255);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "Nada que actualizar" }, { status: 400 });
  }

  try {
    const fila = await prisma.paradas.update({ where: { id: numId }, data });
    return NextResponse.json({ ok: true, parada: { ...filaAParada(fila), status: fila.status } });
  } catch (err) {
    console.error("[admin/paradas/[id]] Error al actualizar:", err);
    return NextResponse.json({ ok: false, error: "No se pudo actualizar la parada" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ ok: false, error: "ID no válido" }, { status: 400 });
  }
  try {
    await prisma.paradas.delete({ where: { id: numId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/paradas/[id]] Error al eliminar:", err);
    return NextResponse.json({ ok: false, error: "No se pudo eliminar la parada" }, { status: 500 });
  }
}
