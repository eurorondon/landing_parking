# SSL caducado, subdominio ipv4 y scroll horizontal del admin (30/10/2026)

Dominio: `parkingaeromadrid.es` (VPS 91.213.46.180, Plesk + nginx, DNS en Cloudflare).

## 1. Redirecciones 301 de subdominios (hecho y desplegado)

- `middleware.ts` redirige con 301 cualquier `*.parkingaeromadrid.es` (`www.`, `ipv4.`, otros) a `https://parkingaeromadrid.es`, conservando ruta y parámetros. Commit `cf02df3`.
- Verificado en producción con `curl -I`: `ipv4.` y `www.` → 301 a la URL canónica; el dominio principal responde 200.
- Canonical: todas las páginas públicas la declaran con el dominio principal y barra final. Solo `/planes` y `/reservar` no la llevan (flujo de reserva; decisión pendiente).

## 2. ipv4.parkingaeromadrid.es

- Es un registro `A` → 91.213.46.180, "DNS only" (sin Cloudflare). Se creó como prueba de diagnóstico (ver `diagnostico-caidas-reportadas.md`) y se quedó olvidado; Google llegó a indexar páginas del blog en ese host.
- Antes de este cambio servía el sitio completo con 200 y con el certificado caducado.
- **Pendiente:** borrar el registro DNS `ipv4` en Cloudflare cuando Google haya reasignado las páginas al dominio principal (unas semanas; revisar Search Console). Mientras exista, el 301 protege el SEO.

## 3. Certificado SSL (renovado el 30/10/2026)

**Causa del fallo:** el certificado de Plesk era un comodín (`*.parkingaeromadrid.es` + dominio), que Let's Encrypt solo valida por DNS (registro TXT `_acme-challenge`). El DNS está en Cloudflare, no en Plesk, así que Plesk no podía renovarlo solo y caducó el 21/09/2026. No hay `certbot`: lo gestiona la extensión Let's Encrypt de Plesk.

**Qué se hizo (por SSH, como root):**
- Respaldo en `/root/backup-ssl-2026-10-30/` (certificado antiguo + `parkingaeromadrid.es.conf` de nginx).
- Emisión de un certificado normal sin comodín:
  `plesk bin extension --exec letsencrypt cli.php -d parkingaeromadrid.es -d www.parkingaeromadrid.es -m <email-admin-plesk>`
- Resultado: válido hasta el **28/01/2027**, cubre `parkingaeromadrid.es` y `www.`; nginx lo sirve (misma ruta `/opt/psa/var/certificates/scf1skp3sigap9mdIK3l5O`), `nginx -t` OK, web principal 200.

**Reversa:** copiar de nuevo el archivo del respaldo a esa ruta y `systemctl reload nginx` (el antiguo está caducado, solo como último recurso).

**Pendientes:**
- A mediados de enero de 2027 comprobar que Plesk lo renovó solo (validación HTTP, ~30 días antes). No se ha podido probar una renovación real.
- Cloudflare → SSL/TLS: el modo actual no se ha mirado en el panel. La web funcionaba con el certificado caducado, así que no era Full strict. Con el certificado válido ya se podría pasar a Full strict.
- `parkingplus.es` (otro proyecto, mismo servidor) tiene otro comodín con el mismo problema: su renovación falló el 29/10 (`Incorrect TXT record found at _acme-challenge.parkingplus.es`). Mirar cuándo caduca y, si no, hacer lo mismo (certificado sin comodín).

## 4. Scroll horizontal del admin en móvil (hecho y desplegado)

- Medido en producción a 375 px: Análisis de caída 830 px de ancho, Planning 878, Clientes 456, Inicio 393 (el móvil muestra ~360).
- **Causa:** tarjetas, rejillas y `#main` (hijo flex) tienen `min-width:auto`; un contenido ancho (gráficos SVG de 760/560 px, calendario del planning, textos largos) los ensanchaba y aparecía scroll de página.
- **Arreglo** (commit `ca61d4d`, `app/admin/admin.css`): `min-width:0` en `#main`, `#content`, tarjetas y listas de Análisis (`minmax(0,1fr)`, `overflow-wrap:anywhere`); los gráficos hacen scroll dentro de su tarjeta.
- Verificado tras el deploy: las 10 secciones del admin a 375 px sin desbordamiento.
- Referencia: el admin de parkingaeropuertomadrid24 no tiene la sección Análisis y no sufre el problema.
