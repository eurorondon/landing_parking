import { NextResponse } from "next/server";
import { DEFAULT_CONFIG, type AdminConfig } from "@/lib/admin";
import { getConfig, saveConfig } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ ok: true, config: await getConfig() });
}

export async function PUT(request: Request) {
  let body: Partial<AdminConfig>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON no válido" }, { status: 400 });
  }
  const cfg: AdminConfig = { ...DEFAULT_CONFIG, ...(await getConfig()), ...body };
  await saveConfig(cfg);
  return NextResponse.json({ ok: true, config: cfg });
}
