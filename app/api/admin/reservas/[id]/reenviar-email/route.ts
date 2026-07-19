import { NextResponse } from "next/server";
import { getReservationById, updateReservationById } from "@/lib/store";
import { smtpConfigurado, enviarConfirmacionCliente, reservaAdminACompleta } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Reenvía el correo de confirmación de una reserva, con el mismo contenido
 * exacto que se envió al crearla (misma plantilla, datos releídos de la BD).
 *
 * Body opcional:
 *   email    → destinatario alternativo (si se omite, el de la ficha)
 *   guardar  → true para fijar ese correo en la ficha del cliente.
 *              Por defecto false: el envío es puntual y no altera los datos
 *              del cliente (permite probar un envío a otra dirección).
 */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  let body: { email?: string; guardar?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // Sin body → se reenvía al correo ya guardado
  }

  if (!smtpConfigurado()) {
    return NextResponse.json(
      { ok: false, error: "SMTP no configurado en el servidor" },
      { status: 503 },
    );
  }

  let reserva = await getReservationById(id);
  if (!reserva) {
    return NextResponse.json({ ok: false, error: "Reserva no encontrada" }, { status: 404 });
  }

  const destinatario = body.email?.trim() || reserva.email;
  if (!EMAIL_RE.test(destinatario)) {
    return NextResponse.json({ ok: false, error: "Correo no válido" }, { status: 400 });
  }

  // ── Solo se toca la ficha del cliente si se pidió explícitamente ───────────
  const guardar = body.guardar === true && destinatario !== reserva.email;
  if (guardar) {
    try {
      reserva = await updateReservationById(id, { email: destinatario });
    } catch (err) {
      console.error("[admin/reservas/[id]/reenviar-email] Error al actualizar el correo:", err);
      return NextResponse.json(
        { ok: false, error: "No se pudo guardar el nuevo correo" },
        { status: 500 },
      );
    }
  }

  try {
    // El contenido se construye siempre con los datos reales de la reserva;
    // solo cambia el destinatario del sobre.
    await enviarConfirmacionCliente({ ...reservaAdminACompleta(reserva), email: destinatario });
    console.log(`✅ Correo de confirmación reenviado a ${destinatario} (reserva ${id})`);
    return NextResponse.json({ ok: true, email: destinatario, guardado: guardar });
  } catch (err) {
    console.error("[admin/reservas/[id]/reenviar-email] Error de envío:", err);
    return NextResponse.json(
      { ok: false, error: "El servidor de correo rechazó el envío" },
      { status: 502 },
    );
  }
}
