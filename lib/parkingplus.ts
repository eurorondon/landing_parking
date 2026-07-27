/**
 * ============================================================
 *  INTEGRACIÓN PARKINGPLUS — reservas de agencia
 *
 *  Cada reserva de la landing se envía también al panel de
 *  parkingplus-dashboard, que la registra en SU base de datos
 *  con medio_reserva = 2 (Agencia) y agencia = "Parking Aero
 *  Madrid". El guardado local en parkingaeromadrid_db no cambia.
 *
 *  Variables necesarias en .env.local:
 *    PARKINGPLUS_API_URL=https://admin.parkingplus.es
 *    PARKINGPLUS_API_KEY=xxxx   (misma que AGENCY_API_KEY en el dashboard)
 *    PARKINGPLUS_AGENCIA="Parking Aero Madrid"   (opcional)
 *
 *  Sin PARKINGPLUS_API_URL/KEY el envío se omite en silencio
 *  (modo desarrollo).
 * ============================================================
 */

import type { ReservaCompleta } from "./types";
import { aplicaNocturnidad } from "./pricing";

/**
 * El dashboard guarda las terminales como "TERMINAL 1" / "N/E": sus PDFs
 * (sobres y planning) parten el texto por el espacio y componen "T" + número.
 * Enviando "T1" a secas el sobre imprimiría solo "T".
 */
function terminalParkingPlus(terminal: string): string {
  const numero = terminal.match(/[1-4]/)?.[0];
  return numero ? `TERMINAL ${numero}` : "N/E";
}

export interface ResultadoEnvioParkingPlus {
  ok: boolean;
  /** true si el envío se omitió por falta de configuración */
  omitido?: boolean;
  nroReserva?: number;
  error?: string;
}

export function parkingplusConfigurado(): boolean {
  return Boolean(process.env.PARKINGPLUS_API_URL && process.env.PARKINGPLUS_API_KEY);
}

/**
 * Envía la reserva al endpoint de agencias de parkingplus-dashboard.
 * Nunca lanza: devuelve `{ ok: false, error }` para que quien llama
 * decida cómo alertar (el flujo del cliente no debe romperse).
 */
export async function enviarReservaAParkingPlus(
  r: ReservaCompleta,
): Promise<ResultadoEnvioParkingPlus> {
  if (!parkingplusConfigurado()) {
    console.log("[parkingplus] PARKINGPLUS_API_URL/KEY sin configurar — envío omitido");
    return { ok: true, omitido: true };
  }

  const baseUrl = process.env.PARKINGPLUS_API_URL!.replace(/\/+$/, "");

  // La marca/modelo viaja como un solo campo en la landing ("Seat Ibiza")
  const partes = r.modelo.trim().split(/\s+/);
  const marca  = partes.length > 1 ? partes[0] : r.modelo.trim();
  const modelo = partes.length > 1 ? partes.slice(1).join(" ") : null;

  const extras = [
    r.planNombre   ? `Plan: ${r.planNombre}`     : null,
    r.lavadoNombre ? `Lavado: ${r.lavadoNombre}` : null,
  ].filter(Boolean).join(" · ");

  // El suplemento nocturno no viaja como campo propio: se deduce igual que en
  // el cálculo del precio, así también lo aplican las altas del panel.
  const nocturno = aplicaNocturnidad(r.entrada.slice(11, 16), r.salida.slice(11, 16));

  try {
    const res = await fetch(`${baseUrl}/api/external/agencias/reservas`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key":    process.env.PARKINGPLUS_API_KEY!,
      },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        nombre_completo:  r.nombre.trim(),
        movil:            r.telefono.trim(),
        correo:           r.email.trim(),
        matricula:        r.matricula.trim().toUpperCase(),
        marca,
        modelo,
        entrada:          r.entrada,   // "YYYY-MM-DDTHH:mm" hora Madrid
        salida:           r.salida,
        terminal_entrada: terminalParkingPlus(r.terminalEntrada),
        terminal_salida:  terminalParkingPlus(r.terminalSalida),
        monto_total:      r.total,
        dias:             r.dias,
        // Lo que el sobre de ParkingPlus imprime bajo el plan y el "INCLUYE:"
        plan:             r.plan,
        servicios:        r.servicios,
        nocturno,
        observaciones:    `[${r.vehiculo}] Reserva agencia Parking Aero Madrid${extras ? ` · ${extras}` : ""}`,
        agencia:          process.env.PARKINGPLUS_AGENCIA || "Parking Aero Madrid",
      }),
    });

    if (!res.ok) {
      const texto = await res.text().catch(() => "");
      console.error("[parkingplus] Error al registrar reserva:", res.status, texto);
      return { ok: false, error: `HTTP ${res.status}: ${texto.slice(0, 300)}` };
    }

    const data = (await res.json()) as { nro_reserva?: number };
    console.log(`✅ [parkingplus] Reserva registrada como agencia · nro_reserva ${data.nro_reserva}`);
    return { ok: true, nroReserva: data.nro_reserva };
  } catch (err) {
    console.error("[parkingplus] Excepción al registrar reserva:", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
