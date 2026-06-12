import { NextResponse } from "next/server";

/** Inicia sesión en el panel: comprueba la contraseña y deja una cookie httpOnly */
export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // ⚠️ CAMBIAR: la contraseña se define en .env.local → ADMIN_PASSWORD
  const password = process.env.ADMIN_PASSWORD ?? "admin123";

  if (body.password !== password) {
    return NextResponse.json({ ok: false, error: "Contraseña incorrecta" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("pam_admin", password, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // sesión de 7 días
  });
  return res;
}
