import { NextResponse, type NextRequest } from "next/server";

/**
 * Protege el panel de administración y sus APIs.
 *
 * ⚠️ CAMBIAR: la contraseña se define en .env.local → ADMIN_PASSWORD
 * (por defecto "admin123", solo para desarrollo).
 *
 * Nota para producción: esto es una protección simple por cookie,
 * suficiente para un panel de un solo dueño. Si el proyecto crece,
 * sustituir por un sistema de autenticación real (Auth.js, Supabase Auth…).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // El login debe ser accesible sin sesión
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const sesion = req.cookies.get("pam_admin")?.value;

  if (sesion === password) return NextResponse.next();

  // API sin sesión → 401; página sin sesión → redirige al login
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
