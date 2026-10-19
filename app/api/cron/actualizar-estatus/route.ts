import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Actualiza el estatus de las reservas según su fecha/hora de entrada y salida.
 * Misma regla que `ReservasController::actionActualizarEstatus` (Yii2 / parkingplus):
 *
 *   - Salida ya pasada                → 2 Finalizada   (salvo 0 Cancelada, 2, 4 Rezagada)
 *   - Entrada pasada y salida futura  → 3 Activa       (salvo 0, 2, 3, 4)
 *
 * Cancelada (0) y Rezagada (4) son estados manuales y nunca se tocan. La
 * comparación se hace en MySQL con NOW() (hora del servidor, España), igual que
 * el cron original, sobre fecha + hora guardadas en la reserva.
 *
 * Pensado para un cron del VPS que llame cada pocos minutos (Passenger recicla
 * el proceso Node, no se puede dejar un timer dentro de la app). Protegido con
 * CRON_SECRET, enviado como `?secret=` o cabecera `x-cron-secret`.
 *
 * `?dry=1` solo cuenta lo que cambiaría, sin escribir nada.
 */
export async function GET(req: NextRequest) {
  const esperado = process.env.CRON_SECRET;
  if (!esperado) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET no configurado" }, { status: 500 });
  }

  const recibido = req.nextUrl.searchParams.get("secret") ?? req.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const dry = req.nextUrl.searchParams.get("dry") === "1";

  try {
    if (dry) {
      const [fin, act] = await Promise.all([
        prisma.$queryRaw<{ n: bigint }[]>`
          SELECT COUNT(*) AS n FROM reservas
          WHERE TIMESTAMP(fecha_salida, hora_salida) <= NOW()
            AND estatus NOT IN (0, 2, 4)`,
        prisma.$queryRaw<{ n: bigint }[]>`
          SELECT COUNT(*) AS n FROM reservas
          WHERE TIMESTAMP(fecha_entrada, hora_entrada) <= NOW()
            AND TIMESTAMP(fecha_salida, hora_salida) > NOW()
            AND estatus NOT IN (0, 2, 3, 4)`,
      ]);
      return NextResponse.json({ ok: true, dry: true, finalizadas: Number(fin[0].n), activas: Number(act[0].n) });
    }

    // Primero finalizadas, después activas: una reserva ya vencida no pasa por "activa".
    const finalizadas = await prisma.$executeRaw`
      UPDATE reservas SET estatus = 2
      WHERE TIMESTAMP(fecha_salida, hora_salida) <= NOW()
        AND estatus NOT IN (0, 2, 4)`;
    const activas = await prisma.$executeRaw`
      UPDATE reservas SET estatus = 3
      WHERE TIMESTAMP(fecha_entrada, hora_entrada) <= NOW()
        AND TIMESTAMP(fecha_salida, hora_salida) > NOW()
        AND estatus NOT IN (0, 2, 3, 4)`;

    return NextResponse.json({ ok: true, finalizadas, activas });
  } catch (err) {
    console.error("[cron/actualizar-estatus] Error:", err);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
