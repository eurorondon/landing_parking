import { NextResponse } from "next/server";
import { obtenerParadasActivas } from "@/lib/paradas-db";

/**
 * GET /api/paradas → periodos sin servicio activos y aún no terminados.
 *
 * Público: lo consulta el formulario de reservas para bloquear días y horas.
 * No expone el id. `descripcion` se muestra al cliente, así que debe ser un
 * texto apto para público (p. ej. "Navidad").
 *
 * Si la BD falla devuelve lista vacía (el formulario sigue funcionando); la
 * validación real está en POST /api/reserva.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const paradas = await obtenerParadasActivas();
    return NextResponse.json(
      { ok: true, paradas: paradas.map(({ inicio, fin, descripcion }) => ({ inicio, fin, descripcion })) },
      // 1 min de caché: un cambio del admin tarda como mucho eso en verse
      { headers: { "Cache-Control": "public, max-age=60" } },
    );
  } catch (err) {
    console.error("[api/paradas] Error:", err);
    return NextResponse.json({ ok: true, paradas: [] });
  }
}
