import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** GET /api/servicios — devuelve todos los servicios activos (lavados, extras, etc.) */
export async function GET() {
  try {
    const servicios = await prisma.servicios.findMany({
      where: { estatus: 1 },
      select: { id: true, nombre_servicio: true, costo: true },
    });
    return NextResponse.json({ servicios });
  } catch (error) {
    console.error("[api/servicios]", error);
    return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 });
  }
}
