# Diagnóstico de "la página se cayó" (VPS + Cloudflare)

Guía para investigar reportes de caída del sitio (ej. `ERR_CONNECTION_ABORTED`,
"no carga", "se cae el panel") cuando el sitio corre en el VPS Plesk
(`root@91.213.46.180`) detrás de Cloudflare.

## Arquitectura relevante

- El sitio **no está en Vercel**. Corre en un VPS Plesk (`server.js` levanta
  Next.js en modo producción vía Passenger/Node App de Plesk).
- El VPS aloja **varios sitios** además de este: `aparcabarajas.es`,
  `admin.aparcabarajas.es`, `parkingplus.es`, `parkingaeropuerto24h.es`,
  `parkingaeropuertomadrid24.es`. Un problema de recursos en otro sitio
  podría afectar a este (recursos compartidos), aunque no fue el caso el
  22-ago-2026 (RAM/disco en rangos normales).
- Delante del VPS está **Cloudflare** (proxy naranja) — las IPs que ves en
  los logs de Apache (`172.68.x`, `104.23.x`, `162.158.x`, `172.71.x`, etc.)
  son de los edges de Cloudflare, no las IPs reales de los visitantes.
- Dashboard de Cloudflare de esta cuenta:
  `https://dash.cloudflare.com/91066dd3aafd8b35f9a1d815b9a22d8a/home`
  (cuenta `Apps@parkingplus.es`).

## Dónde mirar, en orden

### 1. ¿El proceso Node se reinició o crasheó?

```bash
ssh root@91.213.46.180 "ps -eo pid,lstart,etime,cmd | grep -i 'node\|passenger' | grep -v grep"
```

Busca la línea `Passenger NodeApp: /var/www/vhosts/parkingaeromadrid.es/httpdocs`.
Si el `etime` (tiempo corriendo) es menor a lo esperado para la hora del
reporte, el proceso se reinició (crash) cerca de ese momento — ahí sí hay un
problema de la app. Si lleva corriendo desde antes del incidente sin cortes,
la app **no cayó** a nivel de servidor.

### 2. Logs de Apache/proxy del dominio

Ruta: `/var/www/vhosts/parkingaeromadrid.es/logs/`

```bash
# Estado HTTP de las peticiones de hoy (access_ssl_log = log en vivo, sin rotar)
tail -n 200 /var/www/vhosts/parkingaeromadrid.es/logs/access_ssl_log

# Buscar la sesión concreta del usuario (por ruta)
grep '/admin' /var/www/vhosts/parkingaeromadrid.es/logs/access_ssl_log

# Errores de Apache (ojo: mucho ruido de bots, ver más abajo)
tail -n 150 /var/www/vhosts/parkingaeromadrid.es/logs/error_log
```

**Importante:** `access_ssl_log.processed` es el log ya rotado (normalmente
del día anterior, se procesa ~06:40). El log del día en curso es
`access_ssl_log` (sin `.processed`).

**Ruido esperado en `error_log`** (ignorar, es tráfico de bots/escáneres
constante en todos los sitios): `AH01071: Got error 'Primary script unknown'`,
intentos de acceso a `phpinfo.php.save`, `wp-login.php`, `.env`, etc. Estos NO
indican que el sitio esté caído.

### 3. Cloudflare — Security → Analytics → Events

En el dashboard del dominio: `Security > Analytics > pestaña Events`,
filtrar "Last 24 hours". Revisa si hay bloqueos (`Block`) que coincidan con
la IP/hora del reporte. Si el bloqueo es de un `user agent` tipo bot
(`wp2shell`, escáneres CVE de WordPress, etc.) es ruido de fondo — este sitio
no corre WordPress, así que esos bloqueos nunca son el usuario real.

También revisa la pestaña **Traffic** (gráfico de peticiones) para ver si
hay un hueco/caída total de tráfico o un pico de "Mitigated by Cloudflare"
justo en la hora del incidente.

### 4. Cruce de horarios

El VPS está en **Europe/Madrid (CEST, UTC+2)**. Si el usuario reporta la hora
en otro huso (ej. Venezuela, UTC-4), la diferencia es de **6 horas** en
verano (CEST). Ejemplo: 12:49 hora Venezuela = 18:49 hora del VPS/Apache.

## Caso resuelto — 22 ago 2026

**Reporte:** captura de pantalla de Android con `ERR_CONNECTION_ABORTED` al
entrar a `/admin`, "se cayó varias veces hoy desde las 12:49 hora Venezuela".

**Lo revisado:**

1. El proceso Passenger de `parkingaeromadrid.es` llevaba corriendo desde
   las 00:00:11 de ese día sin ningún reinicio (21h+ de uptime) → la app
   nunca crasheó.
2. `access_ssl_log` mostró la sesión real del usuario a las 18:49:37 y
   18:52:51 CEST (= 12:49 y 12:52 Venezuela, coincide exacto): `GET /admin`
   → redirect a login → varios `POST /api/admin/login` con `401` (contraseña
   mal tecleada) → login exitoso `200` → dashboard y `/api/admin/reservas`
   cargando el JSON completo (~126 KB). **Cero 5xx, cero timeouts.**
3. Cloudflare (Security → Events, últimas 24h): solo 4 bloqueos, todos de
   un bot (`user agent: wp2shell`) escaneando `CVE:CVE-2026-63030` de
   WordPress desde una IP de Serbia — sin relación con el usuario ni con
   `/admin`.
4. Gráfico de tráfico de Cloudflare sin caídas ni picos de mitigación a esa
   hora.
5. No hay ninguna commit/deploy de código el día del incidente (el último
   commit era del 13-ago) — se descartó que fuera un cambio reciente.

**Conclusión:** ni el servidor ni Cloudflare registraron ningún fallo. El
`ERR_CONNECTION_ABORTED` no llegó a tocar el origen — es consistente con un
corte de red del lado del cliente (móvil, cambio 4G/WiFi, señal débil), no
con una caída real del sitio.

## Caso resuelto — 15 sep 2026 (falla solo en Android, funciona en iPhone)

**Reporte:** "no se puede acceder a este sitio web" en varios dispositivos
Android entre el 14 y 15-sep. Pruebas en ~5 iPhones dieron OK siempre.
Capturas de los Android mostraron tres códigos de error distintos según el
dispositivo: `ERR_CONNECTION_REFUSED`, `ERR_CONNECTION_ABORTED`,
`ERR_QUIC_PROTOCOL_ERROR`. Ocurrió con **operadoras de telefonía distintas**
(no es un problema de un solo operador).

**Lo descartado (en este orden):**

1. Proceso Passenger de `parkingaeromadrid.es`: se reinició ~06:35 del 15-sep
   junto con TODOS los demás sitios del VPS — es el mantenimiento nocturno
   rutinario de Plesk (`Daily Maintenance: InstallSystemPackageUpdates`,
   reinicia Apache/Nginx/PHP-FPM/Passenger cada madrugada ~06:25-06:36 CEST).
   No es un crash de esta app.
2. TLS: negociación 1.2 y 1.3 contra el dominio responde 200 OK normal.
3. Cloudflare Security → Analytics → Events, filtrado por `Country = Spain`,
   últimas 24h: **cero eventos** (ni Block ni Challenge). Se descarta
   WAF/Managed Rules bloqueando tráfico español.
4. Bot Fight Mode: estaba **desactivado** (toggle gris). Se descarta.
5. DNS: `A`/`AAAA` de apex y `www` resuelven correctamente a las IPs anycast
   de Cloudflare, sin nada raro.
6. `access_ssl_log` del día: decenas de peticiones reales de Android (Chrome
   152/153, campañas de Google Ads) llegando al origen y respondiendo `200`
   sin problema — descarta bloqueo general contra Android.

**Causa encontrada:** el sitio tenía **HTTP/3 (with QUIC)** activado en
Cloudflare (`Speed → Settings → Protocol Optimization`), visible como header
`alt-svc: h3=":443"` en las respuestas. Chrome en Android intenta QUIC
(HTTP/3 sobre UDP) de forma más agresiva que Safari/iOS. Muchas redes
móviles (de varias operadoras) tienen firewalls/DPI que bloquean o corrompen
tráfico UDP/443, y el fallback automático de Chrome a HTTP/2-TCP no siempre
ocurre limpio en Android, produciendo justo esos tres errores
(`ERR_QUIC_PROTOCOL_ERROR` = handshake QUIC corrompido por el DPI de la
operadora, `ERR_CONNECTION_REFUSED` = UDP 443 bloqueado,
`ERR_CONNECTION_ABORTED` = conexión cortada a medias). Explica por qué
afecta a Android y no a iPhone, y por qué pasa con operadoras distintas (no
es específico de una red, es que QUIC en general es frágil en redes
móviles).

**Solución:** desactivar `HTTP/3 (with QUIC)` en
`Speed → Settings → Protocol Optimization`. Verificado que tras
desactivarlo el header `alt-svc` ya no aparece en las respuestas, y
**confirmado por el usuario que los dispositivos Android que fallaban ya
cargan la web correctamente** tras el cambio.

**Si vuelve a pasar "falla en Android, funciona en iPhone, varias
operadoras":** pedir el código de error exacto en gris bajo el mensaje de
Chrome. Si es `ERR_QUIC_PROTOCOL_ERROR`/`ERR_CONNECTION_REFUSED`/
`ERR_CONNECTION_ABORTED`, sospechar QUIC/HTTP3 primero y revisar si se
reactivó el toggle.

## Caso EN CURSO — 16 sep 2026 (falla solo en Android, ni operadora ni VPN lo arreglan)

**Reporte:** el admin no podía entrar a `/admin` desde su Android. Dos
capturas ese día: `ERR_CONNECTION_REFUSED` (19:39 CEST, 4G+) y
`ERR_CONNECTION_ABORTED` (21:24 CEST, 4G+) — mismos códigos que el caso del
15-sep. Los nombres de archivo de las capturas (WhatsApp, 15:20 y 15:24)
sugieren que el admin reporta desde un huso horario distinto a España
(probablemente Venezuela, como en el caso del 22-ago), accediendo a un sitio
hosteado en España vía datos móviles.

**Lo revisado y descartado:**

1. VPS: uptime 70 días, sin reinicio del sistema. Proceso de
   `parkingaeromadrid.es` corriendo sin cortes desde las 01:12 de ese día.
2. `access_ssl_log`: **cero 5xx**, y **ningún rastro** de las peticiones de
   las 19:39 ni 21:24 — ni siquiera un intento fallido. La petición nunca
   llegó al origen.
3. Cloudflare: HTTP/3 confirmado apagado (sin header `alt-svc` en la
   respuesta, verificado con `curl -I` en el momento), Security Events en
   0 actividad sospechosa, tráfico continuo sin cortes.
4. **Operadora de datos**: el admin probó con varias operadoras distintas
   → mismo error. Se descarta que sea una operadora específica.
5. **VPN**: el admin probó con VPN activa (cambia la ruta de red por
   completo) → mismo error. Esto descarta que sea un problema de ruta de
   red/operadora en general, porque un VPN encapsula y cambia el
   recorrido por completo y el fallo persiste igual.

**Conclusión parcial:** con red y VPN descartados, el denominador común ya
no es "la red", es **el dispositivo Android en sí** (algo a nivel de Chrome
o del sistema operativo del teléfono), ya que ni cambiar de operadora ni de
ruta de red (VPN) cambia el resultado.

**Próximos pasos pendientes (para aislar Chrome vs. sistema):**

1. Probar con **otro navegador** en el mismo celular (Firefox, Samsung
   Internet, Edge) en el momento del fallo — si funciona ahí, es cosa de
   Chrome; si falla en todos, es del sistema Android.
2. Revisar **DNS privado del sistema** (Ajustes → Red e Internet → DNS
   privado): si tiene un proveedor puesto a mano, probar "Automático".
3. Revisar **DNS seguro de Chrome** (Ajustes → Privacidad y seguridad →
   Usar DNS seguro): ¿Automático o proveedor específico?
4. Revisar si hay instalada alguna app de **antivirus / bloqueador de
   anuncios / ahorro de datos** (AdGuard, NextDNS, Blokada, Samsung Max,
   etc.) que intercepte tráfico HTTPS a nivel de sistema — estas apps
   siguen activas incluso con un VPN encima y pueden bloquear un dominio
   puntual por error.

**Nota:** la teoría de "operadora/red móvil frágil con QUIC" del caso
15-sep queda descartada como explicación completa para este caso — aquí
persiste incluso con red completamente distinta (VPN), así que aunque los
códigos de error son los mismos, la causa raíz de fondo puede ser distinta
(algo local al dispositivo, no de la ruta de red).

**Dato adicional (probado antes de las modificaciones de ECH/HTTP3 de más
abajo):** el admin ya había probado con **varios navegadores** en el mismo
Android (no solo Chrome) y el error se mantenía igual en todos. Esto
descarta que sea un bug puntual de Chrome — apunta a algo a nivel de
red/sistema que afecta a cualquier navegador en esa conexión, consistente
con la teoría de un middlebox de operadora interfiriendo con el handshake
TLS (afecta a cualquier navegador que pase por esa misma red, sea cual sea
su motor). Esto responde/cierra el punto 1 de "Próximos pasos pendientes"
de la sección anterior.

### Actualización 16-sep (tarde/noche) — nueva evidencia apunta de vuelta a la red

Después de escribir la "conclusión parcial" de arriba llegaron tres datos
nuevos que la contradicen:

1. El mismo admin, **conectado a WiFi, sí pudo cargar la página**. Con
   **datos móviles falla**, en el mismo teléfono. Esto es justo la señal
   que faltaba: correlaciona con el tipo de red, no con el dispositivo.
2. Un **teléfono distinto** reportó un error nuevo:
   `ERR_ECH_FALLBACK_CERTIFICATE_INVALID`.
3. **Otros teléfonos** siguen dando los mismos errores del caso 15-sep
   (`ERR_CONNECTION_REFUSED` / `ERR_CONNECTION_ABORTED` / `ERR_QUIC_PROTOCOL_ERROR`).

`ERR_ECH_FALLBACK_CERTIFICATE_INVALID` es un error muy específico de Chrome:
ocurre cuando el cliente intenta **ECH (Encrypted Client Hello)** —la
extensión de TLS que cifra el SNI—, algo en la red intercepta o corrompe ese
intento, Chrome hace *fallback* a una conexión sin ECH, y el certificado que
recibe en ese fallback no coincide con el dominio esperado. Es la firma
típica de un **middlebox de la operadora móvil** (proxy/DPI que inspecciona
o reescribe el SNI, común en LatAm para filtrado de contenido o "internet
gratis"/zero-rating) que no sabe manejar ECH.

Se verificó que el dominio **sí tiene ECH activado en Cloudflare**: el
registro DNS `HTTPS` de `parkingaeromadrid.es` incluye un parámetro `ech=`
(consultado vía DoH: `https://cloudflare-dns.com/dns-query?name=parkingaeromadrid.es&type=HTTPS`).
Esto es un toggle en `SSL/TLS → Edge Certificates → Encrypted ClientHello (ECH)`
en el dashboard de Cloudflare, separado del toggle de HTTP/3 que ya se
desactivó el 15-sep.

**Teoría unificada (reemplaza la "conclusión parcial" de más arriba):** el
patrón de fondo es el mismo del caso 15-sep — Cloudflare tiene activas
funciones de cifrado a nivel de handshake TLS (antes HTTP/3/QUIC, ahora
también ECH) que operadoras móviles con middleboxes de inspección de SNI no
soportan bien. El WiFi normalmente no tiene ese tipo de proxy transparente,
por eso funciona ahí y falla en datos móviles, en varios teléfonos y
operadoras. El VPN "no arregló nada" en el intento anterior probablemente
no cambió el comportamiento porque el problema no es la ruta de red en sí,
sino algo que ocurre en el intento de handshake ECH antes de que el VPN
termine de establecerse, o la VPN probada no forzaba salida por un exit
distinto realmente. Pendiente de confirmar tras el cambio.

**Acción aplicada — 16-sep noche:** el toggle de ECH no aparecía en el
dashboard (`SSL/TLS → Edge Certificates`) porque **solo se muestra en
planes de pago con Advanced Certificate Manager activo**; en Free/Pro sin
ACM la función está activa pero oculta. Se desactivó vía API en su lugar:

```bash
curl.exe -X PATCH "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/settings/ech" -H "X-Auth-Email: apps@parkingplus.es" -H "X-Auth-Key: {GLOBAL_API_KEY}" -H "Content-Type: application/json" --data "{\"id\":\"ech\",\"value\":\"off\"}"
```

Respuesta: `{"result":{"id":"ech","value":"off",...},"success":true}`.
Verificado por DNS (`dns-query?name=parkingaeromadrid.es&type=HTTPS`) que el
registro `HTTPS` ya **no** trae el parámetro `ech=` (antes:
`... ech=AEX+DQBB... ipv6hint=...`, después: `... ipv6hint=...` sin `ech=`).

**Pendiente:** que el admin reintente entrar a `/admin` con datos móviles
(el mismo escenario que fallaba) y confirme si ya carga bien. Si el
problema persiste con ECH apagado, retomar la línea de "dispositivo/DNS
privado/apps de antivirus" de la sección anterior.

### Plan B preparado — test directo sin Cloudflare (si el error persiste)

El admin estaba dormido al momento del fix, así que se dejó preparado un
test de diagnóstico adicional para cuando reintente y, si el error
persiste, poder aislar si el problema sigue siendo Cloudflare o no:

- `ipv4.parkingaeromadrid.es` ya existía como `ServerAlias` en el vhost de
  Apache (`/var/www/vhosts/system/parkingaeromadrid.es/conf/httpd.conf`,
  alias que Plesk crea por defecto) pero **nunca tuvo registro DNS**
  (NXDOMAIN). No hay `ServerAlias` wildcard, así que un subdominio inventado
  (`test-directo`, etc.) no habría servido — Apache no lo habría reconocido.
- Se creó un registro `A` nuevo: `ipv4.parkingaeromadrid.es` → `91.213.46.180`,
  proxy status **DNS only** (nube gris, sin pasar por Cloudflare).
  Verificado por DNS que resuelve directo a la IP del VPS.
- **Cómo usarlo:** si el admin sigue con el error en `/admin` con datos
  móviles después del fix de ECH, pedirle que pruebe
  `https://ipv4.parkingaeromadrid.es/admin` en el mismo momento/red.
  - Si carga (aunque salga advertencia de certificado, porque el cert no
    cubre ese hostname — es esperado y no importa para el test) → confirma
    que el problema sigue siendo algo del edge/protocolo de Cloudflare.
  - Si también falla con el mismo tipo de error → la operadora está
    bloqueando el destino a otro nivel (por IP/rango, no por protocolo de
    Cloudflare), y tocar Cloudflare no sería la solución.
- Este registro es solo para diagnóstico, no se usa en producción — se
  puede borrar cuando se cierre el incidente.

## Regla general para recordar

1. Si Passenger no se reinició y el `access_ssl_log` muestra 200/normal a
   esa hora exacta → el servidor **no cayó**, el problema es de red del
   cliente o de Cloudflare edge (revisar su lado, no el origen).
2. Si Passenger sí se reinició cerca de la hora del reporte → mirar el log
   de la app (stdout/stderr de Passenger) para la causa del crash.
3. Si Cloudflare muestra bloqueos/mitigación masiva justo en esa ventana →
   ahí sí puede ser un ataque o una regla WAF con falso positivo afectando
   tráfico real.
4. Si falla solo en **datos móviles** y funciona en **WiFi** (mismo
   teléfono), o el error es `ERR_ECH_FALLBACK_CERTIFICATE_INVALID` /
   `ERR_QUIC_PROTOCOL_ERROR` / `ERR_CONNECTION_REFUSED` /
   `ERR_CONNECTION_ABORTED` variando entre teléfonos y operadoras →
   sospechar una función de cifrado de handshake de Cloudflare (HTTP/3
   QUIC o ECH en `SSL/TLS → Edge Certificates`) chocando con un middlebox
   de la operadora móvil. Revisar cuáles de esas dos están activas y
   probar desactivándolas una por una.
