# PENDIENTE · Reservas enviadas a ParkingPlus sin plan ni servicios

**Estado:** sin resolver · **Detectado:** 27/07/2026

Las reservas que se enviaron al panel de ParkingPlus **antes del arreglo del 27/07/2026** llegaron
incompletas. Hay que revisarlas y decidir si se rellenan a mano, con un script, o si se dan por
perdidas. Este documento deja constancia de qué falta y cómo localizarlas.

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
