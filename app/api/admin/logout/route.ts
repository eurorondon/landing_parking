import { NextResponse } from "next/server";

/** Cierra la sesión del panel eliminando la cookie */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("pam_admin", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
