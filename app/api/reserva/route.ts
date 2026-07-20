import { NextResponse } from "next/server";
import { NEGOCIO } from "@/lib/config";
import { formatoLegible } from "@/lib/datetime";
import { formatoEuros } from "@/lib/pricing";
import type { ReservaCompleta } from "@/lib/types";
import { getConfig, createFullReservation } from "@/lib/store";
import {
  crearTransporte,
  smtpConfigurado,
  construirEmailCliente,
  construirEmailAdmin,
} from "@/lib/email";

// ── Colores de los embeds de Discord en decimal ──
const DISCORD_COLOR = 0xFF9500; // #FF9500 · naranja de la marca
const DISCORD_ROJO  = 0xDC2626; // #DC2626 · alertas que exigen acción manual

/**
 * POST al webhook de Discord. Fire-and-forget: nunca lanza, solo logea,
 * para que un fallo de Discord no afecte al flujo de la reserva.
 */
async function enviarWebhookDiscord(payload: unknown): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const res = await fetch(webhookUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("[discord] Error al enviar notificación:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[discord] Excepción al enviar notificación:", err);
  }
}

/**
 * Avisa de que la reserva se registró pero el cliente NO recibió su correo.
 * Requiere acción manual: contactar al cliente o reenviar desde el panel.
 */
async function alertarCorreoFallidoDiscord(r: ReservaCompleta, reservaId: number | string | null): Promise<void> {
  await enviarWebhookDiscord({
    embeds: [
      {
        title:       "⚠️ Reserva SIN correo de confirmación",
        description: "La reserva está registrada, pero el envío al cliente falló. Contáctalo o reenvía la confirmación desde el panel.",
        color:       DISCORD_ROJO,
        fields: [
          { name: "👤 Cliente",  value: r.nombre,                      inline: true },
          { name: "📞 Teléfono", value: r.telefono,                    inline: true },
          { name: "📧 Email",    value: r.email,                       inline: true },
          { name: "📅 Entrada",  value: formatoLegible(r.entrada),     inline: true },
          { name: "🆔 Reserva",  value: reservaId ? `\`${reservaId}\`` : "⚠️ tampoco se guardó en BD", inline: true },
        ],
        footer:    { text: NEGOCIO.nombre },
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

/**
 * Envía un embed a Discord con los datos de la reserva.
 * Fire-and-forget: si falla no interrumpe el flujo principal.
 */
async function notificarDiscord(r: ReservaCompleta): Promise<void> {
  const vehiculoIcon = r.vehiculo === "autocaravana" ? "🚐" : "🚗";
  const planTexto    = r.planNombre ? ` · Plan ${r.planNombre}` : "";

  await enviarWebhookDiscord({
    embeds: [
      {
        title: "🚗 Nueva reserva recibida",
        color: DISCORD_COLOR,
        fields: [
          { name: "📅 Entrada",          value: formatoLegible(r.entrada),       inline: true },
          { name: "📅 Salida",           value: formatoLegible(r.salida),        inline: true },
          { name: "🌙 Días",             value: `${r.dias} día${r.dias !== 1 ? "s" : ""}`, inline: true },
          { name: "🛫 Terminal entrada", value: r.terminalEntrada,                inline: true },
          { name: "🛬 Terminal salida",  value: r.terminalSalida,                 inline: true },
          { name: "💶 Total",            value: `**${formatoEuros(r.total)}**${planTexto}${r.lavadoNombre ? ` · 🧹 ${r.lavadoNombre}` : ""}`, inline: true },
          { name: "👤 Cliente",          value: r.nombre,                         inline: true },
          { name: "📞 Teléfono",         value: r.telefono,                       inline: true },
          { name: "📧 Email",            value: r.email,                          inline: true },
          { name: `${vehiculoIcon} Vehículo`, value: `${r.modelo} · \`${r.matricula.toUpperCase()}\``, inline: false },
        ],
        footer:    { text: NEGOCIO.nombre },
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

/**
 * ============================================================
 *  API DE RESERVAS — guarda en MySQL/Prisma + envía correos
 *
 *  La reserva se persiste en la misma base de datos MySQL que
 *  usa el panel parkingplus-dashboard.
 *
 *  Variables necesarias en .env.local:
 *    DATABASE_URL=mysql://user:pass@host:3306/nombre_db
 *    SMTP_HOST=mail.parkingaeromadrid.es   (o IP del servidor)
 *    SMTP_PORT=465
 *    SMTP_SECURE=true
 *    SMTP_USER=reserva@parkingaeromadrid.es
 *    SMTP_PASS=xxxx
 *    MAIL_FROM="Parking Aero Madrid <reserva@parkingaeromadrid.es>"
 *    MAIL_ADMIN=parkingaeromadrid@gmail.com
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

  // ── Persistir en MySQL via Prisma ────────────────────────────────────────────
  const cfg = await getConfig();
  let reservaId: number | string | null = null;
  try {
    const creada = await createFullReservation({
      name:        reserva.nombre.trim(),
      phone:       reserva.telefono.trim(),
      email:       reserva.email.trim(),
      vehicleType: reserva.vehiculo === "autocaravana" ? "autocaravana" : "car",
      plate:       reserva.matricula.trim().toUpperCase(),
      model:       reserva.modelo.trim(),
      terminal:    reserva.terminalEntrada,
      checkIn:     reserva.entrada,
      checkOut:    reserva.salida,
      status:      "confirmed",
      price:       reserva.total,
      notes:       `Recibida desde la web · Terminal salida: ${reserva.terminalSalida}${reserva.planNombre ? ` · Plan: ${reserva.planNombre}` : ""}${reserva.lavadoNombre ? ` · Lavado: ${reserva.lavadoNombre}` : ""}`,
    });
    reservaId = creada.id;
  } catch (err) {
    // No interrumpimos el flujo: el correo de confirmación sigue enviándose
    console.error("[reserva] Error al guardar en BD:", err);
  }

  // ── Notificación Discord (fire-and-forget) ──────────────────────────────────
  notificarDiscord(reserva).catch(() => {/* ya logueado dentro */});

  // ── Envío de correos via SMTP (Nodemailer) ──────────────────────────────────
  if (!smtpConfigurado()) {
    console.log("📩 [SIMULADO] Reserva confirmada (configura SMTP_HOST/USER/PASS para envío real):");
    console.log(JSON.stringify(reserva, null, 2));
    return NextResponse.json({ ok: true, simulado: true, reservaId });
  }

  const mailFrom  = process.env.MAIL_FROM  || `"${NEGOCIO.nombre}" <${process.env.SMTP_USER}>`;
  const mailAdmin = process.env.MAIL_ADMIN || (cfg.ownerEmail ?? NEGOCIO.emailDueno);
  const transporter = crearTransporte();

  // 1. Confirmación al cliente. Si falla NO se invalida la reserva: ya está en BD,
  //    y devolver error haría que el cliente la creara de nuevo (duplicados).
  //    El resultado viaja en `emailEnviado` para que la web lo explique.
  let emailEnviado = false;
  try {
    await transporter.sendMail({
      from:     mailFrom,
      to:       reserva.email,
      replyTo:  mailAdmin,
      subject:  `✅ Reserva confirmada · ${NEGOCIO.nombre} · ${formatoLegible(reserva.entrada)}`,
      html:     construirEmailCliente(reserva),
    });
    console.log(`✅ Correo de confirmación enviado a ${reserva.email}`);
    emailEnviado = true;
  } catch (error) {
    console.error("[reserva] Error enviando correo al cliente:", error);
    // El cliente se queda sin confirmación: avisa a Discord para actuar a mano
    alertarCorreoFallidoDiscord(reserva, reservaId).catch(() => {/* ya logueado dentro */});
  }

  // 2. Aviso al admin / dueño del parking
  transporter.sendMail({
    from:    `"Reservas Web" <${process.env.SMTP_USER}>`,
    to:      mailAdmin,
    replyTo: reserva.email,
    subject: `🚗 Nueva reserva: ${reserva.nombre} · ${formatoLegible(reserva.entrada)} · ${reserva.terminalEntrada}`,
    html:    construirEmailAdmin(reserva),
  }).catch((err: Error) => console.error("[reserva] Error al enviar aviso al admin:", err));

  // Si además de fallar el correo tampoco se guardó en BD, no queda rastro de la
  // reserva por ninguna vía: ahí sí es un error real y hay que decírselo al cliente.
  if (!reservaId && !emailEnviado) {
    console.error("[reserva] Reserva perdida: falló el guardado en BD y el correo");
    return NextResponse.json(
      { ok: false, error: "No se pudo registrar la reserva. Inténtalo de nuevo o llámanos." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, reservaId, emailEnviado });
}
