import { NextResponse } from "next/server";
import { calcAdminPrice, type ReservaAdmin } from "@/lib/admin";
import { getConfig, getReservations, saveReservations, createFullReservation } from "@/lib/store";

/** Lista todas las reservas (desde AppSync o datos demo si no hay config) */
export async function GET() {
  const reservations = await getReservations(true);
  return NextResponse.json({ ok: true, reservations });
}

/** Crea una reserva desde el panel de administración */
export async function POST(request: Request) {
  let body: Partial<ReservaAdmin>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }

  const obligatorios = ["name", "phone", "email", "vehicleType", "plate", "terminal", "checkIn", "checkOut"] as const;
  const faltan = obligatorios.filter((c) => !String(body[c] ?? "").trim());
  if (faltan.length > 0) {
    return NextResponse.json({ ok: false, error: `Faltan campos: ${faltan.join(", ")}` }, { status: 400 });
  }
  if (new Date(body.checkOut!) <= new Date(body.checkIn!)) {
    return NextResponse.json({ ok: false, error: "La salida debe ser posterior a la entrada" }, { status: 400 });
  }

  const cfg = await getConfig();
  const vehicleType = body.vehicleType === "moto" ? "moto" : "car";

  const nueva = await createFullReservation({
    name:        body.name!.trim(),
    phone:       body.phone!.trim(),
    email:       body.email!.trim(),
    vehicleType,
    plate:       body.plate!.trim().toUpperCase(),
    model:       (body.model ?? "").trim(),
    terminal:    body.terminal!,
    checkIn:     body.checkIn!,
    checkOut:    body.checkOut!,
    status:      body.status ?? "confirmed",
    price:       calcAdminPrice(cfg, vehicleType, body.checkIn!, body.checkOut!),
    notes:       (body.notes ?? "").trim(),
  });

  return NextResponse.json({ ok: true, reservation: nueva });
}

/** Borra TODAS las reservas (zona de peligro en Configuración) */
export async function DELETE() {
  await saveReservations([]);
  return NextResponse.json({ ok: true });
}
