import { NextResponse } from "next/server";
import { buildDemo, saveReservations } from "@/lib/store";

/** Restaura los datos de demostración (zona de peligro de Configuración) */
export async function POST() {
  await saveReservations(buildDemo());
  return NextResponse.json({ ok: true });
}
