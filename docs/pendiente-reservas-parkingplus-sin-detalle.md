# Reservas enviadas a ParkingPlus sin plan ni servicios

**Estado:** resuelto para las entradas desde el 28/07/2026 · **Detectado y corregido:** 27/07/2026

Las reservas que se enviaron al panel de ParkingPlus **antes del arreglo del 27/07/2026** llegaron
incompletas. Este documento deja constancia de qué faltaba, cómo se localizaron y qué queda abierto.

## Qué se corrigió el 27/07/2026

Se repasaron una a una las **16 reservas de Parking Aero Madrid con entrada del 28/07 en adelante**
(las anteriores se descartaron a propósito: su sobre ya estaba impreso, así que corregirlas no
aportaba nada). 14 estaban incompletas y 2 ya eran correctas por haber entrado después del arreglo.

A cada una se le repuso el `plan`, las terminales en formato `TERMINAL n`, y las filas que le
faltaban en `reservas_servicios` (seguro, y el lavado del plan en las Premium/Priority). El
`monto_total` **no se tocó en ninguna**: solo se repartió, dejando que la fila de parking absorbiera
la diferencia. Las 16 quedaron cuadrando (`monto_total` = suma de `precio_total`).

Datos que se usaron para reconstruirlas, por si hiciera falta repetir el proceso:

- El plan salía del texto `Plan: X` de `observaciones`.
- Ninguna llevaba nocturnidad: las horas más tempranas eran 04:00 y 05:00, fuera de la franja
  00:30–03:30. Las dos que sí la tenían ya estaban correctas.
- Los precios confirmaron los planes: la tarifa Estándar es **21,98 € + 4 €/día**, Premium suma el
  Lavado Exterior (10 €) y Priority el Interior/Exterior (24 €).

Copias de seguridad previas: `bk_reservas_20260727` y `bk_reservas_servicios_20260727`.

## Lo que queda abierto

- **Reservas con entrada anterior al 28/07/2026.** Siguen sin plan ni detalle de servicios. Se
  decidió no tocarlas porque su sobre ya se había impreso.
- **La BD de la landing tiene el mismo hueco.** Hasta el arreglo, `createFullReservation` tampoco
  escribía `reservas_servicios` ni la columna `plan`, así que su propio planning y su sobre salen
  incompletos en las reservas antiguas. Ahí el arreglo es distinto: no hay ni fila de parking que
  reaprovechar, habría que crearlas desde cero.
- **No hay enlace entre las dos reservas.** El endpoint devuelve su `nro_reserva` pero la landing no
  lo guarda, así que emparejarlas exige cruzar por matrícula + fecha y hora de entrada. Guardar ese
  número en un campo de la reserva local resolvería el problema para siempre.
- **Lavado de cortesía.** El selector de lavado del panel siempre cobra el precio de catálogo. Los
  lavados gratuitos se registran con `precio_total = 0.00` (así se hizo con `84813847`), pero eso hoy
  hay que hacerlo a mano en la BD.

## Qué les falta

El endpoint `POST /api/external/agencias/reservas` del dashboard solo guardaba el alta y una única
fila de servicio. Por eso, en esas reservas:

| Campo | Qué tienen | Qué deberían tener |
|---|---|---|
| `reservas.plan` | `0` | `1` Estándar · `2` Premium · `3` Priority · `4` Económico |
| `reservas_servicios` | 1 fila: parking (id 6) con `precio_total = monto_total` | parking + seguro (4) + lavado del plan (1 ó 2) + lavado extra + nocturnidad (11) |
| `terminal_entrada` / `terminal_salida` | `"T1"`, `"T4"`, `"No sé la terminal"` | `"TERMINAL 1"`, `"TERMINAL 4"`, `"N/E"` |

Consecuencia visible: el **sobre** (`GenerarPDFSobres.tsx`) no imprime el plan, no imprime el bloque
`INCLUYE:` y en la terminal saca solo `T` en vez de `T1` — porque parte el texto por el espacio y
compone `"T" + número`.

> Lo mismo aplica a la BD de la propia landing: antes del arreglo `createFullReservation` no escribía
> `reservas_servicios` ni la columna `plan`, así que sus reservas antiguas también salen sin detalle.

## Cómo localizarlas (BD del dashboard)

```sql
SELECT r.nro_reserva, r.fecha_entrada, r.plan,
       r.terminal_entrada, r.terminal_salida, r.monto_total, r.observaciones,
       COUNT(rs.id) AS filas_servicio
FROM reservas r
LEFT JOIN reservas_servicios rs ON rs.id_reserva = r.nro_reserva
WHERE r.medio_reserva = 2
  AND r.agencia = 'Parking Aero Madrid'
  AND (r.plan = 0 OR r.terminal_entrada NOT LIKE 'TERMINAL%')
GROUP BY r.id
ORDER BY r.fecha_entrada DESC;
```

Ojo con `reservas_servicios.id_reserva`: guarda el **`nro_reserva`**, no el `id` de la fila de
`reservas`. Es la convención del Yii2 original y la que usan el dashboard y la landing.

## Qué se puede recuperar

- **Plan y lavado** → están en texto dentro de `observaciones`, con este formato:
  `[car] Reserva agencia Parking Aero Madrid · Plan: Priority · Lavado: Lavado Interior`
  Se pueden parsear. Las que no traigan `Plan:` vienen del modal rápido o del panel y no tenían plan.
- **Nocturnidad** → se deduce de `hora_entrada` / `hora_salida`: aplica si alguna cae entre las
  **00:30 y las 03:30** (misma regla que `aplicaNocturnidad` en `lib/pricing.ts`).
- **Terminales** → convertibles directamente: el número que lleve el texto → `TERMINAL <n>`;
  si no lleva número → `N/E`.
- **Importes** → el reparto lo hace la misma lógica de `lib/servicios-reserva.ts`: los extras van a
  precio de catálogo y el parking absorbe el resto, para que la suma de `precio_total` siga
  cuadrando con `monto_total` (es lo que valida `/api/admin/integridad-precios`).

## Al revisarlo, tener en cuenta

- **No duplicar filas de servicio.** Si se lanza un script, borrar antes las de esa reserva o
  comprobar por `id_servicio` que no existan ya.
- Comprobar el resultado en `/api/admin/integridad-precios` del dashboard: avisa cuando
  `monto_total ≠ suma de precio_total`, y cuando un lavado (`fijo = 2`) tiene `cantidad > 1`.
- Los lavados y demás extras van siempre con `cantidad = 1`; solo el parking lleva los días.
- Decidir si merece la pena: si son pocas y ya pasaron su fecha de entrada, probablemente no.
  El sobre solo se imprime para reservas del día.

## Dónde está el código ya arreglado

- `lib/parkingplus.ts` — normaliza terminales, deduce nocturnidad y envía `plan` / `servicios`.
- `lib/servicios-reserva.ts` — construye las filas de `reservas_servicios` (misma lógica en ambos lados).
- `parkingplus-dashboard/src/app/api/external/agencias/reservas/route.ts` — guarda `plan` y el detalle.
