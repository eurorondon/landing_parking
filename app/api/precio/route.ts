import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/precio?dias=N
 *
 * Replica exacta de la lógica del dashboard (parkingplus-dashboard)
 * usando las mismas tablas del schema Prisma compartido:
 *   - registro_precios   → precio base por días
 *   - precio_temporada   → suplemento de temporada (si está activo)
 *   - servicios id=4     → coste del seguro
 *
 * Lógica de bloques (igual que Yii2):
 *   1-18 días   → N × precioDia + planCosto  [+ N × temporadaRate]
 *   19-30 días  → precioBloque               [+ 30 × temporadaRate]
 *   >30 días    → bloques de 30; resto >= 18 → bloque completo,
 *                 resto < 18 → resto × precioDia (sin temporada)
 *
 * Responde: { costo_parking, costo_seguro, total }
 */

function calcularPrecioParking(
  dias: number,
  precioBloque: number,
  precioDia: number,
  planCosto: number,
  temporadaRate: number
): number {
  let total = 0;
  let remaining = dias;

  if (dias <= 18) {
    return dias * precioDia + planCosto + dias * temporadaRate;
  }
  if (dias <= 30) {
    return precioBloque + 30 * temporadaRate;
  }

  while (remaining > 30) {
    total += precioBloque + 30 * temporadaRate;
    remaining -= 30;
  }
  if (remaining >= 18) {
    total += precioBloque + 30 * temporadaRate;
  } else {
    total += remaining * precioDia; // sin temporada en el resto (igual que Yii2)
  }
  return total;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Recibe los días de parking ya calculados (usar calculateRawParkingDays en cliente)
    const dias = parseInt(searchParams.get("dias") || "0", 10);

    // Coste del seguro (servicio id=4)
    const seguro = await prisma.servicios.findFirst({
      where: { id: 4 },
      select: { costo: true },
    });
    const costoSeguro = Number(seguro?.costo || 0);

    if (dias <= 0) {
      return NextResponse.json({ costo_parking: 0, costo_seguro: costoSeguro, total: costoSeguro });
    }

    // Derivar precioDia, planCosto y precioBloque desde la tabla
    const [r1, r2, r30] = await Promise.all([
      prisma.registro_precios.findFirst({ where: { cantidad: 1 } }),
      prisma.registro_precios.findFirst({ where: { cantidad: 2 } }),
      prisma.registro_precios.findFirst({ where: { cantidad: 30 } }),
    ]);

    const precioDia  = r1 && r2 ? Number(r2.costo) - Number(r1.costo) : 7;
    const planCosto  = r1 ? Number(r1.costo) - precioDia : 23.98;
    const precioBloque = r30 ? Number(r30.costo) : 18 * precioDia + planCosto;

    // Suplemento de temporada activa
    const precioTemporada = await prisma.precio_temporada.findFirst({
      where: { status: "activo" },
    });
    const temporadaRate = precioTemporada ? Number(precioTemporada.precio) : 0;

    let costoParking: number;

    if (dias <= 30) {
      // Búsqueda exacta en tabla para 1-30 días
      const registro = await prisma.registro_precios.findFirst({
        where: { cantidad: dias },
        orderBy: { id: "asc" },
      });
      costoParking = Number(registro?.costo ?? dias * precioDia + planCosto);
      if (temporadaRate > 0) {
        costoParking += dias * temporadaRate;
      }
    } else {
      // Fórmula de bloques para >30 días
      costoParking = calcularPrecioParking(dias, precioBloque, precioDia, planCosto, temporadaRate);
    }

    return NextResponse.json({
      costo_parking: costoParking,
      costo_seguro:  costoSeguro,
      total:         costoParking + costoSeguro,
    });
  } catch (error) {
    console.error("[api/precio] Error:", error);
    return NextResponse.json(
      { error: "Error al calcular precio" },
      { status: 500 }
    );
  }
}
