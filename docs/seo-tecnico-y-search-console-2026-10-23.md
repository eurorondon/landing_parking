# SEO técnico, Cloudflare y Search Console — 23-oct-2026

Resumen de lo hecho en la sesión del 23 de octubre de 2026 y de lo que queda pendiente.
Todo el código está en `main` y desplegado en producción (Plesk).

## Commits

| Commit | Contenido |
|---|---|
| `c12c2bc` | og:image, sitemap/robots, canonicals con barra final, textos, JSON-LD del blog, banner de cookies |
| `dfe4649` | Fix: la redirección 301 daba 500 en producción (cabeceras de host de Passenger/Cloudflare); usa el dominio canónico fijo |
| `4e01991` | Redirección 301 de `www.parkingaeromadrid.es` al dominio sin `www` en un solo salto |

## Hecho en el código

- **og:image y metadatos** (`lib/seo.ts`, `app/layout.tsx`): `metadataBase` = `https://parkingaeromadrid.es`; imagen `public/og-default.png` (1200×630); `twitter:card` grande. El helper `pageMetadata()` genera title, description, canonical, Open Graph y Twitter. Lo usan la home, las 7 landings, el blog y las páginas legales. Cada página tiene title y description propios.
- **Sitemap y robots** (`app/sitemap.ts`, `app/robots.ts`): 25 URLs con barra final. Robots bloquea `/admin/`, `/api/`, `/planes/` y `/reservar/`.
- **Barra final** (`next.config.mjs`, `middleware.ts`): `trailingSlash: true` y `skipTrailingSlashRedirect: true`. El middleware redirige con 301 la variante sin barra, solo en páginas públicas. `/api/*` no se redirige, para no romper el cron ni los `fetch`. En producción redirige al dominio canónico fijo (`SITE_URL`).
- **www**: el middleware redirige `www.*` → dominio sin `www` con un solo 301.
- **Enlaces**: logo a `/`; `#reserva` pasa a `#calcular`; anclas del footer como `/#…`; el botón "Reservar" del Header usa `/#calcular` fuera de la home y las landings. Comprobados los ids `como-funciona`, `ventajas`, `faq`, `contacto` en la home.
- **FAQ duplicada** (`components/LandingPageSEO.tsx`): se filtra la sección marcador con id `faq`; queda un solo bloque de FAQ.
- **Textos**: "precio exacto" → "precio estimado". Eliminados "Mejor precio garantizado", "Ahorra hasta 45 min", "hasta un 30 % de ahorro" (y "15 % y 30 %" del blog), "servicios equivalentes o superiores", "+20.000", "4.9★" y las estrellas del badge. En la T1 se quitó Alitalia y "puerta de embarque".
- **JSON-LD**: el blog usa `BlogPosting` (autor, fechas, imagen, `mainEntityOfPage`). FAQPage solo con preguntas visibles. No hay `AggregateRating`.
- **Banner de cookies** (`components/CookieBanner.tsx`): Rechazar / Configurar / Aceptar; panel con Necesarias, Analítica y Publicidad. Consent Mode v2 en denegado por defecto, más `functionality_storage` y `security_storage` en granted.

## Cloudflare (revisado, sin cambios)

- Bot Fight Mode: apagado. "Configure AI bot policies": Search y Agent en Allow, Training en Disallow. Con user-agent de Googlebot, bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot y Applebot la web responde 200.
- Security Events (24 h): bloqueos de exploits de React (CVE-2025-55182), escaneos desde cloud y **GoogleOther** (rastreador de I+D de Google, no de búsqueda) por la regla "Manage AI bots". Googlebot no aparece bloqueado.
- **Crawler Hints / IndexNow**: decidido dejarlo apagado (opcional; solo ayuda a Bing/Yandex).

## Search Console

- Propiedad de dominio verificada con la cuenta `parkingaeromadrid@gmail.com`. El DNS tiene dos TXT `google-site-verification`: el antiguo (`wyKA5j…`, de otra cuenta; **no borrar**) y el nuevo (`Y0_5nt…`).
- Sitemap enviado con la URL completa `https://parkingaeromadrid.es/sitemap.xml` (en propiedades de dominio no vale la ruta relativa).
- Indexación solicitada para: `/`, `/parking-barajas/`, `/parking-valet-aeropuerto-madrid/` y `/parking-larga-estancia-aeropuerto-madrid/`.
- Estado visto el 23-oct (datos del rastreo del 16-oct, anteriores a los cambios): 34 páginas indexadas y 40 sin indexar (22 con redirección, 12 alternativa con canonical adecuado, 3 duplicadas sin canonical, 3 rastreadas sin indexar). Lo indexado eran las URLs sin barra y copias en `ipv4.`. Google había elegido `www` como canónica de la home.
- `ipv4.parkingaeromadrid.es` SÍ resuelve (A → 91.213.46.180, DNS only; registro de prueba olvidado, comprobado el 30-oct) y sirve el sitio con 200. `www` ya redirige y desde el middleware cualquier subdominio redirige con 301 al dominio principal. Pendiente: borrar el registro DNS `ipv4` cuando Google reasigne las páginas.
- 94 clics en búsqueda web desde el 29-jul-2026.

## Pendiente

1. **Prueba de resultados enriquecidos** (punto 3.6 del listado): pasar por search.google.com/test/rich-results la home, una landing (`/parking-barajas/`) y un artículo del blog. Debe salir FAQ y migas de pan sin errores.
2. **Banner de cookies en producción** (4.1): probar en ventana privada Rechazar, Configurar y Aceptar, y comprobar que el consentimiento llega a GTM.
3. **Search Console, a los 3–7 días**: revisar Indexación → Páginas (deben bajar "Página con redirección" y "Duplicada" y subir las URLs con barra) y Sitemaps (debe poner "Correcto" con ~25 URLs; el 23-oct salía "Error temporal de procesamiento").
4. **Quién tiene el TXT antiguo**: en Search Console → Configuración → Usuarios y permisos, ver los propietarios.

### Opcional

- Quitar "Reserva al Mejor Precio" (larga estancia) y "Reserva y Ahorra" (barato) de los títulos de las landings.
- Añadir la dirección real del parking al JSON-LD (`address`/`geo`) cuando se tenga.
- Activar Crawler Hints (IndexNow) en Cloudflare si se quiere indexación rápida en Bing.

## Notas técnicas

- Producción es Plesk/Passenger detrás de Cloudflare; el deploy es manual. Las cabeceras `x-forwarded-*` y `host` no son fiables para construir URLs de redirección: por eso se usa `SITE_URL`.
- Algunos archivos del repo son CRLF y otros LF; al editar hay que conservar el fin de línea original.
- La tabla de Cloudflare con IPs o rayos concretos no se guarda aquí; solo las conclusiones.
