import { prisma } from "@/lib/prisma";

/**
 * ============================================================
 *  FRANJA DE NOCTURNIDAD — lectura desde BD (servidor)
 *
 *  La franja del servicio id=11 se configura en la BD de ESTA marca
 *  (`parkingaeromadrid_db.servicios.hora_inicio` / `hora_fin`), igual que ya
 *  se hace con su coste. Antes estaba escrita a mano en `lib/pricing.ts`.
 *
 *  Módulo aparte y sin más dependencias que Prisma a propósito: `precio-db`
 *  importa de `store`, así que meterlo allí crearía un import circular en
 *  cuanto `store` necesitara la franja.
 * ============================================================
 */

export interface FranjaNocturnaDB {
  hora_inicio: string | null;
  hora_fin: string | null;
}

/**
 * Franja configurada del suplemento nocturno.
 *
 * Devuelve `null` si el servicio no existe o no tiene franja; en ese caso los
 * helpers de `lib/pricing` caen a su fallback (00:29–04:15).
 */
export async function getFranjaNocturna(): Promise<FranjaNocturnaDB | null> {
  try {
    const svc = await prisma.servicios.findFirst({
      where: { id: 11 },
      select: { hora_inicio: true, hora_fin: true },
    });
    return svc ?? null;
  } catch (err) {
    // Nunca romper el cálculo de precio por no poder leer la franja: se
    // continúa con el fallback.
    console.error("[nocturnidad-db] No se pudo leer la franja nocturna:", err);
    return null;
  }
}
