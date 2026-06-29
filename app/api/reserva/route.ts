import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { NEGOCIO } from "@/lib/config";
import { formatoLegible } from "@/lib/datetime";
import { formatoEuros } from "@/lib/pricing";
import type { ReservaCompleta } from "@/lib/types";
import { getConfig, createFullReservation } from "@/lib/store";

// ── Color naranja de la marca en formato decimal (Discord embed) ──
const DISCORD_COLOR = 0xFF9500; // #FF9500

/**
 * Crea el transporte SMTP de Nodemailer con las variables de entorno.
 */
function crearTransporte() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== "false", // true por defecto (puerto 465)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Evita errores con certificados autofirmados
    },
  });
}

/**
 * Envía un embed a Discord con los datos de la reserva.
 * Fire-and-forget: si falla no interrumpe el flujo principal.
 */
async function notificarDiscord(r: ReservaCompleta): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const vehiculoIcon = r.vehiculo === "moto" ? "🏍️" : "🚗";
  const planTexto    = r.planNombre ? ` · Plan ${r.planNombre}` : "";

  const payload = {
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
          { name: "💶 Total",            value: `**${formatoEuros(r.total)}**${planTexto}`, inline: true },
          { name: "👤 Cliente",          value: r.nombre,                         inline: true },
          { name: "📞 Teléfono",         value: r.telefono,                       inline: true },
          { name: "📧 Email",            value: r.email,                          inline: true },
          { name: `${vehiculoIcon} Vehículo`, value: `${r.modelo} · \`${r.matricula.toUpperCase()}\``, inline: false },
        ],
        footer:    { text: NEGOCIO.nombre },
        timestamp: new Date().toISOString(),
      },
    ],
  };

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
      vehicleType: reserva.vehiculo === "moto" ? "moto" : "car",
      plate:       reserva.matricula.trim().toUpperCase(),
      model:       reserva.modelo.trim(),
      terminal:    reserva.terminalEntrada,
      checkIn:     reserva.entrada,
      checkOut:    reserva.salida,
      status:      "confirmed",
      price:       reserva.total,
      notes:       `Recibida desde la web · Terminal salida: ${reserva.terminalSalida}${reserva.planNombre ? ` · Plan: ${reserva.planNombre}` : ""}`,
    });
    reservaId = creada.id;
  } catch (err) {
    // No interrumpimos el flujo: el correo de confirmación sigue enviándose
    console.error("[reserva] Error al guardar en BD:", err);
  }

  // ── Notificación Discord (fire-and-forget) ──────────────────────────────────
  notificarDiscord(reserva).catch(() => {/* ya logueado dentro */});

  // ── Envío de correos via SMTP (Nodemailer) ──────────────────────────────────
  const smtpOk = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (!smtpOk) {
    console.log("📩 [SIMULADO] Reserva confirmada (configura SMTP_HOST/USER/PASS para envío real):");
    console.log(JSON.stringify(reserva, null, 2));
    return NextResponse.json({ ok: true, simulado: true, reservaId });
  }

  const mailFrom  = process.env.MAIL_FROM  || `"${NEGOCIO.nombre}" <${process.env.SMTP_USER}>`;
  const mailAdmin = process.env.MAIL_ADMIN || (cfg.ownerEmail ?? NEGOCIO.emailDueno);
  const transporter = crearTransporte();

  try {
    // 1. Confirmación al cliente
    await transporter.sendMail({
      from:     mailFrom,
      to:       reserva.email,
      replyTo:  mailAdmin,
      subject:  `✅ Reserva confirmada · ${NEGOCIO.nombre} · ${formatoLegible(reserva.entrada)}`,
      html:     construirEmailCliente(reserva),
    });
    console.log(`✅ Correo de confirmación enviado a ${reserva.email}`);

    // 2. Aviso al admin / dueño del parking
    transporter.sendMail({
      from:    `"Reservas Web" <${process.env.SMTP_USER}>`,
      to:      mailAdmin,
      replyTo: reserva.email,
      subject: `🚗 Nueva reserva: ${reserva.nombre} · ${formatoLegible(reserva.entrada)} · ${reserva.terminalEntrada}`,
      html:    construirEmailAdmin(reserva),
    }).catch((err: Error) => console.error("[reserva] Error al enviar aviso al admin:", err));

    return NextResponse.json({ ok: true, reservaId });
  } catch (error) {
    console.error("[reserva] Error enviando correo al cliente:", error);
    return NextResponse.json({ ok: false, error: "Error al enviar la confirmación" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PLANTILLAS DE CORREO
// ─────────────────────────────────────────────────────────────────────────────

const NARANJA  = "#FF9500";
const NARANJA2 = "#E08600";

/** Fila de tabla compartida en ambos correos */
const fila = (etiqueta: string, valor: string) => `
  <tr>
    <td style="padding:9px 14px;color:#6b7280;font-size:14px;white-space:nowrap;border-bottom:1px solid #f3f4f6;">${etiqueta}</td>
    <td style="padding:9px 14px;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #f3f4f6;">${valor}</td>
  </tr>`;

/** Cabecera HTML compartida */
function cabecera(titulo: string, subtitulo: string) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:12px 12px 0 0;">
    <tr>
      <td style="padding:28px 32px;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${NARANJA};margin-bottom:8px;">
          ${NEGOCIO.nombre}
        </div>
        <div style="font-size:22px;font-weight:800;color:#ffffff;line-height:1.3;">
          ${titulo}
        </div>
        <div style="font-size:14px;color:rgba(255,255,255,.65);margin-top:6px;">
          ${subtitulo}
        </div>
      </td>
    </tr>
  </table>`;
}

/** Pie HTML compartido */
function pie() {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:0 0 12px 12px;border-top:1px solid #e5e7eb;">
    <tr>
      <td style="padding:20px 32px;text-align:center;">
        <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">
          ¿Tienes alguna duda? Contáctanos:
        </p>
        <p style="margin:0;font-size:13px;">
          <a href="mailto:${NEGOCIO.emailContacto}" style="color:${NARANJA};font-weight:600;text-decoration:none;">${NEGOCIO.emailContacto}</a>
          &nbsp;·&nbsp;
          <a href="${NEGOCIO.telefonoHref}" style="color:${NARANJA};font-weight:600;text-decoration:none;">${NEGOCIO.telefono}</a>
        </p>
        <p style="margin:12px 0 0;font-size:11px;color:#9ca3af;">
          Por favor, no responda directamente a este mensaje si fue enviado automáticamente.
        </p>
      </td>
    </tr>
  </table>`;
}

/** Correo de confirmación que recibe el cliente */
function construirEmailCliente(r: ReservaCompleta): string {
  const vehiculoIcon = r.vehiculo === "moto" ? "🏍️ Moto" : "🚗 Coche";
  const planTexto    = r.planNombre ? ` · Plan <strong>${r.planNombre}</strong>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Reserva confirmada · ${NEGOCIO.nombre}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <tr><td>${cabecera("✅ Tu reserva está confirmada", "Hemos registrado todos los datos. Aquí tienes el resumen:")}</td></tr>

          <!-- RESUMEN RESERVA -->
          <tr>
            <td style="padding:24px 32px 8px;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${NARANJA};">
                Datos de la reserva
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                ${fila("📅 Entrada",          formatoLegible(r.entrada))}
                ${fila("📅 Salida",           formatoLegible(r.salida))}
                ${fila("🛫 Terminal entrada", r.terminalEntrada)}
                ${fila("🛬 Terminal salida",  r.terminalSalida)}
                ${fila("🚗 Vehículo",         `${vehiculoIcon} · ${r.modelo} · <code>${r.matricula.toUpperCase()}</code>`)}
                ${fila("💶 Total estimado",   `<span style="color:${NARANJA};font-size:16px;">${formatoEuros(r.total)}</span>${planTexto}`)}
              </table>
            </td>
          </tr>

          <!-- INSTRUCCIONES -->
          <tr>
            <td style="padding:24px 32px 8px;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${NARANJA};">
                ¿Qué hacer a continuación?
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 16px;background:#fff8f0;border-left:3px solid ${NARANJA};border-radius:0 6px 6px 0;margin-bottom:10px;display:block;">
                    <p style="margin:0 0 4px;font-weight:700;font-size:14px;color:#111827;">🛫 Al inicio del viaje</p>
                    <p style="margin:0;font-size:13px;color:#374151;line-height:1.5;">
                      Llama al <strong>${NEGOCIO.telefono}</strong> aproximadamente <strong>20 minutos antes</strong> de llegar al aeropuerto.
                      Te confirmaremos el punto de encuentro y realizaremos una inspección del vehículo.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:10px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#fff8f0;border-left:3px solid ${NARANJA2};border-radius:0 6px 6px 0;">
                    <p style="margin:0 0 4px;font-weight:700;font-size:14px;color:#111827;">🛬 Al regreso del viaje</p>
                    <p style="margin:0;font-size:13px;color:#374151;line-height:1.5;">
                      Llama al <strong>${NEGOCIO.telefono}</strong> en cuanto recojas tu equipaje.
                      Te indicaremos el punto de entrega del vehículo.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- AVISO PAGO -->
          <tr>
            <td style="padding:0 32px 24px;">
              <div style="padding:14px 18px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:13px;color:#166534;line-height:1.6;">
                💳 <strong>No pagas nada por adelantado.</strong> El pago se realiza directamente al entregar el vehículo en el parking.
              </div>
            </td>
          </tr>

          <!-- PIE -->
          <tr><td>${pie()}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Correo de aviso al administrador / dueño del parking */
function construirEmailAdmin(r: ReservaCompleta): string {
  const vehiculoIcon = r.vehiculo === "moto" ? "🏍️ Moto" : "🚗 Coche";
  const planTexto    = r.planNombre ? ` · Plan ${r.planNombre}` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Nueva reserva · ${NEGOCIO.nombre}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <tr><td>${cabecera("🚗 Nueva reserva recibida", `${formatoLegible(r.entrada)} · ${r.terminalEntrada}`)}</td></tr>

          <!-- DATOS RESERVA -->
          <tr>
            <td style="padding:24px 32px 8px;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${NARANJA};">
                📅 Reserva
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                ${fila("Entrada",          formatoLegible(r.entrada))}
                ${fila("Salida",           formatoLegible(r.salida))}
                ${fila("Días",             `${r.dias} día${r.dias !== 1 ? "s" : ""}`)}
                ${fila("Terminal entrada", r.terminalEntrada)}
                ${fila("Terminal salida",  r.terminalSalida)}
                ${fila("Precio total",     `<strong style="color:${NARANJA};font-size:15px;">${formatoEuros(r.total)}</strong>${planTexto}`)}
              </table>
            </td>
          </tr>

          <!-- DATOS CLIENTE -->
          <tr>
            <td style="padding:20px 32px 8px;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${NARANJA};">
                👤 Cliente
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                ${fila("Nombre",    r.nombre)}
                ${fila("Email",     `<a href="mailto:${r.email}" style="color:${NARANJA};text-decoration:none;">${r.email}</a>`)}
                ${fila("Teléfono",  `<a href="tel:${r.telefono.replace(/\s/g,"")}" style="color:${NARANJA};text-decoration:none;">${r.telefono}</a>`)}
                ${fila("Vehículo",  vehiculoIcon)}
                ${fila("Matrícula", `<code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${r.matricula.toUpperCase()}</code>`)}
                ${fila("Modelo",    r.modelo)}
              </table>
            </td>
          </tr>

          <!-- PIE -->
          <tr><td>${pie()}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
