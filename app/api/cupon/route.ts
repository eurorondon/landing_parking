import { NextResponse } from "next/server";
import { validarCupon, calcularDescuento } from "@/lib/cupones";

/**
 * GET /api/cupon?codigo=VERANO10&total=82.50
 *
 * Valida un código promocional desde la web pública y devuelve el
 * descuento que aplicaría sobre `total`.
 *
 * Responde:
 *   · válido:   { valido: true, codigo, tipo, valor, descuento, totalConDescuento }
 *   · inválido: { valido: false, motivo }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get("codigo") ?? "";
    const total  = parseFloat(searchParams.get("total") ?? "0");

    const resultado = await validarCupon(codigo);
    if (!resultado.valido) {
      return NextResponse.json(resultado);
    }

    const descuento = calcularDescuento(total, resultado.tipo, resultado.valor);
    return NextResponse.json({
      valido:            true,
      codigo:            resultado.codigo,
      tipo:              resultado.tipo,
      valor:             resultado.valor,
      descuento,
      totalConDescuento: Math.round((total - descuento) * 100) / 100,
    });
  } catch (error) {
    console.error("[api/cupon] Error:", error);
    return NextResponse.json({ valido: false, motivo: "No se pudo validar el código." }, { status: 500 });
  }
}
