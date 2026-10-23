import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/seo";

/**
 * 1) Páginas públicas: redirige con 301 la URL sin barra final a la canónica
 *    con barra (trailingSlash: true + skipTrailingSlashRedirect en next.config).
 * 2) Protege el panel de administración y sus APIs.
 *
 * ⚠️ CAMBIAR: la contraseña se define en .env.local → ADMIN_PASSWORD
 * (por defecto "admin123", solo para desarrollo).
 *
 * Nota para producción: esto es una protección simple por cookie,
 * suficiente para un panel de un solo dueño. Si el proyecto crece,
 * sustituir por un sistema de autenticación real (Auth.js, Supabase Auth…).
 */
export function middleware(req: NextRequest) {
  const { pathname: rawPath } = req.nextUrl;
  // Con trailingSlash la ruta puede llegar con o sin "/" final
  const pathname = rawPath.length > 1 && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath;

  // www → dominio sin www (Google llegó a elegir www como canónica)
  const host = req.headers.get("host") ?? "";
  if (host.toLowerCase().startsWith("www.")) {
    // Se añade la barra final aquí mismo para no encadenar dos redirecciones
    const ruta = rawPath.endsWith("/") ? rawPath : rawPath + "/";
    return NextResponse.redirect(`${SITE_URL}${ruta}${req.nextUrl.search}`, 301);
  }

  const esAdmin = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!esAdmin) {
    // Página pública sin barra final → 301 a la versión con barra
    if (pathname !== "/" && !rawPath.endsWith("/")) {
      // URL absoluta construida a mano: nextUrl.clone() volvería a quitar la
      // barra final, y Next rechaza un Location relativo.
      // En producción (Passenger + Cloudflare) las cabeceras de host no son
      // fiables y daban 500, así que se usa el dominio canónico.
      const origen =
        process.env.NODE_ENV === "production"
          ? SITE_URL
          : `${req.nextUrl.protocol}//${req.nextUrl.host}`;
      return NextResponse.redirect(`${origen}${rawPath}/${req.nextUrl.search}`, 301);
    }
    return NextResponse.next();
  }

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
  // Todo salvo estáticos de Next, /api no-admin y archivos con extensión
  // (sitemap.xml, robots.txt, imágenes…)
  matcher: ["/((?!_next/|api/(?!admin)|.*\\..*).*)"],
};
