import { NextResponse } from "next/server";
import { NEGOCIO } from "@/lib/config";
import { formatoLegible } from "@/lib/datetime";
import { formatoEuros } from "@/lib/pricing";
import type { ReservaCompleta } from "@/lib/types";
import { getConfig, createFullReservation } from "@/lib/store";

/**
 * ============================================================
 *  API DE RESERVAS — guarda en MySQL/Prisma + envía correos
 *
 *  La reserva se persiste en la misma base de datos MySQL que
 *  usa el panel parkingplus-dashboard (tablas: clientes, coches, reservas).
 *
 *  Variables necesarias en .env.local:
 *    DATABASE_URL=mysql://user:pass@host:3306/nombre_db
 *    RESEND_API_KEY=re_xxxx     (opcional — para envío real de correos)
 *    EMAIL_FROM="Parking Aero Madrid <reservas@parkingaeromadrid.es>"
 * ============================================================
 */

export async function POST(request: Request) {
  let reserva: ReservaCompleta;
  try {
    reserva = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }

  // Validación básica en servidor
  const camposObligatorios: (keyof ReservaCompleta)[] = [
    "entrada", "salida", "terminalEntrada", "terminalSalida",
    "nombre", "email", "telefono", "matricula", "modelo",
  ];
  const faltan = camposObligatorios.filter((c) => !String(reserva[c] ?? "").trim());
  if (faltan.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Faltan campos: ${faltan.join(", ")}` },
      { status: 400 },
    );
  }
  if (new Date(reserva.salida) <= new Date(reserva.entrada)) {
    return NextResponse.json(
      { ok: false, error: "La salida debe ser posterior a la entrada" },
      { status: 400 },
    );
  }

  // ── Persistir en MySQL via Prisma (misma BD que el panel) ────────────────
  const cfg = await getConfig();
  try {
    await createFullReservation({
      name:        reserva.nombre.trim(),
      phone:       reserva.telefono.trim(),
      email:       reserva.email.trim(),
      vehicleType: reserva.vehiculo === "moto" ? "moto" : "car",
      plate:       reserva.matricula.trim().toUpperCase(),
      model:       reserva.modelo.trim(),
      terminal:    reserva.terminalEntrada,
      checkIn:     reserva.entrada,
      checkOut:    reserva.salida,
      status:      "confirmed",
      price:       reserva.total,
      notes:       `Recibida desde la web · Terminal salida: ${reserva.terminalSalida}`,
    });
  } catch (err) {
    // No interrumpimos el flujo: el email de confirmación sigue enviándose
    console.error("[reserva] Error al guardar en BD:", err);
  }

  // ── Envío de correos ───────────────────────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;
  const emailDueno = cfg.ownerEmail || NEGOCIO.emailDueno;

  if (!apiKey) {
    console.log("📩 [SIMULADO] Reserva confirmada (configura RESEND_API_KEY para envío real):");
    console.log(JSON.stringify(reserva, null, 2));
    return NextResponse.json({ ok: true, simulado: true });
  }

  const enviarEmail = (destinatario: string, replyTo: string, subject: string, html: string) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:     process.env.EMAIL_FROM ?? "Parking Aero Madrid <onboarding@resend.dev>",
        to:       [destinatario],
        reply_to: replyTo,
        subject,
        html,
      }),
    });

  try {
    // 1. Confirmación al cliente
    const resCliente = await enviarEmail(
      reserva.email,
      emailDueno,
      `✅ Reserva confirmada · ${NEGOCIO.nombre} · ${formatoLegible(reserva.entrada)}`,
      construirEmailCliente(reserva),
    );
    if (!resCliente.ok) {
      const detalle = await resCliente.text();
      console.error("Error de Resend (confirmación al cliente):", detalle);
      return NextResponse.json(
        { ok: false, error: "No se pudo enviar la confirmación" },
        { status: 502 },
      );
    }

    // 2. Aviso al dueño del parking
    const resDueno = await enviarEmail(
      emailDueno,
      reserva.email,
      `🚗 Nueva reserva: ${reserva.nombre} · ${formatoLegible(reserva.entrada)} · ${reserva.terminalEntrada}`,
      construirEmailHtml(reserva),
    );
    if (!resDueno.ok) {
      console.error("Error de Resend (aviso al dueño):", await resDueno.text());
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error enviando la reserva:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

/** Correo de confirmación que recibe el cliente */
function construirEmailCliente(r: ReservaCompleta): string {
  const fila = (etiqueta: string, valor: string) => `
    <tr>
      <td style="padding:8px 12px;color:#64748b;font-size:14px;">${etiqueta}</td>
      <td style="padding:8px 12px;color:#0f172a;font-size:14px;font-weight:600;">${valor}</td>
    </tr>`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;">
    <div style="background:#2c616e;border-radius:12px 12px 0 0;padding:20px 24px;">
      <h1 style="color:#ffffff;font-size:18px;margin:0;">✅ Tu reserva está confirmada · ${NEGOCIO.nombre}</h1>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:8px 12px 16px;">
      <p style="padding:8px 12px 0;color:#334155;font-size:14px;line-height:1.6;">
        Hola ${r.nombre}: hemos registrado tu reserva. Estos son los datos:
      </p>
      <table style="width:100%;border-collapse:collapse;">
        ${fila("Entrada",          formatoLegible(r.entrada))}
        ${fila("Salida",           formatoLegible(r.salida))}
        ${fila("Terminal entrada", r.terminalEntrada)}
        ${fila("Terminal salida",  r.terminalSalida)}
        ${fila("Vehículo",         `${r.vehiculo === "moto" ? "🏍️ Moto" : "🚗 Coche"} · ${r.modelo} · ${r.matricula}`)}
        ${fila("Total estimado",   formatoEuros(r.total))}
      </table>
      <p style="padding:8px 12px 0;color:#334155;font-size:14px;line-height:1.6;">
        💳 No pagas nada por adelantado: el pago se realiza al entregar el vehículo.<br>
        Si necesitas modificar o cancelar la reserva, responde a este correo o
        llámanos al ${NEGOCIO.telefono}.
      </p>
    </div>
  </div>`;
}

/** Correo de aviso al dueño del parking */
function construirEmailHtml(r: ReservaCompleta): string {
  const fila = (etiqueta: string, valor: string) => `
    <tr>
      <td style="padding:8px 12px;color:#64748b;font-size:14px;">${etiqueta}</td>
      <td style="padding:8px 12px;color:#0f172a;font-size:14px;font-weight:600;">${valor}</td>
    </tr>`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;">
    <div style="background:#2c616e;border-radius:12px 12px 0 0;padding:20px 24px;">
      <h1 style="color:#ffffff;font-size:18px;margin:0;">Nueva reserva · ${NEGOCIO.nombre}</h1>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:8px 12px 16px;">
      <h2 style="font-size:14px;color:#334155;padding:8px 12px 0;">📅 Datos de la reserva</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${fila("Entrada",          formatoLegible(r.entrada))}
        ${fila("Salida",           formatoLegible(r.salida))}
        ${fila("Terminal entrada", r.terminalEntrada)}
        ${fila("Terminal salida",  r.terminalSalida)}
        ${fila("Días",             String(r.dias))}
        ${fila("Precio total",     formatoEuros(r.total))}
      </table>
      <h2 style="font-size:14px;color:#334155;padding:8px 12px 0;">👤 Datos del cliente</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${fila("Nombre",   r.nombre)}
        ${fila("Email",    r.email)}
        ${fila("Teléfono", r.telefono)}
        ${fila("Vehículo", r.vehiculo === "moto" ? "🏍️ Moto" : "🚗 Coche")}
        ${fila("Matrícula", r.matricula)}
        ${fila("Modelo",    r.modelo)}
      </table>
    </div>
  </div>`;
}
