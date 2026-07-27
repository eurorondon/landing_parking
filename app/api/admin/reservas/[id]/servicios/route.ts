import { NextResponse } from "next/server";
import { getServiciosReserva } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

/**
 * Servicios contratados de una reserva (parking, seguro, lavado, nocturnidad).
 * Lo consume el bloque "Servicios incluidos" de la ficha del panel.
 * La ruta queda protegida por el middleware de /api/admin.
 */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const servicios = await getServiciosReserva(id);
    return NextResponse.json({ ok: true, servicios });
  } catch (err) {
    console.error("[admin/reservas/servicios] Error al obtener los servicios:", err);
    return NextResponse.json(
      { ok: false, error: "Error al obtener los servicios" },
      { status: 500 },
    );
  }
}
