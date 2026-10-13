# Auditoría de rendimiento y accesibilidad (móvil) — 13 oct 2026

Sitio medido: https://parkingaeromadrid.es (proyecto `landing_parking`, Next.js 15, Plesk, Cloudflare plan gratuito).
Mediciones con la API de PageSpeed Insights (móvil, Lighthouse, 4G lenta simulada). La clave se leyó
de un `.env.local` ajeno al repo y no se guarda aquí. Es el mismo trabajo que se hizo en
`parkingaeropuertomadrid24` (ver su `docs/auditoria-rendimiento-y-accesibilidad-2026-10-09.md`).

## Resultados (mediana de las pasadas)

"Antes": 3 pasadas el 12/10 (la portada se midió después, con 3 pasadas con `?q=`). "Después": 4 pasadas el 13/10,
con todos los cambios y las reglas de Cloudflare ya desplegados. Mediana = media de las dos centrales.

| Página | Rendimiento antes → después | Accesibilidad antes → después |
|---|---|---|
| `/` | 70 → **85** | 94 → 100 |
| `/parking-barajas` | 63 → **96** | 94 → 100 |
| `/parking-aeropuerto-madrid-barato` | 64 → **96** | 94 → 100 |
| `/parking-larga-estancia-aeropuerto-madrid` | 72 → **98** | 94 → 100 |
| `/parking-terminal-1-barajas` | 56 → **91** | 94 → 100 |
| `/parking-terminal-2-barajas` | 56 → **95** | 94 → 100 |
| `/parking-terminal-4-barajas` | 72 → **92** | 94 → 100 |
| `/parking-valet-aeropuerto-madrid` | 63 → **95** | 94 → 100 |
| `/blog` | 77 → **99** | 98 → 100 |
| `/aviso-legal` | 79 → **98** | 100 |
| `/cookies` | 65 → **99** | 100 |
| `/privacidad` | 71 → **99** | 100 |
| `/planes` | 88 → **97** | 100 |
| `/reservar` | 65 → **97** | 100 |

LCP: de 4–6,6 s a ~2 s en las landings. CLS 0 (0,005 en `/planes`).

Notas de lectura:
- El laboratorio es ruidoso. Aparecen pasadas sueltas de 62–69 con TBT de 1–3 s en páginas que
  el resto de las veces dan 95+; no son regresiones.
- La portada es bimodal: 69/80 (TBT 470–680 ms) frente a 89/91 (TBT 120–130 ms). Mediana ~85.
- Mis pasadas usan `?q=<aleatorio>` para que sean independientes, lo que se salta la caché de
  Cloudflare (HTML del origen, ~1,3 s en lugar de ~0,7 s). La URL limpia, como la ve un usuario,
  sale algo mejor.

## Cambios hechos

Commits `5cc47b7` y `88d6299`.

1. **Una sola calculadora** en las 7 landings SEO. `BookingForm` se montaba dos veces (hero + sección
   móvil). Ahora hay una con `id="calcular"` en `.hero-right`; en móvil se apila bajo el texto
   (mismo estilo oscuro de la portada). Cambio visible: antes en móvil era una sección clara aparte.
2. **DatePicker diferido** (`components/ui/DatePickerCalendar.tsx`, `next/dynamic`, `ssr: false`):
   `react-day-picker`, su locale y su CSS solo se cargan al abrir el calendario (precarga en
   hover/foco). El botón formatea la fecha sin `date-fns`. Skeleton con la forma del calendario
   (estilos en `landing.css` y `admin.css`).
3. **Google Tag Manager** (`app/layout.tsx`): `strategy="lazyOnload"` y, además, se carga en la
   **primera interacción** (scroll, toque, clic, tecla) o a los **8 s** como tope. Los eventos del
   `dataLayer` (p. ej. `reserva_confirmada`) se encolan y no se pierden. El Consent Mode v2 sigue
   en su script `beforeInteractive`.
4. **StickyButtons diferido**: `StickyButtons.tsx` es un envoltorio con `next/dynamic` (`ssr: false`);
   el componente real está en `StickyButtonsInner.tsx`.
5. **Accesibilidad (96 → 100)**:
   - Pie: `<h4>` → `<h3>` (orden de encabezados).
   - Placeholder de fechas `#9aa0a6` → `#6b7075` (contraste 2,6 → 4,9).
   - `.bform-cta` y botón de vehículo activo del hero oscuro: texto negro sobre naranja
     (antes blanco 2,19 y gris 1,32). Cambio visible.

## Cloudflare (hecho el 13/10 desde el panel)

Tres Cache Rules en `parkingaeromadrid.es` (comprobadas con `curl`: `MISS` y luego `HIT`):

| Regla | Cubre | Duración |
|---|---|---|
| Cache imagenes Next | `/_next/image` | 1 mes (ignora cache-control) |
| Cache HTML publico | todo el HTML salvo `/`, `/admin`, `/api`, `/planes`, `/reservar`, `/_next`, `_rsc` | 2 h (ignora cache-control) |
| Cache portada | solo `/` | respeta el `s-maxage=60` del servidor (el precio «desde» sale de la BD) |

`/planes`, `/reservar`, `/admin`, `/api/*` y `?_rsc=` siguen `DYNAMIC`.

⚠️ **Tras cada despliegue hay que purgar la caché** (Caching → Configuration → Purge Everything);
el HTML cacheado (2 h) puede apuntar a chunks con hash que ya no existen.

## Por qué la portada no pasa de ~85–90 con regularidad

Tiempo de bloqueo (TBT) por JavaScript, no por red (FCP ~1,5 s, TTFB ~60 ms):
- Runtime cliente de Next.js (`chunks/1255-….js`, 173 KB sin comprimir): 340–500 ms de scripting
  en el móvil simulado. Es el coste mínimo de una página con App Router; no se puede quitar.
- `gtm.js` + `gtag`: ~200 ms (ahora diferidos hasta la interacción).
- Estilo y layout: ~200 ms (`landing.css` ~2.400 líneas, aplicado a todo).

## Pendientes

1. **Medición.** Con GTM en la primera interacción desaparecen del informe de GA4/Ads las visitas
   que rebotan sin tocar nada en menos de 8 s. Comparar 1–2 semanas clics de Ads vs. sesiones de GA4
   con el periodo anterior; si la brecha crece mucho, bajar el tope de 8 s a 4 s
   (`setTimeout(load,8000)` en `app/layout.tsx`).
2. **Revisar PageSpeed hacia el 28/10/2026** (datos de campo de 28 días): LCP real ~1,7 s y
   FCP ~1,3 s eran «rápidos»; el INP estaba en ~225 ms (límite 200 ms).
3. Revisar en el navegador los cambios visibles de color en el CTA (texto negro) y el formulario
   en móvil de las landings SEO.
4. Estilo y layout (~200 ms): valorar partir `landing.css` por rutas.
5. Condición alternativa para excluir la cabecera `RSC` de la regla del HTML (en el otro proyecto la
   exclusión por cabecera no se aplicó; la navegación real usa `?_rsc=`, que sí está excluido).
6. Valorar quitar el `alert()` de `verPlanes()` en `BookingForm` (mala UX en móvil).
