import { NextResponse } from "next/server";
import { calcAdminPrice, type ReservaAdmin } from "@/lib/admin";
import {
  getConfig,
  getReservationById,
  updateReservationById,
  deleteReservationById,
} from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

/** Actualiza una reserva (edición completa o solo cambio de estado) */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  let body: Partial<ReservaAdmin>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }

  // Obtener el estado actual de la reserva (necesario para el recálculo de precio)
  const actual = await getReservationById(id);
  if (!actual) {
    return NextResponse.json({ ok: false, error: "Reserva no encontrada" }, { status: 404 });
  }

  // Si cambian fechas o tipo de vehículo, recalcular el precio con las tarifas del panel
  if (body.checkIn || body.checkOut || body.vehicleType) {
    const cfg     = await getConfig();
    const tipo    = body.vehicleType ?? actual.vehicleType;
    const entrada = body.checkIn     ?? actual.checkIn;
    const salida  = body.checkOut    ?? actual.checkOut;
    body = { ...body, price: calcAdminPrice(cfg, tipo, entrada, salida) };
  }
  if (body.plate) body.plate = body.plate.toUpperCase();

  try {
    const actualizada = await updateReservationById(id, body);
    return NextResponse.json({ ok: true, reservation: actualizada });
  } catch (err) {
    console.error("[admin/reservas/[id]] PATCH:", err);
    return NextResponse.json({ ok: false, error: "Error al actualizar" }, { status: 500 });
  }
}

/** Elimina una reserva */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await deleteReservationById(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/reservas/[id]] DELETE:", err);
    return NextResponse.json({ ok: false, error: "Error al eliminar" }, { status: 500 });
  }
}
