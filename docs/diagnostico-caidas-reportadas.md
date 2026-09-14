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

## Regla general para recordar

1. Si Passenger no se reinició y el `access_ssl_log` muestra 200/normal a
   esa hora exacta → el servidor **no cayó**, el problema es de red del
   cliente o de Cloudflare edge (revisar su lado, no el origen).
2. Si Passenger sí se reinició cerca de la hora del reporte → mirar el log
   de la app (stdout/stderr de Passenger) para la causa del crash.
3. Si Cloudflare muestra bloqueos/mitigación masiva justo en esa ventana →
   ahí sí puede ser un ataque o una regla WAF con falso positivo afectando
   tráfico real.
