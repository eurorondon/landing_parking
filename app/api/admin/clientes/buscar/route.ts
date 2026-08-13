import { NextResponse } from "next/server";
import { findClienteByPhone } from "@/lib/store";

/**
 * Busca un cliente ya existente por teléfono, para autocompletar el alta
 * manual de una reserva desde el panel (`ReservationFormModal`).
 */
export async function GET(request: Request) {
  const telefono = new URL(request.url).searchParams.get("telefono")?.trim() ?? "";
  if (!telefono) {
    return NextResponse.json({ ok: false, error: "Falta el teléfono" }, { status: 400 });
  }

  const cliente = await findClienteByPhone(telefono);
  return NextResponse.json({ ok: true, cliente });
}
