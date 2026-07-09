import { NextResponse } from "next/server";
import { type ReservaAdmin } from "@/lib/admin";
import { calculateRawParkingDays, aplicaNocturnidad } from "@/lib/pricing";
import { calcularPrecioReserva } from "@/lib/precio-db";
import { getReservations, saveReservations, createFullReservation } from "@/lib/store";

/** Lista todas las reservas (desde MySQL/Prisma o datos demo si no hay DATABASE_URL) */
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

  const vehicleType = body.vehicleType === "autocaravana" ? "autocaravana" : "car";

  // Precio desde la fuente única (misma BD que la web): días + nocturnidad + recargo
  const dias     = calculateRawParkingDays(new Date(body.checkIn!), new Date(body.checkOut!));
  const nocturno = aplicaNocturnidad(body.checkIn!.slice(11, 16), body.checkOut!.slice(11, 16));
  const precio   = await calcularPrecioReserva({ dias, nocturno, esAutocaravana: vehicleType === "autocaravana" });

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
    price:       precio.total,
    notes:       (body.notes ?? "").trim(),
  });

  return NextResponse.json({ ok: true, reservation: nueva });
}

/** Borra TODAS las reservas (zona de peligro en Configuración) */
export async function DELETE() {
  await saveReservations([]);
  return NextResponse.json({ ok: true });
}
