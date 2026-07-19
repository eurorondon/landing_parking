# Diagnóstico de correos de reserva (VPS)

Guía para comprobar si a un cliente le llegó el correo de confirmación de reserva y, si no, saber por qué.

## Cómo funciona el envío

- El código está en `app/api/reserva/route.ts` y usa **Nodemailer** contra el servidor SMTP propio del VPS (`mail.parkingaeromadrid.es`, puerto 465).
- El servidor de correo es **Postfix** (gestionado por Plesk). Su log está en **`/var/log/maillog`**.
- Cuando la app envía, escribe en su log `✅ Correo de confirmación enviado a <email>`. **Ojo:** ese `✅` solo significa que Postfix *aceptó* el mensaje, **no** que el cliente lo recibió. La entrega real hay que confirmarla en `/var/log/maillog`.

> ⚠️ Que a ti te llegue un correo de prueba NO prueba que al cliente le llegue. Cada destinatario (Gmail, Outlook, dominio corporativo) decide si lo entrega, lo manda a spam o lo rechaza.

## Pasos de diagnóstico en el VPS

Conéctate por SSH al VPS como root y ejecuta:

### 1. Confirmar el servidor de correo y su log

```bash
systemctl status postfix exim qmail 2>/dev/null | grep -E "●|Active"
ls -la /var/log/maillog /var/log/mail.log /var/log/exim_mainlog 2>/dev/null
```

En este servidor: **Postfix**, log en `/var/log/maillog`.

### 2. Buscar el correo del cliente (comando principal)

Sustituye por el email real del cliente:

```bash
grep -i "cliente@ejemplo.com" /var/log/maillog
```

### 3. Ver el recorrido completo de ese envío

El `queue-id` (ej. `E427A6064C`) enlaza todas las líneas del mismo mensaje. Este comando lo extrae y muestra la traza completa:

```bash
grep -i "cliente@ejemplo.com" /var/log/maillog | grep -oE "[A-F0-9]{10,12}" | head -1 | xargs -I{} grep {} /var/log/maillog
```

### 4. Otros comandos útiles

```bash
# Últimos envíos (para ubicar una reserva por hora/dominio si no recuerdas el email)
grep -iE "to=|status=" /var/log/maillog | tail -50

# Solo los que fallaron o quedaron pendientes
grep -iE "status=(bounced|deferred)|reject|blocked|spam" /var/log/maillog | tail -40

# Cola de correo (mensajes atascados sin entregar)
mailq | tail -30

# ¿Existe registro DMARC? (si sale vacío, publicarlo mejora la entrega a bandeja de entrada)
dig +short TXT _dmarc.parkingaeromadrid.es
```

## Cómo interpretar el resultado

Busca estas piezas en las líneas del log:

| Lo que ves en el log | Qué significa | Qué hacer |
|---|---|---|
| `status=sent` + `250 ... OK` | **Entregado** al servidor del destinatario. El envío fue perfecto. | Está en el buzón del cliente → revisar **Spam / Promociones**. |
| `spf: ... PASS` | El registro SPF del dominio es correcto. | Nada, está bien. |
| `dk_sign: ... PASS` | El mensaje se **firmó con DKIM** correctamente. | Nada, está bien. |
| `status=bounced` + `550`/`554` | El servidor del destinatario lo **rechazó**. | Ver el motivo: dirección inexistente, spam, política. |
| `status=deferred` + `421`/`4.x.x` | Retenido temporalmente (greylisting o rechazo temporal). | Puede reintentar; revisar `mailq`. |
| `550 spam` / `blocked` / `policy` | Rechazado por reputación / autenticación. | Revisar SPF/DKIM/DMARC y reputación de la IP. |
| **No aparece nada** | La app nunca entregó el mensaje a Postfix. | Revisar logs de la app (Node/PM2/Plesk), no el correo. |

## Caso resuelto — 19 jul 2026

**Cliente:** `angel.fernandez@sorianatural.es` (dominio en Google Workspace).

Traza del log (`queue-id E427A6064C`):

```
from=<reservas@parkingaeromadrid.es> to=<angel.fernandez@sorianatural.es>
spf: stderr: PASS
dk_sign: stderr: PASS
to=<angel.fernandez@sorianatural.es>, relay=aspmx.l.google.com, status=sent (250 2.0.0 OK ... gsmtp)
E427A6064C: removed
```

**Conclusión:** el envío fue impecable — SPF PASS, DKIM firmado y **Google lo aceptó con `250 OK`**. El correo estaba en la cuenta de Google del cliente. El problema NO era del servidor: había caído en **Spam / filtro corporativo** del destinatario.

**Solución dada al cliente:** buscar en Gmail (incluye spam) `from:parkingaeromadrid.es`, marcar "No es spam" y añadir `reservas@parkingaeromadrid.es` a contactos. Si usa antispam corporativo, su administrador de Google Workspace puede liberarlo desde cuarentena buscando el `message-id`.

## Regla general para recordar

1. Si en el log ves **`status=sent` + `250 OK`** → tu servidor cumplió; el problema está en el buzón del cliente (spam/filtro).
2. Si ves **`bounced` / `rejected`** → el servidor del cliente lo rechazó; leer el código de error.
3. Si **no aparece** → falló la app antes de llegar al correo.
