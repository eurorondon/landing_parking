# Rendimiento y accesibilidad (PageSpeed Insights, móvil) — 13 oct 2026

Sitio medido: https://parkingaeromadrid.es (proyecto `landing_parking`, Next.js 15, Plesk, Cloudflare plan gratuito).
Es el mismo trabajo que se hizo en `parkingaeropuertomadrid24` (ver su
`docs/auditoria-rendimiento-y-accesibilidad-2026-10-09.md`), adaptado a este proyecto.

Mediciones con la API de PageSpeed Insights (móvil, Lighthouse, 4G lenta simulada). La clave de la
API **no** se guarda en el repo ni en este documento.

## 1. Resultados (mediana de las pasadas)

"Antes": 12/10, 3 pasadas por ruta (la portada con `?q=` aleatorio). "Después": 13/10, 4 pasadas por ruta,
con todos los cambios de las secciones 3 y 4 ya desplegados (mediana = media de las dos centrales).

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
Datos reales (CrUX) de la portada antes de los cambios: LCP ~1,7 s y FCP ~1,3 s («rápidos»), INP ~225 ms
(límite 200 ms).

## 2. Cómo leer las puntuaciones (importante)

- **Es normal que la nota cambie entre pasadas** (p. ej. 92 → 87 → 80). El laboratorio de PageSpeed
  comparte servidores y simula un móvil lento: ±5 puntos es lo habitual y 10–20 también pasa. En esta
  auditoría la misma página dio 62, 97, 98 y 98 en cuatro pasadas seguidas. Hay que **medir 3–4 veces y
  usar la mediana**, nunca la mejor ni la peor.
- **TBT (Total Blocking Time)**: tiempo, entre el primer contenido y que la página sea usable, en el que
  el hilo principal está bloqueado por tareas de JavaScript de más de 50 ms (de cada una cuenta solo lo que
  pasa de 50 ms). Bueno < 200 ms, malo > 600 ms. Es lo que más mueve la nota; un solo pico de 1.000 ms
  baja 20–30 puntos. El equivalente con usuarios reales es el **INP**.
- **Lo que cuenta para Google es el dato de campo** (CrUX, «Datos reales de usuarios», promedio de 28 días).
  Es estable y no depende del servidor de la prueba.
- **Medir la URL limpia** (`/`, sin `?q=`) en pagespeed.web.dev, y repetir tras unos segundos: la primera
  pasada tras un despliegue sale peor (caché fría). Mis pasadas independientes usan `?q=<aleatorio>`,
  que **se salta la caché de Cloudflare** (el HTML sale del origen: ~1,3 s en lugar de ~0,7 s), así que
  salen algo peores que lo que ve un usuario.
- Una ruta inexistente (404) falsea el resultado; comprobar que responde 200 antes de medir.

## 3. Cambios hechos en el código

Commits: `5cc47b7`, `88d6299`, `4ce49e3`, `6d9a2be`, `19b871d` (y `7dbb4f7`, este documento).

1. **Una sola calculadora** en las 7 landings SEO. `BookingForm` se montaba dos veces (hero + sección
   móvil). Ahora hay una con `id="calcular"` en `.hero-right`; en móvil se apila bajo el texto (mismo
   estilo oscuro de la portada). Cambio visible: antes en móvil era una sección clara aparte.
2. **DatePicker diferido** (`components/ui/DatePickerCalendar.tsx`, `next/dynamic`, `ssr: false`):
   `react-day-picker`, su locale y su CSS solo se cargan al abrir el calendario (con precarga en
   hover/foco). El botón formatea la fecha sin `date-fns`. Mientras carga se ve un **skeleton** con la forma
   del calendario (`.datepicker-skeleton*`, estilos en `landing.css` y `admin.css`).
3. **Google Tag Manager** (`app/layout.tsx`): `strategy="lazyOnload"` y además se carga en la **primera
   interacción** (scroll, toque, clic, tecla) o a los **8 s** como tope. Los eventos del `dataLayer`
   (p. ej. `reserva_confirmada`) se encolan y GTM los procesa al cargar: no se pierde ninguno. El
   Consent Mode v2 sigue en su script `beforeInteractive`.
   - Coste: las visitas que rebotan sin tocar nada en menos de 8 s no se ven en GA4 ni en Google Ads
     (p. ej. clics accidentales, bots). Ads sí cobra el clic. Ver pendiente 1.
4. **StickyButtons diferido**: `StickyButtons.tsx` es un envoltorio con `next/dynamic` (`ssr: false`); el
   componente real está en `StickyButtonsInner.tsx`.
5. **StickyButtons siempre visibles en el hero** (`4ce49e3`): solo se ocultan si el pie o la calculadora
   están a la vista **y el hero no** (el hero es `section.hero` en la portada y `section.seo-hero` en las
   landings). Efecto conocido: sobre el formulario tapan el borde derecho de la caja «Precio estimado» y
   del botón naranja.
6. **Accesibilidad (96 → 100)**:
   - Pie: `<h4>` → `<h3>` (orden de encabezados).
   - Placeholder de fechas `#9aa0a6` → `#6b7075` (contraste 2,6 → 4,9).
   - `.bform-cta` y botón de vehículo activo del hero oscuro: texto negro sobre naranja (antes blanco
     2,19 y gris 1,32). Cambio visible.

## 4. Cambios de contenido y UX (sesión del 13/10)

- **Badge «★★★★★ Más de 20.000 clientes satisfechos»** quitado del hero del index (`Hero.tsx`). Las landings
  SEO conservan el suyo y la franja de cifras («+20.000») no se tocó.
- **Placeholders de las terminales** de entrada y salida: «Selecciona» (el `aria-label` sigue siendo
  «Terminal de entrada/salida»). `BookingModal.tsx` no se usa en páginas públicas y no se cambió.
- **El `alert()` de `BookingForm` se sustituyó por un aviso dentro del formulario** (`.bform-aviso`,
  `role="alert"`): «Selecciona las fechas de entrada y salida.» / «Revisa las fechas de entrada y salida.»;
  se quita al editar cualquier campo. Variante clara (escritorio) y oscura (hero móvil).
- Se probó cambiar el texto del botón a «CALCULAR PRECIO» y se **descartó**: se mantienen
  «📅 Selecciona las fechas» y «VER DISPONIBILIDAD Y RESERVAR».

## 5. Cloudflare (hecho el 13/10 desde el panel)

Tres Cache Rules en `parkingaeromadrid.es` (comprobadas con `curl`: `MISS` y luego `HIT`):

| Regla | Cubre | Duración |
|---|---|---|
| Cache imagenes Next | `/_next/image` | 1 mes (ignora cache-control) |
| Cache HTML publico | todo el HTML salvo `/`, `/admin`, `/api`, `/planes`, `/reservar`, `/_next`, `_rsc` | 2 h (ignora cache-control) |
| Cache portada | solo `/` | respeta el `s-maxage=60` del servidor (el precio «desde» sale de la BD) |

`/planes`, `/reservar`, `/admin`, `/api/*` y `?_rsc=` siguen `DYNAMIC` (el flujo de reserva y el panel no se
cachean). Con HIT el documento HTML baja de ~1,3 s a ~0,7 s en la prueba simulada.

⚠️ **Tras cada despliegue hay que purgar la caché** (Caching → Configuration → Purge Everything): el HTML
cacheado (2 h) puede apuntar a chunks con hash que ya no existen. Cómo comprobar que un despliegue entró:
mirar los hashes de las hojas `/_next/static/css/*.css` que enlaza el HTML (si no cambian tras un cambio
de CSS, el servidor sigue con la compilación anterior).

## 6. Por qué la portada no pasa de ~85–90 con regularidad

Es tiempo de bloqueo por JavaScript, no red (FCP ~1,5 s, TTFB ~60 ms):

| Qué | Tiempo (móvil simulado) |
|---|---|
| Evaluación de scripts | 680–895 ms |
| De ellos, `chunks/1255-….js` (runtime cliente de Next.js, 173 KB sin comprimir) | 340–506 ms |
| Estilo y layout (`landing.css` ~2.400 líneas, aplicado a todo) | 164–224 ms |
| `gtm.js` + `gtag` (ya diferidos hasta la interacción) | ~200 ms |

El runtime de Next + React DOM es el coste mínimo de cualquier página con App Router y no se puede quitar.
La portada alterna entre 69/80 (TBT 470–680 ms) y 89/91 (TBT ~130 ms): mediana ~85.

## 7. Ideas descartadas (y por qué)

- **Skeleton en el index** para los fotogramas en blanco del film de PageSpeed: no mejora la puntuación
  (FCP/LCP solo cuentan texto, imágenes o SVG), puede añadir CLS y no se pintaría antes porque el CSS bloquea
  el primer pintado. Los ~1,5 s en blanco son esperar HTML + CSS en 4G simulada; la caché de Cloudflare ya
  recorta la parte del HTML.
- **`ssr: false` en `TrustBar`, `ServiciosLimpieza` y `Footer`**: llevan texto indexable.
- **Diferir `CookieBanner`**: gestiona el Consent Mode y Clarity; podría descuadrar la medición.
- **CSS crítico en línea**: ganancia de décimas, con Next es complicado.

## 8. Pendientes

1. **Medición (GTM en interacción).** Comparar 1–2 semanas los **clics de Google Ads frente a las sesiones de
   GA4** con el periodo anterior. Si la brecha crece mucho, bajar el tope de 8 s a 4 s
   (`setTimeout(load,8000)` en `app/layout.tsx`).
2. **Revisar PageSpeed / Search Console («Experiencia en la página») hacia el 28/10/2026** (dato de campo de
   28 días tras los cambios).
3. ~~Verificar que el commit `19b871d` (aviso en el formulario) esté desplegado~~ ✅ Verificado el 14/10: el CSS
   publicado ya contiene `.bform-aviso`, y también están en producción el badge quitado, el GTM en la primera
   interacción y los botones flotantes en el hero. (Cómo comprobarlo: buscar la clase nueva en las hojas
   `/_next/static/css/*.css` que enlaza el HTML.)
4. Revisar en el móvil los cambios visibles: texto negro del CTA, formulario en el hero de las landings,
   botones flotantes sobre el formulario.
5. Estilo y layout (~200 ms): valorar partir `landing.css` por rutas.
6. Condición alternativa para excluir la cabecera `RSC` de la regla del HTML (la navegación real usa
   `?_rsc=`, que sí está excluido).
7. **Cloudflare, «Ignore query string» y Smart Tiered Cache.** Descubierto el 14/10 en `parkingplus.es`: en la
   regla «Cache HTML publico» se puede activar Cache key → «Ignore query string» (gratis). Los clics de Google
   Ads llevan `?gclid=…&utm_…`, una URL distinta cada vez, y sin esa opción nunca aciertan la caché. Valorar
   añadirlo (las páginas públicas son estáticas y los parámetros se leen en el navegador; no aplicarlo a
   `/planes`, `/reservar`, `/admin` ni `/api`, ya excluidos de la regla). Valorar también Smart Tiered Cache
   (Caching → Tiered Cache) para reducir los MISS en centros de datos fríos.
8. **Sitio hermano `parkingplus.es`:** otro proyecto de la misma familia (carpeta `parkingplus-dashboard`),
   con su propio documento. No confundir al comparar notas de pagespeed.web.dev.

## Anexo: cómo medir

Script de Node (guardarlo fuera del repo y ejecutarlo desde una carpeta con `.env.local` que contenga
`PSI_KEY=`; no imprimir ni pegar la clave):

```js
import fs from "fs";
const key = fs.readFileSync(".env.local","utf8").match(/^PSI_KEY=(.*)$/m)[1].trim().replace(/^["']|["']$/g,"");
const base = "https://parkingaeromadrid.es";
for (const p of ["/", "/parking-barajas"]) {
  for (let i = 0; i < 4; i++) {
    const url = base + p + "?q=" + Math.random().toString(36).slice(2); // pasadas independientes
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=accessibility&key=${key}`);
    const L = (await r.json()).lighthouseResult; if (!L) continue;
    const a = L.audits;
    console.log(p, "perf", Math.round(L.categories.performance.score*100),
      "a11y", Math.round(L.categories.accessibility.score*100),
      "LCP", a["largest-contentful-paint"].displayValue, "TBT", a["total-blocking-time"].displayValue);
  }
}
```

En Git Bash de Windows, una ruta `/` suelta se convierte en `C:/Program Files/Git/`; usar
`MSYS_NO_PATHCONV=1` o pasar las rutas por otro medio.
