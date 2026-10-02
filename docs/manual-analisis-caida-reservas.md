# Manual: cómo analizar una caída de reservas (paso a paso)

Guía práctica, basada en el análisis real que se hizo el **2 de octubre de 2026**
cuando las reservas web pasaron de ~7 al día a ~3 al día. Explica cada paso en
cada plataforma (base de datos, Google Analytics, Google Ads, código, web móvil)
para que puedas repetirlo tú mismo la próxima vez que algo baje.

> Los resultados concretos de aquel análisis están en la sección **«Análisis de
> caída»** del panel `/admin` y, resumidos, al final de este documento.

---

## 0. La idea general (léela primero)

Cuando las reservas bajan, no se adivina: se **descompone el embudo** y se mira
dónde se rompe. El orden que funcionó es de "lo más real" a "lo más detallado":

```
 1. ¿Cuánto cayó de verdad?      → base de datos (reservas reales)
 2. ¿Cuándo empezó?              → serie diaria + línea de tiempo de cambios
 3. ¿Cayó el tráfico o la        → Google Analytics (visitas vs conversión)
    conversión?
 4. ¿En qué dispositivo y        → Analytics: dispositivo y embudo de páginas
    en qué paso?
 5. ¿Qué cambió en la publicidad?→ Google Ads (historial, campañas, términos)
 6. ¿Qué cambió en la web?       → historial de código (git)
 7. ¿Funciona el formulario?     → prueba en móvil
 8. Cruzar todo y ordenar las    → tabla evidencia → conclusión → certeza
    hipótesis
```

**Regla de oro:** primero mide, luego busca causas. Y ninguna coincidencia de
fechas es una prueba: solo es una pista.

### Qué necesitas tener a mano

| Necesidad | Detalle |
|---|---|
| Acceso al servidor (VPS Plesk) por SSH | Para consultar la base de datos. Solo lectura. Ver también `docs/diagnostico-caidas-reportadas.md` |
| Cuenta de Google con acceso a **Analytics (GA4)** y **Google Ads** | Ojo: puede estar en **otro perfil de Chrome** (ver §2.1) |
| El repositorio del proyecto en local | Para ver el historial de cambios con `git` |
| Un navegador con la extensión «Claude in Chrome» (opcional) | Permite a Claude navegar por tus paneles. Se instala **por perfil de Chrome** |

---

## 1. Paso 1 — Cuantificar la caída con la base de datos

Las reservas de la **base de datos** son la verdad: Analytics y Ads cuentan
eventos (y se pierden algunos), pero la BD tiene cada reserva real.

### 1.1 Encontrar la base de datos del sitio

En el VPS hay varias bases con una tabla `reservas` (de ParkingPlus, de otros
sitios…). `plesk db` se conecta por defecto a la base **interna de Plesk**, no a
la del sitio, así que siempre hay que escribir `nombre_base.tabla`.

```bash
ssh root@<IP_DEL_VPS> "plesk db -e \"SELECT table_schema AS base, table_rows AS filas FROM information_schema.tables WHERE table_name='reservas';\""
```

Te devuelve algo así:

| base | filas |
|---|---|
| `tn5qqzxx_aparca_plus` | 21763 |
| `aparcabarajas_vps` | 4952 |
| `parkingaeropuerto24h` | 98 |
| **`parkingaeromadrid_db`** | **482** ← esta es la del sitio |
| `parkingaeropuertomadrid24_db` | 18 |

**Cómo saber cuál es la tuya:** por el nombre del dominio (`parkingaeromadrid…`)
y porque contiene reservas con `medio_reserva = 3` (web). Otra opción es mirar
`DATABASE_URL` en el `.env` de la app, pero **no hace falta leer ese fichero** (y
mejor no tocar secretos): el nombre de la base basta.

> En un servidor puede aparecer también `SHOW DATABASES LIKE '%parking%';`
> para listar solo las bases cuyo nombre contiene "parking".

### 1.2 Qué significa cada columna importante de `reservas`

Sale de `prisma/schema.prisma` (modelo `reservas`):

| Columna | Significado |
|---|---|
| `created_at` | **Cuándo se creó la reserva** (la que usamos para "reservas por día") |
| `fecha_entrada` | Cuándo entra el coche (para medir antelación y estacionalidad) |
| `medio_reserva` | Canal: **1 = teléfono, 2 = agencia, 3 = web** |
| `monto_total` | Importe final en € |
| `estatus` | Estado de la reserva (activa/cancelada…) |
| `pago_confirmado` | Aquí siempre es 0: el cliente **paga al entregar**, no hay pago online |

### 1.3 Consulta 1 — reservas por semana y canal

```bash
ssh root@<IP_DEL_VPS> "plesk db -e \"SELECT MIN(DATE(created_at)) AS desde, medio_reserva AS medio, COUNT(*) AS n, ROUND(SUM(monto_total)) AS euros FROM parkingaeromadrid_db.reservas WHERE created_at >= '2026-06-01' GROUP BY YEARWEEK(created_at,3), medio_reserva ORDER BY desde, medio;\""
```

- `YEARWEEK(created_at,3)` agrupa por semana ISO (lunes a domingo).
- `MIN(DATE(created_at))` te enseña el primer día de cada semana.
- Si solo sale `medio = 3`, esa base solo tiene reservas web.

**Cómo leerlo:** busca el **escalón**. En el análisis real las semanas eran
~50–56 reservas y de golpe pasaron a 25, 24 y 12 (5 días). Eso fija el momento
de la caída: la semana del **14 de septiembre**.

### 1.4 Consulta 2 — reservas web por día

```bash
ssh root@<IP_DEL_VPS> "plesk db -e \"SELECT DATE(created_at) AS dia, COUNT(*) AS n FROM parkingaeromadrid_db.reservas WHERE medio_reserva=3 AND created_at >= '2026-08-10' GROUP BY dia ORDER BY dia;\""
```

Qué buscar:
- **Días con 0** (como el 16 de agosto): pueden indicar una caída del sitio.
- **Picos raros** (23 reservas el 17 de agosto, tras el hueco): suelen ser
  recuperación tras una incidencia.
- **El primer día "malo"** (el 15 de septiembre solo hubo 1).

### 1.5 Consulta 3 (extra) — antelación con la que se reserva

Sirve para saber si la caída es **estacional** (en temporada baja se reserva
más tarde):

```sql
SELECT MIN(DATE(created_at)) AS semana,
       ROUND(AVG(DATEDIFF(fecha_entrada, DATE(created_at))),1) AS antelacion_dias,
       ROUND(100*AVG(DATEDIFF(fecha_entrada, DATE(created_at)) < 7)) AS pct_menos_7_dias
FROM parkingaeromadrid_db.reservas
WHERE medio_reserva=3 AND created_at >= '2026-07-20'
GROUP BY YEARWEEK(created_at,3) ORDER BY semana;
```
Se ejecuta igual con `plesk db -e "…"`. La tabla semanal del panel `/admin →
Análisis de caída` ya muestra esto en vivo.

### 1.6 Cálculos que hacer con el resultado

| Cálculo | Fórmula |
|---|---|
| Reservas por día (periodo) | reservas del periodo ÷ días del periodo |
| Variación | (después − antes) ÷ antes × 100 |
| Ingresos por semana | ingresos del periodo ÷ días × 7 |
| Ticket medio | euros ÷ reservas (si no cambia, no es un tema de precios) |

> **Siempre normaliza por día.** Compararás periodos de duración distinta
> (46 días antes frente a 16 después) y los totales engañan.

### 1.7 Trampas de esta fase

- Olvidar el prefijo de la base (`parkingaeromadrid_db.reservas`) → te conecta a
  la base de Plesk y da "tabla no existe".
- Contar reservas canceladas como válidas: decide si cuentan y avisa de ello.
- El **último día está incompleto**: no lo metas en medias.
- Comillas dentro de comillas: en SSH usa `\"` para las comillas interiores.

---

## 2. Paso 2 — Google Analytics 4 (GA4)

### 2.1 Entrar en la propiedad correcta (¡no es obvio!)

- Una misma persona puede tener **varias cuentas de Analytics** y **varios
  perfiles de Chrome**. Al principio se abrió una cuenta ("Eduenvio") sin datos.
  La correcta era la de **parkingaeromadrid.es**, en **otro perfil de Chrome**.
- Si usas la extensión «Claude in Chrome»: se instala y se inicia sesión **en
  cada perfil**, con la misma cuenta de Claude. Entonces aparece como otro
  navegador conectado y se selecciona.
- Para confirmar que estás en la propiedad correcta: arriba a la izquierda debe
  verse el nombre del sitio y, en el Inicio, los usuarios de los últimos 7 días.

Las URL de GA4 tienen esta forma (los números los ves en tu navegador):

```
https://analytics.google.com/analytics/web/#/a<ID_CUENTA>p<ID_PROPIEDAD>/reports/…
```

### 2.2 Cómo fijar el rango de fechas

Se puede escribir directamente en la URL, añadiendo `params=` con las fechas:

```
…/reports/explorer?params=_u.date00%3D20260801%26_u.date01%3D20260915&r=<INFORME>
```
`date00` = inicio, `date01` = fin, formato `AAAAMMDD`. Cambia las dos y recarga.
Otra forma, a mano: selector de fechas arriba a la derecha → «Personalizado».

### 2.3 Informe A — Adquisición de tráfico (por canal)

- URL del informe: `r=lifecycle-traffic-acquisition-v2`.
- Menú: *Informes → Adquisición → Adquisición de tráfico*.
- Te da, por canal (Paid Search, Cross-network, Organic Search, Direct…):
  **sesiones, sesiones con interacción, eventos clave y tasa de evento clave**.
- Hazlo para periodos **antes** y **después** y compara **por día**.

En el análisis: sesiones de Paid Search 36,6/día → 32,2/día (−12 %), pero los
eventos clave de Paid Search 5,3/día → 3,1/día (−42 %). Conclusión: **el
tráfico casi no cayó; la conversión sí**.

### 2.4 Informe B — Rendimiento de los eventos clave (con datos de Ads)

- Menú: *Publicidad → Eventos clave → Rendimiento de los eventos clave*
  (URL `…/advertising/all-channels?params=…`).
- Añade **coste publicitario, clics, impresiones, CPC, coste por evento clave**
  (porque Analytics está vinculado a Google Ads).
- **Filtra los eventos de reserva:** arriba, en «N/4 eventos clave», desmarca
  `click_phone` y `click_whatsapp`; deja `purchase` y `reserva_confirmada`.
  Si no, mezclas llamadas y WhatsApp con reservas reales.
- Cuidado: **al cambiar de fechas por URL el filtro se reinicia** y vuelve a
  "4/4". Compruébalo cada vez (si pone «2/4», está aplicado).

### 2.5 Informe C — Detalles de la tecnología (por dispositivo)

- URL: `r=user-technology-detail` (menú: *Informes → Tecnología → Detalles de la
  tecnología*).
- Por defecto agrupa por **Navegador**. Para añadir el tipo de dispositivo,
  en la cabecera de la tabla pulsa el desplegable de la dimensión (icono junto
  a «Navegador») → busca **«Categoría de dispositivo»** como segunda dimensión.
  También se puede dejar en la URL:

```
&_r.explorerCard..seldim%3D%5B%22browser%22,%22deviceCategory%22%5D
```
- Mira **usuarios activos** y **eventos clave** por combinación
  (Chrome mobile, Safari mobile, Chrome desktop…).

Cómo se interpreta: calcula **eventos clave por usuario** en móvil y en
escritorio antes y después. Si cae solo en uno, el problema es de ese
dispositivo; si cae en **Android (Chrome) y iPhone (Safari)** por igual, un
problema que solo afecte a Android (como el de HTTP/3 y ECH de Cloudflare, ver
`docs/diagnostico-caidas-reportadas.md`) no basta como explicación completa,
aunque pueda explicar parte de la caída en Android.

### 2.6 Informe D — Páginas y pantallas (el embudo)

- URL: `r=all-pages-and-screens`.
- Añade **«Categoría de dispositivo»** como segunda dimensión con
  `&_r.explorerCard..seldim%3D%5B%22unifiedPagePathScreen%22,%22deviceCategory%22%5D`.
- Para el embudo móvil: sigue el recorrido de páginas **/ → /planes → /reservar**
  y compara **usuarios al día** de cada una, antes y después.
- Compara también las **landings por terminal** (T4, T1, T2): si se mantienen
  mientras la portada cae, el problema está en lo que llega a la portada
  (publicidad genérica), no en toda la web.

### 2.7 Limitaciones de Analytics que debes conocer

| Limitación | Qué hacer |
|---|---|
| **Cuenta ~70–75 % de las reservas reales** (en septiembre: 108 eventos frente a 148 reservas en la BD) | Úsalo para **tendencias**, nunca para valores absolutos |
| "Eventos clave" mezcla reservas, llamadas y WhatsApp | Filtra por evento (§2.4) |
| Los datos recientes pueden estar incompletos (el último día, retrasos) | Excluye el último día |
| Las tablas largas se "virtualizan": al copiar el texto de la página solo salen unas filas | Aumenta «Filas por página» y desplázate |
| Muestras pequeñas (1–3 eventos por fila) | Mira el **patrón conjunto**, no cada cifra |

---

## 3. Paso 3 — Google Ads

Las URL de Ads llevan un `ocid` (identificador de la cuenta):

```
https://ads.google.com/aw/campaigns?ocid=<TU_OCID>
https://ads.google.com/aw/changehistory?ocid=<TU_OCID>
https://ads.google.com/aw/keywords?ocid=<TU_OCID>
https://ads.google.com/aw/keywords/searchterms?ocid=<TU_OCID>
```
(Entra una vez a mano en la cuenta y copia el `ocid` de la barra de direcciones.)

### 3.1 Estado de las campañas

*Campañas → Campañas.* Mira por cada una: **estado** (Apto / En pausa),
presupuesto diario, tipo (Búsqueda, Máximo rendimiento) y las columnas de
**cuota de impresiones** (ver §3.4). En el caso real:

- «Parking Aeropuerto Edward A/INTENCION» (Búsqueda): **activa**, 42,50 €/día.
- «edward 1 agosto PMAX» (Máximo rendimiento): **en pausa**.
- «29 de septiembre intención alta» (Búsqueda): **en pausa**.

> **Cuidado con el rango de fechas:** la tabla puede estar en "Hoy" y mostrar
> ceros. Cambia el rango a algo útil antes de sacar conclusiones.

### 3.2 Historial de cambios (el paso que más descubrió)

*Herramientas → Historial de cambios* (o `…/changehistory`).

1. **Amplía el rango de fechas** (por ejemplo, últimos 30 días): por defecto
   puede mostrar solo "hoy".
2. Arriba hay chips por tipo de cambio: **Presupuesto, Puja, Audiencia,
   Estado, Otros…**. Pulsa **«Estado»** y dentro **«En pausa»** para ver solo
   las pausas.
3. Anota para cada cambio **fecha, hora, quién y desde dónde**
   («Cliente web (manual)» o «Aplicación móvil Google Ads»).

Qué se descubrió:

| Fecha | Cambio |
|---|---|
| 18 sept, 2:23–2:41 | ≈9 palabras clave pausadas en la campaña principal |
| 21 sept | otra palabra clave de frase pausada |
| **22 sept** | **Performance Max pausada** (desde la app móvil) |
| 29 sept | otra palabra clave exacta pausada |
| 1 oct | campaña «29 de septiembre intención alta» pausada |
| 1–2 oct | cambios de URL final, anuncios y palabras clave |

> Esto solo dice **quién tiene el login** que hizo el cambio, no qué persona.
> Pregunta siempre en el equipo antes de suponer.

### 3.3 Palabras clave: cuáles convierten y cuáles no

*Palabras clave → Palabras clave de búsqueda.* Ajusta:

- **Rango de fechas** (clic en la fecha → Personalizado → escribe `1/8/2026` y
  `17/9/2026` → Aplicar).
- **Filtro de estado**: «Habilitadas, pausadas» te deja ver las pausadas.
- Ordena por **Coste** para empezar por las que gastan más.
- Mira: **clics, CPC, coste, tasa de conversión, conversiones, coste por
  conversión** y la **cuota de impresiones**.

Conclusión de ese análisis: de las ~100 palabras clave con más gasto, **solo una
pausada** (`"parking t4 barajas"`, a 39 €/conversión). Las que concentran las
conversiones (`[parking aeropuerto madrid]`, `[parking larga estancia t4]`,
`[parking t4 barajas]`…) **siguen activas**. Es decir, **las pausas del 18 de
septiembre no explican la caída**.

### 3.4 Cuota de impresiones: ¿presupuesto o ranking?

Columnas clave:

| Columna | Qué te dice |
|---|---|
| Cuota de impr. de búsqueda | % de veces que se mostró tu anuncio sobre las posibles (en el caso real ~28 %) |
| Cuota impr. perdida (**ranking**) | Lo que pierdes por **pujas bajas / calidad del anuncio** (≈63 %) |
| Cuota impr. perdida (**presupuesto**) | Lo que pierdes por **poco presupuesto** (<10 %) |

Si la pérdida es sobre todo por **ranking**, subir presupuesto no ayuda: hay que
mejorar **pujas, calidad del anuncio o páginas de destino**.

### 3.5 Términos de búsqueda (qué escribe la gente)

*Estadísticas e informes → Términos de búsqueda* (`…/keywords/searchterms`).

1. Pon el rango **antes** (1 ago – 17 sep) y anota los totales: clics,
   impresiones, CTR, CPC, coste, conversiones, tasa de conversión, coste por
   conversión.
2. Cambia al rango **después** (18 sep – 2 oct) y repite.
3. **Divide por los días de cada periodo** (48 y 15 días) para compararlos.
4. Mira si aparecen términos **irrelevantes** (mala calidad de tráfico) o si
   son los mismos de siempre.

Resultado real: los términos eran los mismos, el CTR incluso subió (10 % → 14 %),
pero la conversión por clic bajó (7,0 % → 4,5 %) y el coste por conversión se
duplicó. Interpretación: **el tráfico no empeoró; lo que pasa después del clic
sí** (web, precio percibido o demanda).

### 3.6 Cómo comparar periodos de distinta duración (tabla modelo)

| Métrica por día | Antes (48 d) | Después (15 d) | Cambio |
|---|---|---|---|
| Impresiones | 482 | 230 | −52 % |
| Clics | 48,1 | 32,4 | −33 % |
| CPC | 0,88 € | 1,08 € | +23 % |
| Conversiones | 3,4 | 1,5 | −56 % |
| Conversión por clic | 7,0 % | 4,5 % | −35 % |
| Coste por conversión | 12,59 € | 23,80 € | ×1,9 |

---

## 4. Paso 4 — Historial de código (git): qué cambió en la web

Mira qué se publicó y cuándo, **alrededor de la fecha del escalón**:

```bash
# Commits desde una fecha, con fecha y asunto
git log --since=2026-08-25 --format='%h %ad %s' --date=short

# Historial de un archivo concreto
git log --format='%h %ad %s' --date=short -- components/Hero.tsx

# Qué archivos tocó un commit
git show --stat --format='%h %ad %s%n%b' 0a8befc

# Cómo era un archivo ANTES de un commit (^ = el commit anterior)
git show 0a8befc^:components/Hero.tsx
```

Hallazgos de este análisis:

- **14 sept** — rediseño del hero (`0a8befc`) y nuevo cálculo de precios
  (`ae5aae9`). Coincide con el escalón.
- **27 sept** — se quita la tarjeta «DESDE X €» y se mejora el rendimiento
  (`878540f`). Las reservas **no se recuperan**.
- No hubo cambios en `/planes` ni `/reservar` en septiembre.

> **Cuidado con la zona horaria de los commits:** `git` muestra la hora con su
> desfase (`-0400`). El 14 sept 09:16 (−0400) son las 15:16 hora de Madrid.
> Además, **commit no es despliegue**: la fecha real de publicación puede ser
> otra.

---

## 5. Paso 5 — ¿Cambió el cálculo de precios?

Por qué: si el total que ve el cliente subiera, bajarían las reservas sin que
se note en el tráfico.

1. **Lee el diff** del commit sospechoso:
   ```bash
   git show ae5aae9 -- lib/precio-db.ts
   ```
   Lo que cambió: antes el recargo de temporada se cobraba por **todos** los días
   si la entrada caía en temporada; ahora solo por los días que **se solapan**.
2. **Mira los datos reales** que alimentan ese cálculo (solo configuración):
   ```bash
   plesk db -e "SELECT COUNT(*) AS temporadas FROM parkingaeromadrid_db.precio_temporada;"
   plesk db -e "SELECT cantidad, costo FROM parkingaeromadrid_db.registro_precios WHERE cantidad IN (1,3,7,15,18,30) ORDER BY cantidad;"
   plesk db -e "SELECT id, nombre_servicio, costo FROM parkingaeromadrid_db.servicios WHERE id=4;"
   ```
3. **Conclusión:** la tabla `precio_temporada` estaba **vacía** → el recargo es
   0 € con el código viejo y con el nuevo → **el cambio de precios no afecta**.
   Además, el **ticket medio** (56–63 €) se mantuvo estable.

---

## 6. Paso 6 — Probar el formulario de reserva en móvil

La herramienta de Chrome no siempre puede emular un móvil real. Una técnica que
funciona (solo para **ver el diseño**; no se envía nada):

1. Abre `https://tu-dominio/reservar` en una pestaña.
2. En la consola de esa pestaña (o con una herramienta que ejecute JavaScript),
   sustituye la página por un **iframe de 390 px de ancho** del mismo sitio:
   ```js
   document.documentElement.innerHTML =
     '<body style="margin:0;background:#222;display:flex;justify-content:center">' +
     '<iframe id="m" src="/reservar" style="width:390px;height:600px;border:0"></iframe></body>';
   ```
   El iframe aplica las reglas de diseño **móvil** (las `@media`) aunque la
   ventana sea ancha. Es del mismo origen, así que no lo bloquea el navegador.
3. Revisa:
   - ¿Se ve todo el formulario y el botón «Confirmar reserva»?
   - ¿Qué campos son **obligatorios** (`required`)? Aquí: nombre, teléfono,
     correo y modelo; matrícula y código promocional, opcionales.
   - ¿Hay elementos **fijos** (botones flotantes, avisos) que tapen el botón?
     (Con JavaScript: lista los elementos con `position: fixed`.)
   - El **aviso de cookies** aparece como ventana modal con el fondo borroso:
     es un paso más en móvil, pero cumple su función.
4. **No envíes el formulario**: crearías una reserva real.

Limitaciones: es una simulación de ancho, no un iPhone ni un Android reales. Un
fallo específico de iOS/Android no se vería así.

---

## 7. Paso 7 — Cruzar todo y ordenar las hipótesis

### 7.1 Construye la línea de tiempo

Una sola línea con **todas las fechas relevantes**: caída de reservas (BD),
cambios en la web (git), cambios en Ads (historial), incidencias (caídas,
huecos de datos). Esto es lo que dibuja el gráfico del panel
`/admin → Análisis de caída`.

### 7.2 Haz una tabla de hipótesis

| Hipótesis | Evidencia a favor | Evidencia en contra | Certeza |
|---|---|---|---|
| Performance Max pausada (22 sept) | Era la mayor fuente de alcance en portada; cae el tráfico genérico | La caída empieza **antes** (14 sept) | Alta |
| Pocas impresiones en genéricas | Cuota ~28 %, pérdida por ranking ~63 % | — | Alta |
| Peor conversión en móvil | 0,18 → 0,10 eventos clave/usuario; escritorio estable | Muestras pequeñas | Media |
| Rediseño del hero (14 sept) | Coincide en fechas | Mismo camino de reserva; más gente pasa a `/planes`; quitar la tarjeta no recuperó nada | Baja |
| Estacionalidad | Septiembre/octubre más flojos tras el pico de agosto | Sin datos del año anterior | Por medir |
| Fallo de acceso en Android: HTTP/3 (14–15 sept) y ECH (16 sept), ver `docs/diagnostico-caidas-reportadas.md` | Coincide con el inicio de la caída; Chrome móvil pierde más usuarios que Safari móvil (−27 % frente a −18 %) | Se corrigió el 15–16 y las reservas siguieron bajas; en iPhone, donde el sitio cargaba bien, la conversión bajó igual | Contribuyó al inicio; no explica lo persistente |
| Pausas de palabras clave (18 sept) | Coincide en fechas | Tenían muy poco gasto | Descartado |
| Cambio de precios (14 sept) | Mismo día | Sin temporadas → recargo 0; ticket estable | Descartado |

### 7.3 Pregúntate siempre

1. ¿La caída empieza **antes o después** de ese cambio? (Si empieza antes, ese
   cambio no la inició.)
2. ¿Afecta a **todos** los dispositivos/canales o solo a algunos?
3. ¿Cambió el **tráfico** (visitas) o la **conversión** (reservas por visita)?
4. ¿Se **recuperó** cuando se revirtió el cambio? (Si no, es una pista débil.)
5. ¿Es **estacional**? (Compara con el año anterior si hay datos.)

---

## 8. Paso 8 — Dejar el informe en el panel `/admin`

El proyecto incluye la sección **«Análisis de caída»** (menú lateral → Gestión):

- **En vivo:** el gráfico, las tarjetas y la tabla semanal salen de las reservas
  de la base de datos y se actualizan solos.
- **Foto (editable):** las cifras de Analytics/Ads y la lista de eventos están en
  `lib/analisis-caida.ts`. Para actualizarlo en otra ocasión:
  1. Repite los pasos 2 y 3 de este manual con los nuevos rangos.
  2. Edita las constantes `EVENTOS` y `PASOS`, y las fechas `FECHA_CORTE` y
     `PIVOTE` de ese archivo.
  3. `npx tsc --noEmit` para comprobar que compila.

---

## 9. Errores y trampas más comunes

| Trampa | Cómo evitarla |
|---|---|
| Comparar periodos de distinta duración con totales | Normaliza **por día** |
| Fiarse de un solo día | Usa media de 7 días y excluye el día en curso |
| Confundir "eventos clave" con reservas | Filtra `purchase` y `reserva_confirmada` |
| Suponer que Analytics cuenta todas las reservas | Valida contra la BD (cuenta ~70–75 %) |
| Rango de fechas olvidado en Ads/Analytics | Mira siempre el rango activo arriba |
| El filtro de eventos se reinicia al cambiar fechas por URL | Vuelve a aplicarlo y compruébalo |
| Tablas virtualizadas que solo copian unas filas | Sube «Filas por página» y ordena |
| Atribuir causa por coincidencia de fechas | Mira si empezó **antes**, y si se recupera al revertir |
| Culpar a la persona por un cambio de Ads | El historial solo dice qué **login** lo hizo |
| Muestras pequeñas (1–3 conversiones) | Valora el **patrón conjunto** |
| `plesk db` sin prefijo de base | Escribe `base.tabla` siempre |
| Comandos de escritura en producción | Usa solo `SELECT` y evita leer ficheros con secretos |

---

## 10. Checklist rápido para la próxima vez

1. [ ] BD: encontrar la base y sacar reservas **por semana y por día** (§1).
2. [ ] Identificar el **día del escalón** y el último día "normal".
3. [ ] Analytics: canales **antes/después** por día (§2.3).
4. [ ] Analytics: eventos de **reserva** + coste por reserva por mes (§2.4).
5. [ ] Analytics: **dispositivo** (móvil vs escritorio) (§2.5).
6. [ ] Analytics: **embudo de páginas** en móvil (§2.6).
7. [ ] Ads: **estado de campañas** y **historial de cambios** (§3.1–3.2).
8. [ ] Ads: **palabras clave**, **cuota de impresiones** y **términos de búsqueda** (§3.3–3.5).
9. [ ] Git: cambios en la web **cerca de la fecha** (§4); precios (§5).
10. [ ] Probar el **formulario en móvil** (§6).
11. [ ] Cruzar todo en una **línea de tiempo** y una **tabla de hipótesis** (§7).
12. [ ] Anotar **qué se ha descartado** y **qué falta por medir**.
13. [ ] Decidir acciones **de menor a mayor riesgo** (revertir lo reciente primero).

---

## 11. Glosario

| Término | Significado |
|---|---|
| **Escalón** | Bajada brusca y sostenida (no un día malo) |
| **Conversión** | Una visita/clic que acaba en reserva |
| **Evento clave** | Acción importante registrada en Analytics (reserva, llamada, WhatsApp) |
| **CTR** | Porcentaje de impresiones que acaban en clic |
| **CPC** | Coste por clic |
| **Coste por conversión** | Gasto ÷ conversiones |
| **Cuota de impresiones** | % de las posibles veces en que se mostró tu anuncio |
| **Ranking del anuncio** | Posición según puja + calidad; si es bajo, pierdes impresiones |
| **PMax / Máximo rendimiento / Cross-network** | Campaña automática de Google (en Analytics aparece como Cross-network) |
| **Concordancia exacta / de frase / amplia** | Cuán estrictamente debe coincidir la búsqueda con la palabra clave |
| **Embudo** | Recorrido por pasos (portada → planes → reservar → confirmar) |
| **Muestra pequeña** | Pocos datos, por lo que la cifra es poco fiable |

---

## 12. Resumen de lo que se encontró (foto del 2 oct 2026)

- Reservas web: **~7/día** (3 ago–13 sep) → **~3,5/día** (desde el 14 sept) →
  **~2,4/día** la última semana. Ingresos semanales −57 %.
- El **tráfico de pago bajó poco** (−12 %); lo que cayó fue la **conversión**
  (~13 % → ~7 %).
- La caída está en **móvil** (Android e iPhone); escritorio estable.
- Google Ads: **Performance Max pausada** (22 sept), **cuota de impresiones
  baja** por ranking, **CPC +23 %**, coste por conversión ×1,9.
- Fallo de acceso en Android (HTTP/3 el 14–15 sept y ECH el 16): coincide con
  el inicio de la caída y pudo restar reservas esos días, pero se corrigió y las
  reservas siguieron bajas; en iPhone, donde el sitio cargaba bien, la conversión
  bajó igual. Contribuyó al inicio, no explica lo persistente. Pendiente
  confirmar que el admin entra ya con datos móviles.
- Descartado: pausas de palabras clave de poco gasto, cambio de precios
  (sin temporadas), y fallos del formulario `/reservar` en móvil.
- Pendiente: medir la **estacionalidad** (con datos del año anterior) y
  decidir acciones (reactivar PMax, mejorar pujas/anuncios, revisar el hero).

> Es una foto en el tiempo: las coincidencias de fechas **no prueban** la causa.
