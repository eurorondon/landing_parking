import nodemailer from "nodemailer";
import { NEGOCIO } from "./config";
import { formatoLegible } from "./datetime";
import { formatoEuros, calculateRawParkingDays } from "./pricing";
import type { ReservaAdmin } from "./admin";
import type { ReservaCompleta } from "./types";
import type { Terminal } from "./config";

/**
 * ============================================================
 *  CORREOS DE RESERVA
 *
 *  Módulo compartido por:
 *   · POST /api/reserva                      (envío al crear la reserva)
 *   · POST /api/admin/reservas/[id]/reenviar-email  (reenvío manual)
 *
 *  Variables necesarias en .env.local:
 *    SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS
 *    MAIL_FROM, MAIL_ADMIN
 * ============================================================
 */

/** ¿Hay credenciales SMTP configuradas? */
export function smtpConfigurado(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/**
 * Crea el transporte SMTP de Nodemailer con las variables de entorno.
 */
export function crearTransporte() {
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
 * Envía al cliente el correo de confirmación de su reserva.
 * Lanza si el SMTP falla, para que quien llame decida qué hacer.
 */
export async function enviarConfirmacionCliente(
  r: ReservaCompleta,
  opciones: { replyTo?: string } = {},
): Promise<void> {
  const mailFrom = process.env.MAIL_FROM || `"${NEGOCIO.nombre}" <${process.env.SMTP_USER}>`;
  await crearTransporte().sendMail({
    from:    mailFrom,
    to:      r.email,
    replyTo: opciones.replyTo ?? process.env.MAIL_ADMIN ?? NEGOCIO.emailDueno,
    subject: `✅ Reserva confirmada · ${NEGOCIO.nombre} · ${formatoLegible(r.entrada)}`,
    html:    construirEmailCliente(r),
  });
}

/**
 * Convierte una reserva del panel (ReservaAdmin) al formato que esperan
 * las plantillas de correo. Los datos que la BD no guarda en columnas
 * propias (terminal de salida, plan, lavado) se recuperan de las notas,
 * que es donde los deja `POST /api/reserva` al crear la reserva desde la web.
 */
export function reservaAdminACompleta(r: ReservaAdmin): ReservaCompleta {
  const notas = r.notes ?? "";
  const buscar = (etiqueta: string) =>
    notas.match(new RegExp(`${etiqueta}:\\s*([^·]+)`))?.[1].trim() || undefined;

  const terminalSalida = (buscar("Terminal salida") as Terminal | undefined) ?? r.terminal;

  return {
    nombre:          r.name,
    telefono:        r.phone,
    email:           r.email,
    matricula:       r.plate,
    modelo:          r.model,
    vehiculo:        r.vehicleType,
    entrada:         r.checkIn,
    salida:          r.checkOut,
    terminalEntrada: r.terminal,
    terminalSalida,
    dias:            calculateRawParkingDays(new Date(r.checkIn), new Date(r.checkOut)),
    total:           r.price,
    planNombre:      buscar("Plan"),
    lavadoNombre:    buscar("Lavado"),
  };
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
        <table cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
          <tr>
            <td style="vertical-align:middle;padding-right:14px;">
              <img src="https://parkingaeromadrid.es/logo.jpg"
                   alt="${NEGOCIO.nombre}"
                   width="52" height="52"
                   style="display:block;border-radius:10px;border:2px solid rgba(255,255,255,.15);" />
            </td>
            <td style="vertical-align:middle;">
              <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${NARANJA};">
                ${NEGOCIO.nombre}
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,.45);margin-top:2px;">
                Aeropuerto Madrid-Barajas
              </div>
            </td>
          </tr>
        </table>
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
export function construirEmailCliente(r: ReservaCompleta): string {
  // En altas desde el panel (ocultarAutocaravana) no se menciona el tipo:
  // la fila queda solo con modelo y matrícula.
  const ocultarTipo  = r.vehiculo === "autocaravana" && r.ocultarAutocaravana;
  const vehiculoIcon = r.vehiculo === "autocaravana" ? "🚐 Autocaravana" : "🚗 Coche";
  const vehiculoValor = [
    ocultarTipo ? "" : vehiculoIcon,
    r.modelo,
    `<code>${r.matricula.toUpperCase()}</code>`,
  ].filter(Boolean).join(" · ");
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
                ${fila("🚗 Vehículo",         vehiculoValor)}
                ${r.cuponCodigo ? fila("🎟️ Descuento", `${r.cuponCodigo} · <span style="color:#16a34a;">−${formatoEuros(r.cuponDescuento ?? 0)}</span>`) : ""}
                ${fila("💶 Total estimado",   `<span style="color:${NARANJA};font-size:16px;">${formatoEuros(r.total)}</span>${planTexto}`)}
                ${r.lavadoNombre ? fila("🧹 Lavado incluido", r.lavadoNombre) : ""}
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
export function construirEmailAdmin(r: ReservaCompleta): string {
  const vehiculoIcon = r.vehiculo === "autocaravana" ? "🚐 Autocaravana" : "🚗 Coche";
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
                ${r.cuponCodigo ? fila("Cupón", `${r.cuponCodigo} · −${formatoEuros(r.cuponDescuento ?? 0)}`) : ""}
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
