import { NextResponse } from "next/server";
import { calcularPrecioReserva } from "@/lib/precio-db";

/**
 * GET /api/precio?dias=N[&nocturno=1][&vehiculo=autocaravana]
 *
 * Envoltura HTTP sobre calcularPrecioReserva (lib/precio-db.ts), la
 * fuente única de precio que comparten la web y el panel.
 *
 * Responde: { costo_parking, costo_seguro, costo_nocturnidad, costo_autocaravana, total }
 * · Cuando nocturno=1, costo_nocturnidad se suma al total.
 * · Cuando vehiculo=autocaravana, se suma el recargo (dias × €/día de config).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Días de parking ya calculados (usar calculateRawParkingDays en cliente)
    const dias           = parseInt(searchParams.get("dias") || "0", 10);
    const nocturno       = searchParams.get("nocturno") === "1";
    const esAutocaravana = searchParams.get("vehiculo") === "autocaravana";

    const precio = await calcularPrecioReserva({ dias, nocturno, esAutocaravana });
    return NextResponse.json(precio);
  } catch (error) {
    console.error("[api/precio] Error:", error);
    return NextResponse.json(
      { error: "Error al calcular precio" },
      { status: 500 }
    );
  }
}
