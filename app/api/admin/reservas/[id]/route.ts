import { NextResponse } from "next/server";
import { type ReservaAdmin } from "@/lib/admin";
import { calculateRawParkingDays, aplicaNocturnidad } from "@/lib/pricing";
import { calcularPrecioReserva } from "@/lib/precio-db";
import {
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

  // Si cambian fechas o tipo de vehículo, recalcular el precio con la fuente única (BD)
  if (body.checkIn || body.checkOut || body.vehicleType) {
    const tipo    = body.vehicleType ?? actual.vehicleType;
    const entrada = body.checkIn     ?? actual.checkIn;
    const salida  = body.checkOut    ?? actual.checkOut;
    const dias     = calculateRawParkingDays(new Date(entrada), new Date(salida));
    const nocturno = aplicaNocturnidad(entrada.slice(11, 16), salida.slice(11, 16));
    const precio   = await calcularPrecioReserva({ dias, nocturno, esAutocaravana: tipo === "autocaravana" });
    body = { ...body, price: precio.total };
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
