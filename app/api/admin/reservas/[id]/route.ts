import { NextResponse } from "next/server";
import { calcAdminPrice, type ReservaAdmin } from "@/lib/admin";
import { getConfig, getReservations, saveReservations } from "@/lib/store";

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

  const all = await getReservations();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ ok: false, error: "Reserva no encontrada" }, { status: 404 });
  }

  const actualizada: ReservaAdmin = { ...all[idx], ...body, id };
  if (actualizada.plate) actualizada.plate = actualizada.plate.toUpperCase();

  // Si cambian fechas o tipo de vehículo, se recalcula el precio con las tarifas del panel
  if (body.checkIn || body.checkOut || body.vehicleType) {
    const cfg = await getConfig();
    actualizada.price = calcAdminPrice(cfg, actualizada.vehicleType, actualizada.checkIn, actualizada.checkOut);
  }

  all[idx] = actualizada;
  await saveReservations(all);
  return NextResponse.json({ ok: true, reservation: actualizada });
}

/** Elimina una reserva */
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const all = await getReservations();
  await saveReservations(all.filter((r) => r.id !== id));
  return NextResponse.json({ ok: true });
}
