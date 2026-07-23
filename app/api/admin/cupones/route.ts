import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizarCodigo, parseFechaCupon, type CuponPayload } from "@/lib/cupones";

/**
 * Gestión de cupones desde el panel (protegido por el middleware de /admin).
 *
 *   GET  /api/admin/cupones  → lista completa, más recientes primero
 *   POST /api/admin/cupones  → crea un cupón
 *
 * Fechas: el formulario envía "YYYY-MM-DD"; parseFechaCupon las amplía a
 * día completo (desde 00:00:00, hasta 23:59:59).
 */

export async function GET() {
  const cupones = await prisma.cupones.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json({
    ok: true,
    cupones: cupones.map((c) => ({ ...c, valor: Number(c.valor) })),
  });
}

export async function POST(request: Request) {
  let body: CuponPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }

  const codigo = normalizarCodigo(body.codigo ?? "");
  const tipo   = body.tipo === "fijo" ? "fijo" : "porcentaje";
  const valor  = Number(body.valor);

  if (!/^[A-Z0-9_-]{3,50}$/.test(codigo)) {
    return NextResponse.json(
      { ok: false, error: "El código debe tener 3-50 caracteres (letras, números, guiones)" },
      { status: 400 },
    );
  }
  if (!Number.isFinite(valor) || valor <= 0 || (tipo === "porcentaje" && valor > 100)) {
    return NextResponse.json(
      { ok: false, error: tipo === "porcentaje" ? "El porcentaje debe estar entre 0 y 100" : "El importe debe ser mayor que 0" },
      { status: 400 },
    );
  }

  const maxUsos = body.maxUsos != null && Number(body.maxUsos) > 0 ? Math.floor(Number(body.maxUsos)) : null;

  try {
    const cupon = await prisma.cupones.create({
      data: {
        codigo,
        tipo,
        valor,
        valido_desde: parseFechaCupon(body.validoDesde, false),
        valido_hasta: parseFechaCupon(body.validoHasta, true),
        max_usos:     maxUsos,
        campana:      (body.campana ?? "").trim() || null,
      },
    });
    return NextResponse.json({ ok: true, cupon: { ...cupon, valor: Number(cupon.valor) } });
  } catch (err: unknown) {
    // P2002 = violación de unique (código repetido)
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002") {
      return NextResponse.json({ ok: false, error: `Ya existe un cupón con el código ${codigo}` }, { status: 409 });
    }
    console.error("[admin/cupones] Error al crear:", err);
    return NextResponse.json({ ok: false, error: "No se pudo crear el cupón" }, { status: 500 });
  }
}
