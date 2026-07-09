import { NextResponse } from "next/server";
import { getPricingParams, savePricingParams, type PricingParams } from "@/lib/store";

/** Lee los precios base (base, €/día, seguro) derivados de la BD */
export async function GET() {
  return NextResponse.json({ ok: true, pricing: await getPricingParams() });
}

/**
 * Guarda los precios base: regenera registro_precios y actualiza el seguro.
 * Esta landing es la única dueña de la BD, así que no hay conflicto.
 */
export async function PUT(request: Request) {
  let body: Partial<PricingParams>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }

  const current = await getPricingParams();
  const merged: PricingParams = {
    basePrice:      Number(body.basePrice      ?? current.basePrice),
    dayPrice:       Number(body.dayPrice       ?? current.dayPrice),
    insurancePrice: Number(body.insurancePrice ?? current.insurancePrice),
  };

  if ([merged.basePrice, merged.dayPrice, merged.insurancePrice].some((v) => !Number.isFinite(v) || v < 0)) {
    return NextResponse.json({ ok: false, error: "Los precios deben ser números ≥ 0" }, { status: 400 });
  }

  const saved = await savePricingParams(merged);
  return NextResponse.json({ ok: true, pricing: saved });
}
