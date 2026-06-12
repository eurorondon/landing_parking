import { NextResponse } from "next/server";
import { NEGOCIO } from "@/lib/config";
import { formatoLegible } from "@/lib/datetime";
import { formatoEuros } from "@/lib/pricing";
import type { ReservaCompleta } from "@/lib/types";
import type { ReservaAdmin } from "@/lib/admin";
import { genId, getConfig, getReservations, saveReservations } from "@/lib/store";

/**
 * ============================================================
 *  API DE RESERVAS — envío de correo al dueño del parking
 *
 *  CÓMO ACTIVAR EL ENVÍO REAL (con Resend, recomendado):
 *  1. Crear cuenta gratuita en https://resend.com
 *  2. Verificar el dominio del negocio (o usar onboarding@resend.dev para pruebas)
 *  3. Crear un archivo .env.local en la raíz con:
 *       RESEND_API_KEY=re_xxxxxxxxxxxx
 *       EMAIL_FROM="Parking Aéreo Madrid <reservas@tudominio.es>"
 *  4. El email del dueño (destinatario) se cambia en lib/config.ts → NEGOCIO.emailDueno
 *
 *  Sin RESEND_API_KEY la API no falla: registra la reserva en la
 *  consola del servidor y responde OK (modo desarrollo).
 *
 *  ALTERNATIVA CON NODEMAILER (SMTP propio): ver bloque comentado
 *  al final de este archivo.
 * ============================================================
 */

export async function POST(request: Request) {
  let reserva: ReservaCompleta;
  try {
    reserva = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }

  // Validación básica en servidor (no confiar solo en el cliente)
  const camposObligatorios: (keyof ReservaCompleta)[] = [
    "entrada", "salida", "terminalEntrada", "terminalSalida",
    "nombre", "email", "telefono", "matricula", "modelo",
  ];
  const faltan = camposObligatorios.filter((c) => !String(reserva[c] ?? "").trim());
  if (faltan.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Faltan campos: ${faltan.join(", ")}` },
      { status: 400 }
    );
  }
  if (new Date(reserva.salida) <= new Date(reserva.entrada)) {
    return NextResponse.json(
      { ok: false, error: "La salida debe ser posterior a la entrada" },
      { status: 400 }
    );
  }

  // ── Registrar la reserva en el panel de administración (estado: Pendiente) ──
  const cfg = await getConfig();
  const nuevaReserva: ReservaAdmin = {
    id: genId(),
    name: reserva.nombre.trim(),
    phone: reserva.telefono.trim(),
    email: reserva.email.trim(),
    vehicleType: "car", // la landing solo reserva coches; las motos se gestionan desde el panel
    plate: reserva.matricula.trim().toUpperCase(),
    model: reserva.modelo.trim(),
    // El panel maneja una sola terminal: guardamos la de entrada y
    // dejamos la de salida anotada en las notas.
    terminal: reserva.terminalEntrada,
    checkIn: reserva.entrada,
    checkOut: reserva.salida,
    status: "pending",
    price: reserva.total,
    notes: `Recibida desde la web · Terminal salida: ${reserva.terminalSalida}`,
    createdAt: new Date().toISOString(),
  };
  const todas = await getReservations();
  todas.unshift(nuevaReserva);
  await saveReservations(todas);

  const asunto = `🚗 Nueva reserva: ${reserva.nombre} · ${formatoLegible(reserva.entrada)} · ${reserva.terminalEntrada}`;
  const html = construirEmailHtml(reserva);

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Modo desarrollo: sin clave de Resend, solo registramos la reserva.
    console.log("📩 [SIMULADO] Reserva recibida (configura RESEND_API_KEY para envío real):");
    console.log(JSON.stringify(reserva, null, 2));
    return NextResponse.json({ ok: true, simulado: true });
  }

  try {
    // Envío real con la API HTTP de Resend (sin dependencias extra)
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Parking Aéreo Madrid <onboarding@resend.dev>",
        // Destinatario: el email configurado en el panel (/admin → Configuración),
        // con lib/config.ts → NEGOCIO.emailDueno como respaldo.
        to: [cfg.ownerEmail || NEGOCIO.emailDueno],
        reply_to: reserva.email,  // responder al email va directo al cliente
        subject: asunto,
        html,
      }),
    });

    if (!res.ok) {
      const detalle = await res.text();
      console.error("Error de Resend:", detalle);
      return NextResponse.json({ ok: false, error: "No se pudo enviar el correo" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error enviando la reserva:", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}

/** Plantilla HTML del correo que recibe el dueño del parking */
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
        ${fila("Entrada", formatoLegible(r.entrada))}
        ${fila("Salida", formatoLegible(r.salida))}
        ${fila("Terminal entrada", r.terminalEntrada)}
        ${fila("Terminal salida", r.terminalSalida)}
        ${fila("Días", String(r.dias))}
        ${fila("Precio total", formatoEuros(r.total))}
      </table>
      <h2 style="font-size:14px;color:#334155;padding:8px 12px 0;">👤 Datos del cliente</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${fila("Nombre", r.nombre)}
        ${fila("Email", r.email)}
        ${fila("Teléfono", r.telefono)}
        ${fila("Matrícula", r.matricula)}
        ${fila("Modelo", r.modelo)}
      </table>
    </div>
  </div>`;
}

/*
 * ============================================================
 *  ALTERNATIVA: envío con NODEMAILER (SMTP propio)
 *
 *  1. npm install nodemailer
 *  2. Variables en .env.local:
 *       SMTP_HOST=smtp.tudominio.es
 *       SMTP_PORT=465
 *       SMTP_USER=reservas@tudominio.es
 *       SMTP_PASS=xxxxxxxx
 *  3. Sustituir el bloque de fetch a Resend por:
 *
 *  import nodemailer from "nodemailer";
 *
 *  const transporter = nodemailer.createTransport({
 *    host: process.env.SMTP_HOST,
 *    port: Number(process.env.SMTP_PORT),
 *    secure: true,
 *    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
 *  });
 *
 *  await transporter.sendMail({
 *    from: `"${NEGOCIO.nombre}" <${process.env.SMTP_USER}>`,
 *    to: NEGOCIO.emailDueno,
 *    replyTo: reserva.email,
 *    subject: asunto,
 *    html,
 *  });
 * ============================================================
 */
