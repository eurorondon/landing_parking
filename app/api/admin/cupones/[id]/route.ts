import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFechaCupon, type CuponPayload } from "@/lib/cupones";

/**
 * PATCH  /api/admin/cupones/[id] → edita campos del cupón (incl. activar/desactivar)
 * DELETE /api/admin/cupones/[id] → elimina el cupón
 *
 * El código no se edita: para cambiarlo se crea un cupón nuevo
 * (el código usado queda referenciado en reservas históricas).
 */

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ ok: false, error: "ID no válido" }, { status: 400 });
  }

  let body: CuponPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }

  const data: Record<string, unknown> = { updated_at: new Date() };

  if (body.activo !== undefined) data.activo = Boolean(body.activo);
  if (body.tipo   !== undefined) data.tipo   = body.tipo === "fijo" ? "fijo" : "porcentaje";
  if (body.valor  !== undefined) {
    const valor = Number(body.valor);
    if (!Number.isFinite(valor) || valor <= 0) {
      return NextResponse.json({ ok: false, error: "Valor no válido" }, { status: 400 });
    }
    data.valor = valor;
  }
  if (body.validoDesde !== undefined) data.valido_desde = parseFechaCupon(body.validoDesde, false);
  if (body.validoHasta !== undefined) data.valido_hasta = parseFechaCupon(body.validoHasta, true);
  if (body.maxUsos     !== undefined) {
    data.max_usos = body.maxUsos != null && Number(body.maxUsos) > 0 ? Math.floor(Number(body.maxUsos)) : null;
  }
  if (body.campana !== undefined) data.campana = (body.campana ?? "").trim() || null;

  try {
    const cupon = await prisma.cupones.update({ where: { id: numId }, data });
    return NextResponse.json({ ok: true, cupon: { ...cupon, valor: Number(cupon.valor) } });
  } catch (err) {
    console.error("[admin/cupones/[id]] Error al actualizar:", err);
    return NextResponse.json({ ok: false, error: "No se pudo actualizar el cupón" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ ok: false, error: "ID no válido" }, { status: 400 });
  }
  try {
    await prisma.cupones.delete({ where: { id: numId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/cupones/[id]] Error al eliminar:", err);
    return NextResponse.json({ ok: false, error: "No se pudo eliminar el cupón" }, { status: 500 });
  }
}
