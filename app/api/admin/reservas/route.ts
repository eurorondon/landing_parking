import { NextResponse } from "next/server";
import { type ReservaAdmin } from "@/lib/admin";
import { calculateRawParkingDays, aplicaNocturnidad } from "@/lib/pricing";
import { calcularPrecioReserva } from "@/lib/precio-db";
import { getReservations, saveReservations, createFullReservation } from "@/lib/store";
import { smtpConfigurado, enviarConfirmacionCliente, reservaAdminACompleta } from "@/lib/email";
import { enviarReservaAParkingPlus } from "@/lib/parkingplus";

/** Lista todas las reservas (desde MySQL/Prisma o datos demo si no hay DATABASE_URL) */
export async function GET() {
  const reservations = await getReservations(true);
  return NextResponse.json({ ok: true, reservations });
}

/**
 * Crea una reserva desde el panel de administración.
 *
 * Envía al cliente la misma confirmación que la web, salvo que el body traiga
 * `enviarEmail: false` (casilla desmarcada en el formulario), útil para dar de
 * alta reservas antiguas o de teléfono sin avisar al cliente. A diferencia de
 * la web, aquí NO se manda el aviso al dueño: la reserva la está creando él.
 *
 * También registra la reserva en parkingplus-dashboard (medio Agencia), igual
 * que la web, salvo que el body traiga `enviarParkingPlus: false`.
 */
export async function POST(request: Request) {
  let body: Partial<ReservaAdmin> & { enviarEmail?: boolean; enviarParkingPlus?: boolean };
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

  // ── Registro en parkingplus-dashboard (medio Agencia) ─────────────────────
  // Igual que la web: un fallo no invalida el alta local; se informa con
  // `parkingplusEnviado` para que el panel avise y se registre a mano.
  let parkingplusEnviado = false;
  if (body.enviarParkingPlus !== false) {
    try {
      const envio = await enviarReservaAParkingPlus(reservaAdminACompleta(nueva));
      parkingplusEnviado = envio.ok;
      if (!envio.ok) {
        console.error("[admin/reservas] Fallo al registrar en parkingplus:", envio.error);
      }
    } catch (err) {
      console.error("[admin/reservas] Error inesperado enviando a parkingplus:", err);
    }
  }

  // ── Confirmación al cliente ───────────────────────────────────────────────
  // Un fallo de correo no invalida el alta: la reserva ya está en la BD, así que
  // se informa con `emailEnviado` en vez de devolver error.
  let emailEnviado = false;
  if (body.enviarEmail !== false) {
    if (!smtpConfigurado()) {
      console.log(`📩 [SIMULADO] Reserva ${nueva.id} creada en el panel (configura SMTP_HOST/USER/PASS para envío real)`);
    } else {
      try {
        // ocultarAutocaravana: en altas del panel el correo no menciona el tipo de vehículo
        await enviarConfirmacionCliente({ ...reservaAdminACompleta(nueva), ocultarAutocaravana: true });
        console.log(`✅ Correo de confirmación enviado a ${nueva.email} (reserva ${nueva.id}, creada en el panel)`);
        emailEnviado = true;
      } catch (err) {
        console.error("[admin/reservas] Error enviando la confirmación al cliente:", err);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    reservation: nueva,
    emailEnviado,
    // "omitido" cuando el admin desmarcó la casilla (no es un fallo)
    parkingplusEnviado: body.enviarParkingPlus === false ? "omitido" : parkingplusEnviado,
  });
}

/** Borra TODAS las reservas (zona de peligro en Configuración) */
export async function DELETE() {
  await saveReservations([]);
  return NextResponse.json({ ok: true });
}
