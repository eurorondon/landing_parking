# Cron de actualización de estatus de reservas — 19/10/2026

> Proyecto: **landing_parking** · Dominio: `parkingaeromadrid.es`
> Estado: **implementado, desplegado y programado.** Pendiente solo de confirmar en el log que el cron corre solo (ver sección 6).

## 1. Qué se hizo y por qué

Las reservas de esta web nunca cambiaban de estado: todas seguían en **Pendiente** (estatus 1)
aunque su salida hubiera pasado. En parkingplus eso lo hace un cron de la app antigua en Yii2
(`console\controllers\ReservasController::actionActualizarEstatus`), que solo actúa sobre **su**
base de datos. Este proyecto tiene la suya, así que nunca se actualizaba.

Se copió la misma regla a una ruta Next.js y se programó con `crontab` en el VPS:

| Condición | Pasa a |
|---|---|
| `TIMESTAMP(fecha_salida, hora_salida) <= NOW()` y estatus no es 0, 2 ni 4 | **2 Finalizada** |
| entrada pasada y salida futura, y estatus no es 0, 2, 3 ni 4 | **3 Activa** |

- `0` = Cancelada y `4` = Rezagada son estados manuales: **nunca se tocan**.
- La comparación se hace en MySQL con `NOW()` (hora del servidor, España).
- Primero se aplican las finalizadas y después las activas, para que una reserva ya vencida no pase por "activa".

Código: `app/api/cron/actualizar-estatus/route.ts` (commit `b654fac`).

## 2. Cómo funciona la ruta

`GET https://parkingaeromadrid.es/api/cron/actualizar-estatus?secret=<CRON_SECRET>`

- Sin clave o con clave incorrecta → `401 {"ok":false,"error":"No autorizado"}`.
- Variable `CRON_SECRET` sin definir → `500 CRON_SECRET no configurado`.
- Clave también válida en la cabecera `x-cron-secret`.
- `&dry=1` → solo **cuenta** lo que cambiaría, no escribe nada.
- Respuesta normal: `{"ok":true,"finalizadas":N,"activas":M}`.
- La ruta queda fuera del `proxy.ts` (`middleware.ts` en este proyecto, que solo protege `/admin` y `/api/admin`), por eso la protege el secreto.

## 3. Qué hay en el VPS (`91.213.46.180`, Plesk)

| Qué | Dónde |
|---|---|
| Código desplegado | `/var/www/vhosts/parkingaeromadrid.es/httpdocs` |
| Clave del cron | `CRON_SECRET=` en `httpdocs/.env.local` (48 caracteres, solo en el servidor; copia previa en `.env.local.bak-antes-cron`) |
| Programación | crontab de **root**, una línea cada 15 minutos |
| Log del cron | `/var/log/actualizar-estatus-parkingaeromadrid.log` |
| Copia del crontab anterior | `/root/crontab.bak-antes-estatus2` |
| Repositorio Git de Plesk | `landing_parking.git`, rama `main`, modo auto (webhook), sin acciones post-despliegue |

Línea del crontab (la clave real está en el servidor):

```
*/15 * * * * curl -s -m 60 -o /dev/null -w "\%{http_code} \%{time_total}s\n" "https://parkingaeromadrid.es/api/cron/actualizar-estatus?secret=<CRON_SECRET>" >> /var/log/actualizar-estatus-parkingaeromadrid.log 2>&1
```

> En un crontab el carácter `%` **hay que escribirlo `\%`**.

## 4. Primera ejecución (19/10/2026)

Antes: 573 reservas en estatus 1 y 1 en estatus 3. Resultado de la primera pasada real:
**534 → Finalizada, 19 → Activa.** Una segunda pasada devolvió 0 y 0.
(El dry-run previo dio 534 y 19; el cálculo de la tarde daba 533 y 20: una reserva pasó de activa a finalizada con el paso del tiempo.)

## 5. ⚠️ Regla importante: NO usar el panel de Plesk para este cron

En parkingplus (27/03/2026) los estados dejaron de actualizarse porque alguien guardó los cron desde
**Plesk → Tareas programadas**: Plesk regeneró el crontab del usuario con `SHELL="/opt/psa/bin/chrootsh"`,
un shell restringido donde la ruta de PHP no existe, y el comando fallaba **en silencio**.

Por eso aquí:
- La línea está en el crontab de **root**, editado por SSH con `crontab -e` / `crontab`, nunca desde el panel.
- Usa **`curl`** a la URL pública, sin depender de rutas de PHP ni del shell.
- Deja un log con el código HTTP, para que un fallo se vea.

Si alguien vuelve a crear la tarea desde el panel de Plesk, hay que revisar `crontab -l`.

## 6. Comandos útiles (desde tu PC; ponles `!` delante en Claude Code)

**Comprobar que el cron corre solo** (esperar a un minuto 0, 15, 30 o 45):
```
ssh root@91.213.46.180 'tail -5 /var/log/actualizar-estatus-parkingaeromadrid.log'
```
Debe haber líneas tipo `200 0.4s`. Si el archivo no existe o no crece, el cron no corre.

**Ver la línea del crontab sin mostrar la clave:**
```
ssh root@91.213.46.180 'crontab -l | grep "api/cron" | sed -E "s#secret=[^\"]+#secret=***#"; systemctl is-active cron'
```

**Contar lo pendiente sin escribir (dry-run)** — la clave la lee el propio servidor:
```
ssh root@91.213.46.180 'h=/var/www/vhosts/parkingaeromadrid.es/httpdocs; s=$(grep "^CRON_SECRET=" $h/.env.local | cut -d= -f2); curl -s -m 60 -w " [%{http_code}]\n" "https://parkingaeromadrid.es/api/cron/actualizar-estatus?secret=$s&dry=1"'
```

**Ejecutar la actualización a mano** (igual, sin `&dry=1`):
```
ssh root@91.213.46.180 'h=/var/www/vhosts/parkingaeromadrid.es/httpdocs; s=$(grep "^CRON_SECRET=" $h/.env.local | cut -d= -f2); curl -s -m 120 -w " [%{http_code}]\n" "https://parkingaeromadrid.es/api/cron/actualizar-estatus?secret=$s"'
```

**Añadir la línea al crontab** (por si hubiera que rehacerla; hace copia y no duplica):
```
ssh root@91.213.46.180 'h=/var/www/vhosts/parkingaeromadrid.es/httpdocs; s=$(grep "^CRON_SECRET=" $h/.env.local | cut -d= -f2); crontab -l > /root/crontab.bak-$(date +%F-%H%M); crontab -l | grep -q "parkingaeromadrid.es/api/cron" && { echo "ya existe"; exit; }; { crontab -l; echo "*/15 * * * * curl -s -m 60 -o /dev/null -w \"\\%{http_code} \\%{time_total}s\\n\" \"https://parkingaeromadrid.es/api/cron/actualizar-estatus?secret=$s\" >> /var/log/actualizar-estatus-parkingaeromadrid.log 2>&1"; } | crontab -; echo añadida'
```

**Cambiar (rotar) la clave:** edita `CRON_SECRET` en `httpdocs/.env.local` del servidor, reinicia la app
(`touch httpdocs/tmp/restart.txt`) y actualiza la clave en la línea del crontab (`crontab -e`).
Las dos deben coincidir, si no el log mostrará `401`.

## 7. Despliegue de cambios futuros

> Este proyecto usa Next 15 (`next ^15.5`), no el 16 del otro; el deploy se hizo igual.

1. `git push` a `main` (GitHub).
2. Plesk → dominio → **Git** → repositorio → **Pull Updates / Deploy**. (El modo auto con webhook no se disparó en esta ocasión: hubo que hacerlo a mano.)
3. Tras el deploy, el `.next` quedó recompilado y `tmp/restart.txt` actualizado. Comprobar con
   `ls -la httpdocs/.next/BUILD_ID httpdocs/tmp/restart.txt` que las fechas son recientes.
4. Purgar la caché de Cloudflare.

## 8. Cómo deshacer

Antes de la primera ejecución había 573 reservas en estatus 1 (Pendiente) y **1 ya en estatus 3**. Para volver atrás:
```
UPDATE reservas SET estatus = 1 WHERE estatus IN (2, 3);
```
⚠️ Eso dejaría también esa reserva que ya estaba en 3 como pendiente: habría que devolverla a 3 a mano. Y quitar la línea del crontab (`crontab -e`). La copia previa está en `/root/crontab.bak-antes-estatus2`.

## 9. Pendiente / a vigilar

- **Posible desfase de 1–2 horas** entre la hora que ve el cliente y la que se guarda en `hora_entrada`/`hora_salida`
  (depende de la zona horaria del proceso Node que guarda la reserva). Si una reserva cambia de estado antes o
  después de lo esperado, ese es el motivo; el cron de Yii2 de parkingplus se comporta igual con esas filas.
  Comprobar con una reserva que entre o salga hoy.
- Opcional: avisar por Discord cuando la ruta devuelva error (la web ya lo hace con las reservas).
- Este deploy trajo también los cambios del panel de ese día (gráfico diario, ingresos por mes de creación, columna "Fecha de reserva"; commit `3c3f159`).
- Relacionado: el panel muestra ingresos por mes según la fecha de **creación** (`created_at`) y las horas en hora de Madrid (`partesMadrid` en `lib/admin.ts`).
