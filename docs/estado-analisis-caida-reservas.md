# Estado y próximos pasos — análisis de la caída de reservas

**Foto del 2 de octubre de 2026.** Documento para retomar el trabajo en la
próxima sesión sin repetir nada. El método detallado (paso a paso, consultas y
URLs) está en `docs/manual-analisis-caida-reservas.md`, y el informe visual en el
panel `/admin` → **Análisis de caída**.

## 1. Resumen en pocas líneas

- Las reservas web pasaron de **~7 al día** (3 ago – 13 sep) a **~3,5 al día**
  desde el **14 de septiembre** (ingresos semanales −57 %). El ticket medio no
  cambió (≈56–63 €).
- El **tráfico de pago casi no cayó** (−12 %); lo que cayó fue la **conversión**
  (~13 % → ~7 %), sobre todo en **móvil** (Android e iPhone). Escritorio estable.
- **Parte es estacionalidad**: el nicho baja desde la semana ISO 37 y en octubre
  se queda en ≈66–73 % del nivel de agosto → lo esperable son **~5 reservas/día**,
  no 7. Pero el **escalón de la semana del 14 de septiembre (−46 %) es propio de
  la web**: ningún comparador, en ningún año, lo muestra.
- En Google Ads: **Performance Max pausada (22 sep)** y casi apagada desde el 16,
  cuota de impresiones baja (~28 %, perdida sobre todo por ranking), CPC +23 %,
  coste por conversión ×1,9.
- **No hay un único culpable demostrado.** Coincidieron: fallo de acceso en
  Android (14–16 sep, ya corregido), rediseño del hero (14 sep), y las pausas de
  Ads (18 y 22 sep).

## 2. Qué se hizo (todo de solo lectura salvo lo indicado)

| Plataforma | Qué se miró |
|---|---|
| Base de datos (VPS, por SSH) | Reservas por día/semana y canal; antelación de reserva; precios y temporadas |
| Google Analytics 4 | Canales antes/después; eventos clave y coste; dispositivo; embudo de páginas |
| Google Ads | Estado de campañas; historial de cambios; palabras clave; cuota de impresiones; términos de búsqueda |
| Código (git) | Cambios en la web alrededor del 14 de septiembre; cálculo de precios |
| Web en móvil | Formulario `/reservar` (sin enviar nada) |
| Otras bases del VPS (ParkingPlus, aparcabarajas) | **Estacionalidad** por mes y por semana (2025 vs 2026), antelación |

## 3. Descartado

- **Cálculo de precios del 14 sep:** la tabla de temporadas está vacía → recargo
  0 € con el código viejo y con el nuevo; el ticket medio no cambió.
- **Palabras clave pausadas el 18 sep:** de muy poco gasto; las que más convierten
  siguen activas.
- **`/reservar` en móvil:** se ve y funciona bien.
- **Fallo de Android (HTTP/3 y ECH):** contribuyó al inicio, **no explica lo
  persistente** (en iPhone, donde el sitio cargaba bien, la conversión bajó igual).

## 4. Qué hay hecho en el proyecto

- **Panel `/admin` → «Análisis de caída»:** reservas en vivo desde la BD, gráfico
  de línea de tiempo con 12 eventos y franja de nivel esperado (~5/día), conclusión
  con indicador en vivo (media de 7 días), explicación paso a paso, estacionalidad
  mensual, plan por fases, calendario y tabla de decisión.
  Datos externos (Analytics/Ads/estacionalidad): `lib/analisis-caida.ts`.
- **Microsoft Clarity** instalado en `CookieBanner.tsx`: se carga **solo** tras
  «Aceptar todo» y recibe el consentimiento por su API (`consentv2`). Los
  formularios `ReservaForm` y `BookingModal` llevan `data-clarity-mask`.
- **Políticas** de cookies y de privacidad actualizadas con Clarity (y matizadas
  las transferencias internacionales por Google y Microsoft).
- **Manual** `docs/manual-analisis-caida-reservas.md`.
- **Git:** todo subido a `origin/main` (último commit `b5ad801`).
  ⚠️ **El hosting es Plesk con despliegue manual: nada de esto está en producción
  hasta que se despliegue.**

## 5. Calendario y regla de decisión

El 1–2 de octubre se editaron anuncios, URLs finales y palabras clave en Ads.
Google necesita **7–14 días** para estabilizar, y los datos de esos días no son
comparables.

| Cuándo | Qué hacer |
|---|---|
| **Hoy – 9 oct** | **Congelar Ads y la web.** Solo fases 0, 1 y 4 (ver §6) |
| **9 – 16 oct** | Evaluar los cambios de Google con la **media de 7 días** del panel |
| **Desde el 16 oct** | Si hace falta, **un cambio cada vez** y 2 semanas entre uno y otro |

| Media de 7 días | Lectura | Qué hacer |
|---|---|---|
| ≥ 4,5 al día | Nivel de temporada | Seguir esperando; no tocar nada |
| 3,5 – 4,5 | Algo por debajo | Mejoras pequeñas en Ads (pujas y anuncios de las genéricas) |
| < 3,5 | Sigue la caída propia | Cambios mayores, uno cada vez: prueba pequeña de Performance Max, revisar `/planes` → `/reservar` en móvil; después, la prueba del hero |

## 6. Pendientes

**Del usuario**
1. **Desplegar a Plesk** los cambios cuando decida (recuerda: hasta el 16 oct, plan
   de no tocar Ads; el despliegue de Clarity/políticas es pasivo para el cliente).
2. En Clarity: **enmascarado en estricto** en los ajustes del proyecto y
   **comprobar en producción** con «Aceptar todo» (`clarity('metadata', …)` debe
   devolver `GRANTED`).
3. **Revisar con su gestoría** los textos de privacidad y cookies (sobre todo
   «transferencias internacionales»). La política de cookies tampoco nombra a
   Google Tag Manager ni a las etiquetas de Google Ads.
4. **Confirmar que el admin ya entra con datos móviles** (Android). Si funciona,
   borrar el registro DNS `ipv4.` de prueba.
5. Preguntar **por qué se pausó Performance Max** (22 sep) y las palabras clave
   (18, 21 y 29 sep), y quién hizo los cambios.

**Fase 0 — medir antes de tocar (solo lectura, para la próxima sesión)**
- Ver el **gráfico diario y el estado de Performance Max** (cuándo y por qué cayó
  antes de pausarse).
- **Comparativa de subastas** de Google Ads (¿ha subido la competencia? CPC +23 %).
- **Clics de WhatsApp y teléfono:** esta BD solo registra reservas web; parte de la
  caída podría haberse desplazado ahí sin medirse.
- **Hueco del 15–16 de agosto** (casi sin visitas y 0 reservas el 16): sin investigar.
- Estacionalidad en euros: **estancia media y ticket por mes**; índice mensual
  **solo web**.
- Con **Clarity**: ver grabaciones de móvil que llegaron a `/reservar` y no
  confirmaron, clics que no responden y errores de JavaScript.

**Fase 1 — seguimiento:** Analytics ve ~73 % de las reservas y Ads ~48 %. Asegurar
que cada reserva dispara `reserva_confirmada` y que Ads la usa como conversión.

**Fase 4 — atribución real:** guardar en cada reserva su origen (UTM/`gclid`).

**Fases 2 y 3 (solo tras evaluar el 16 oct):** subir pujas o mejorar anuncios;
prueba pequeña de Performance Max (2 semanas, presupuesto bajo, la reserva como
objetivo); revisar el paso `/planes` → `/reservar` y probar el hero anterior al
14 de septiembre.

**Definir la rentabilidad:** coste máximo aceptable por reserva. Hoy Ads sale a
~17–24 € por reserva con un ticket de ~58 €, y no se conoce el margen.

## 7. Cómo retomar

1. **Panel:** abre `/admin` → *Análisis de caída* y mira la media de 7 días y el
   indicador de decisión.
2. **Google Analytics / Ads:** están en **otro perfil de Chrome** (con la extensión
   «Claude in Chrome» instalada y con sesión iniciada en ese perfil). Selecciona ese
   navegador y confirma que ves la propiedad de `parkingaeromadrid.es`. Los IDs de
   cuenta y propiedad se copian de la barra de direcciones (ver el manual, §2 y §3).
3. **Base de datos:** consultas de solo lectura por SSH con `plesk db -e`, siempre
   con el prefijo de la base (`parkingaeromadrid_db.reservas`). Ver manual §1 y §6 bis.
4. **Actualizar el informe:** editar `lib/analisis-caida.ts` (eventos, pasos,
   estacionalidad, plan) y las fechas `FECHA_CORTE`, `PIVOTE` y `FECHA_DECISION`;
   comprobar con `npx tsc --noEmit`.

## 8. Datos clave para no volver a calcularlos

| Dato | Valor |
|---|---|
| Reservas web/día, 3 ago – 13 sep → desde 14 sep | ~7,2 → ~3,5 |
| Nivel esperable en octubre solo por estacionalidad | ≈ 4,8 – 5,3 al día |
| Índice mensual (ParkingPlus 2025, por entrada) | ene 0,70 · feb 0,77 · mar 0,90 · abr 1,12 · may 0,93 · jun 1,08 · jul 1,07 · **ago 1,48** · sep 1,07 · oct 0,94 · nov 0,83 · dic 1,12 |
| Antelación (web, 2025) | media 5–6 días en sep–may; 8–11 en jun–ago; ~50 % reserva a ≤2 días |
| Antelación de esta web (2026) | media 2,4–4,4 días; 61–76 % a ≤2 días |
| Móvil: eventos clave por usuario (antes → después) | 0,18 → 0,10; escritorio 0,29 → 0,25 |
| Google Ads, por día (1 ago–17 sep → 18 sep–2 oct) | impresiones 482 → 230; clics 48 → 32; CPC 0,88 → 1,08 €; conversiones 3,4 → 1,5 |
| Coste por reserva en Ads | ≈11 € (agosto) → ≈17–24 € (septiembre) |
| Estados de reserva en la BD | 0 = cancelada, 1 = confirmada, 2 = finalizada, 3 = dentro |
| Canal de reserva en la BD | 1 = teléfono, 2 = agencia, 3 = web |

## 9. Cautelas que no hay que olvidar

- **No se puede cuantificar con precisión** cuánto de la caída es estacional: según
  el sitio y el año va de una pequeña parte a la mayor parte. Lo robusto es el
  escalón de la semana 38.
- **Muestras pequeñas** (esta web: 25–60 reservas por semana → ruido de ±15–20 %).
- **Un solo año completo** de comparación (2025); ParkingPlus y aparcabarajas son
  negocios distintos.
- **Analytics y Ads miden solo una parte** de las reservas: sirven para tendencias.
- **Las coincidencias de fechas no prueban la causa.**
- **Performance Max:** reactivarla no garantiza recuperar nada; antes hay que saber
  por qué cayó. Como mucho explica un tercio de la caída.
- En ParkingPlus, excluir `agencia = 'Parking Aero Madrid'` (son las reservas de
  esta web duplicadas) y las canceladas (`estatus = 0`).
