# Caídas en días de partido: bloqueos de IP de Cloudflare por operadoras (LaLiga)

**Fecha:** 10-nov-2026 · **Estado:** mitigación aplicada (Cloudflare en «DNS only»),
pendiente de confirmar en el próximo partido.

Documento que recoge el diagnóstico, las pruebas, el cambio realizado en
producción y cómo revertirlo. Complementa a
[`diagnostico-caidas-reportadas.md`](diagnostico-caidas-reportadas.md) y a
[`estado-analisis-caida-reservas.md`](estado-analisis-caida-reservas.md).

---

## 1. Resumen

- La web dejaba de cargar en **datos móviles** durante partidos de fútbol
  (caídas vistas el **miércoles 4-nov** y el **domingo 8-nov** de 2026; antes,
  el fallo «Android» del 14–16-sep).
- Causa más probable: durante los partidos, las operadoras españolas (Movistar,
  Vodafone, Orange, Digi, MásMóvil) **bloquean por IP rangos enteros de
  Cloudflare** por orden de LaLiga contra la piratería. Las IP de Cloudflare son
  compartidas, así que caen también webs legales como esta.
- Con la web detrás de Cloudflare, el visitante se conecta a una IP de
  Cloudflare (`104.21.69.200`, `172.67.212.207`), no al VPS. Si esa IP está
  bloqueada → `ERR_CONNECTION_REFUSED`, «la conexión no es segura», etc.
- **Acción tomada el 10-nov-2026:** los registros DNS de la web pasaron a
  **«DNS only»** (nube gris) para que el tráfico vaya directo al VPS
  (`91.213.46.180`), que no está bloqueado.
- **Lo demostrado y lo no demostrado:** el domingo 8-nov está respaldado por
  datos. El miércoles 4-nov **no** (ver §4).

> El hecho de que el servidor esté en España **no es la causa**. Lo que se
> bloquea son las IP de Cloudflare que están delante.

## 2. Cómo se llegó aquí

1. El usuario observó que las caídas coincidían con partidos y trajo una
   hipótesis (sugerida por GPT): bloqueos de LaLiga contra Cloudflare.
2. Se revisó la memoria del proyecto: el análisis de caída de reservas del
   2-oct-2026 no encontraba un culpable único; el fallo de Android del
   14–16-sep se había atribuido a HTTP/3 (QUIC) y a ECH, ambos desactivados en
   Cloudflare sin que el problema desapareciera.
3. El usuario confirmó que la web se cayó el miércoles 4 y el domingo 8 de
   noviembre, ambos días de partido.
4. Se hicieron tres comprobaciones previas antes de tocar nada (§3).
5. Se analizó el histórico público de bloqueos (§4).
6. Con autorización explícita del usuario se cambió el DNS (§5) y se verificó (§6).

## 3. Comprobaciones previas al cambio

| # | Qué se comprobó | Resultado |
|---|---|---|
| 1 | Certificado SSL **del origen** | Let's Encrypt, cubre `parkingaeromadrid.es` y `www`, válido hasta **28-ene-2027**, lo renueva Plesk |
| 2 | Respuesta **directa** del VPS (sin Cloudflare) | Dominio 200 · `www` → 301 al dominio principal · `http` → 301 a https · `/admin` 307. Servidor nginx + Passenger |
| 3 | ¿Está bloqueada la IP del VPS? | No. `91.213.46.180` y el rango `91.213.46.x` no aparecen en las listas de hayahora.futbol |

**Trampa en la comprobación 1:** al leer el certificado con `openssl` desde el
PC del usuario salió emitido por *«Avast Web/Mail Shield Root»*. Es el
antivirus del PC interceptando el TLS, **no** el certificado real. El
certificado verdadero se lee desde el propio VPS por SSH:

```bash
ssh root@91.213.46.180 'echo | openssl s_client -connect 91.213.46.180:443 -servername parkingaeromadrid.es 2>/dev/null | openssl x509 -noout -subject -issuer -dates -ext subjectAltName'
```

(Conectar a `127.0.0.1:443` no sirve: nginx no escucha ahí.)

## 4. Evidencia: histórico de bloqueos (hayahora.futbol)

Fuente: `https://hayahora.futbol/estado/data.json` (histórico, ~5 MB) y
`https://hayahora.futbol/estado/blocked-any.txt` (lista actual). Actualización
consultada: 2026-11-10 03:15 UTC. El sitio rastrea una **muestra** de ~18.800 IP
(casi todas de Cloudflare) por operadora.

**Número de IP de Cloudflare bloqueadas a la vez** (todas las operadoras;
horas en UTC, España = UTC+1 en noviembre):

| Día | 18h | 19h | 20h | 21h | 22h | 23h |
|---|---|---|---|---|---|---|
| Mar 3-nov | 0 | 0 | 0 | 0 | 0 | 0 |
| **Mié 4-nov** | **0** | **0** | **0** | **0** | **0** | **0** |
| Jue 5-nov | 0 | 0 | 0 | 0 | 0 | 0 |
| Vie 6-nov | 0 | 0 | 0 | 0 | 0 | 0 |
| Sáb 7-nov | 679 | 1.199 | 1.346 | 1.524 | 1.103 | 0 |
| **Dom 8-nov** | 1.380 | 1.582 | 1.742 | **2.055** | 1.403 | 0 |
| Lun 9-nov | 0 | 0 | 0 | 0 | 0 | 0 |

**Días con bloqueos a Cloudflare desde septiembre** (IP distintas):
12–13-sep (sáb/dom), **14–17-sep (lun–jue)**, 19–20-sep, 5-oct (lun, 233),
10–11-oct, 17–18-oct, 24–25-oct, 31-oct–1-nov, 7–8-nov. Casi siempre fines de
semana; la excepción son los días 14–17 de septiembre.

**Lectura:**

- **Domingo 8-nov: respaldado.** Bloqueo masivo de 16:00 a 00:00 (hora de
  España) en las cinco operadoras, en el rango `104.21.*`/`172.67.*` que usa
  este dominio. Encaja con las caídas de las 21:45 y 23:04.
- **Septiembre 14–17: encaja.** Los bloqueos aparecen justo en la semana en que
  empezó la caída de reservas (14-sep) y fallaba el acceso desde Android
  (14–16-sep). Lo más probable es que los «incidentes de Android» fueran este
  mismo problema y no HTTP/3 ni ECH.
- **Miércoles 4-nov: NO explicado.** No hay ningún bloqueo registrado ese día
  (la Champions no es competición de LaLiga). Falta saber hora, error y
  dispositivo para buscar otra causa.
- **Límites:** las dos IP exactas de Cloudflare del dominio no están en la
  muestra (rotan y solo se vigila una parte); el histórico del rastreador
  parece empezar ~11-sep, así que no dice nada de antes.

## 5. Cambio realizado (producción)

**Dónde:** panel de Cloudflare → cuenta `Apps@parkingplus.es` → zona
`parkingaeromadrid.es` → **DNS → Records**.

**Qué:** proxy de naranja (*Proxied*) a gris (*DNS only*) en:

| Registro | Tipo | Contenido |
|---|---|---|
| `parkingaeromadrid.es` | A | 91.213.46.180 |
| `www.parkingaeromadrid.es` | CNAME | `parkingaeromadrid.es` |

**No se tocó:** `ipv4`, `mail`, `webmail` (A, ya en gris), MX, SPF, DKIM,
DMARC, TXT de verificación de Google, `_acme-challenge` y `_domainconnect`
(CNAME de GoDaddy, sigue proxied; no afecta a la web). **No existe ningún
registro AAAA**, por lo que solo se sirve IPv4.

**Correo:** no se ve afectado. Todos sus registros ya estaban en «DNS only» y
nunca pasaron por Cloudflare. *No se probó el envío/recepción directamente*;
conviene mandar un correo de prueba de ida y vuelta.

## 6. Verificación posterior (10-nov-2026, ~04:30)

- `1.1.1.1`, `8.8.8.8` y `9.9.9.9` resuelven `parkingaeromadrid.es` y `www` a
  **91.213.46.180** (ya no 104.21.x / 172.67.x).
- `https://parkingaeromadrid.es/` → 200 (≈1,2 s). `https://www…`, `http://…`
  → redirigen al dominio principal y cargan. `/admin` → `/admin/login` 200.
  `/planes` → 200. La respuesta ya no lleva cabeceras de Cloudflare
  (`Server: nginx`).

## 7. Qué se pierde al quitar Cloudflare del medio

Caché de borde, WAF / protección DDoS y cualquier regla propia de Cloudflare.
Las redirecciones (`www`, `http`) las hace la propia app y siguen funcionando.
Cloudflare ya avisaba de que la IP de origen estaba **parcialmente expuesta**
(`mail`, `ipv4`, `webmail` y el SPF la publican), así que la «protección por
ocultar la IP» ya no existía en la práctica.

Vigilar: carga del VPS (es compartido con `aparcabarajas.es`, `parkingplus.es`,
etc.), picos de tráfico anómalo y tiempos de respuesta.

## 8. Cómo revertir

Mismo panel: pulsar de nuevo la nube gris de los dos registros para volver a
*Proxied*. Se aplica en pocos minutos. Si se revierte, el problema de los
partidos volverá.

## 9. Pendientes

1. **Confirmar en un partido real** (sábado/domingo de Liga o jornada de
   Champions): alguien con Movistar, Vodafone u Orange y datos móviles, sin VPN,
   abre la web. Si carga, resuelto.
2. **Caída del miércoles 4-nov:** recopilar hora, error y dispositivo.
3. **Borrar `ipv4.parkingaeromadrid.es`** (registro de prueba creado en el
   incidente de Android; ya no hace falta). Nota: el certificado no incluye
   ese nombre.
4. **Correo de prueba** de ida y vuelta.
5. **Reinterpretar el análisis de caída de reservas** ([estado](estado-analisis-caida-reservas.md)):
   la caída desde el 14-sep puede deberse en buena parte a estos bloqueos.
   Cuantificarlo cruzando reservas y sesiones **por hora** con el calendario de
   partidos y los intervalos de bloqueo (BD por SSH + GA4).
6. Revisar **Google Ads**: clics y conversiones en franjas de partido (si hay
   muchos clics y pocas reservas, ahí está la fuga). Valorar pausar anuncios en
   partidos si hubiera que volver a poner Cloudflare.
7. Tras unos días, valorar endurecer el VPS (límites de peticiones en nginx,
   fail2ban) ahora que no hay WAF delante.

## 10. Cómo reproducir el análisis de bloqueos

No hay Python en el PC del usuario; se usa Node. Descargar los datos y ejecutar:

```bash
mkdir -p "$TEMP/hayahora" && cd "$TEMP/hayahora"
curl -sS -o data.json https://hayahora.futbol/estado/data.json
curl -sS -o blocked-any.txt https://hayahora.futbol/estado/blocked-any.txt
node analiza.js data.json
```

`analiza.js` (resumen del método): recorrer `data[]` (cada elemento:
`ip`, `isp`, `description`, `stateChanges[{timestamp,state}]`), construir los
intervalos `state:true → state:false` por IP y operadora, filtrar las de
Cloudflare (`104.16–22.*`, `172.67.*`, `188.114.*` o `description`
«Cloudflare») y contar cuántas están bloqueadas a cada hora de los días de
interés; comprobar además si aparecen `91.213.46.180`, `104.21.69.200` o
`172.67.212.207`.

## 11. Lecciones

- Un error `ERR_CONNECTION_REFUSED` / `ERR_ECH_FALLBACK_CERTIFICATE_INVALID` en
  móvil con WiFi correcto **no** implica un fallo de la app ni del servidor:
  puede ser bloqueo de red de la operadora.
- Antes de culpar a un ajuste de Cloudflare (HTTP/3, ECH), cruzar el momento del
  fallo con el calendario de partidos y con hayahora.futbol.
- Al inspeccionar certificados desde un PC con antivirus que inspecciona HTTPS
  (Avast), leerlos desde el servidor.
