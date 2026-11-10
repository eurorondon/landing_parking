# Paradas: periodos en los que no se reciben ni entregan vehículos

**Fecha:** 10-nov-2026 · **Estado:** implementado y probado en local; **pendiente de
desplegar** (Plesk manual) y de commitear.

Permite marcar tramos en los que el parking no trabaja (ejemplo: Nochebuena,
**del 24-dic 12:00 al 25-dic 12:00**) para que la web no admita reservas con
entrada o salida dentro de ellos.

---

## 1. Regla de negocio (opción A)

- Solo se bloquean las **horas de entrada y de salida** que caen dentro del
  periodo. Una estancia que lo **atraviesa** (entra el 23, sale el 26) **sí** se
  puede reservar: el coche ya está guardado durante la parada.
- El intervalo es **[inicio, fin)**: a la hora de inicio **ya estamos cerrados** y a
  la hora de fin **ya hemos reabierto**. Con 24-dic 12:00 → 25-dic 12:00:
  - 24-dic 11:45 → abierto · 24-dic 12:00 → cerrado
  - 25-dic 11:45 → cerrado · 25-dic 12:00 → abierto
- Un día queda **desactivado en el calendario** solo si no le queda ninguna hora
  libre (p. ej. una parada 31-dic 00:00 → 02-ene 00:00 deja el 31-dic y el
  1-ene sin seleccionar). Los días cerrados solo en parte siguen siendo
  seleccionables, con sus horas filtradas.

## 2. Cómo se usa (admin)

`/admin` → **Paradas** (🛑, en el menú lateral junto a Temporadas):

1. **+ Nueva parada**.
2. *Cerramos desde* (fecha + hora) y *Reabrimos el* (fecha + hora).
3. *Descripción* opcional (p. ej. «Navidad»). **Se muestra a los clientes** en la
   web: debe ser un texto apto para público.
4. **Crear parada**.

El listado muestra el estado (Programada / En curso / Pasada / Inactiva) y
permite **Desactivar/Activar** y **Eliminar**. Para cambiar fechas u horas se
elimina y se vuelve a crear (igual que las temporadas).

**Aviso de reservas afectadas:** al crear una parada el panel cuenta las reservas
**confirmadas** con entrada o salida dentro del periodo y avisa. **No las cancela
ni las mueve**: hay que revisarlas a mano en Reservas.

## 3. Qué ve el cliente

- En el formulario de reserva (`BookingForm`: home y landings SEO) aparece un
  aviso amarillo con cada parada próxima: «Sin entradas ni salidas de vehículos
  del … al … (Navidad). Puedes reservar entrando antes y saliendo después.»
- El calendario desactiva los días totalmente cerrados y el desplegable de horas
  oculta las horas bloqueadas de ese día.
- Si el cliente cambia de fecha y la hora que tenía cae en la parada, se ajusta
  sola a la hora libre más cercana (primero hacia delante, si no hacia atrás) y
  se muestra un aviso explicándolo.
- Si aun así llega al servidor una reserva dentro de una parada, `POST
  /api/reserva` responde **400** con `code: "parada"` y un mensaje claro, y
  `ReservaForm` (`/reservar`) lo muestra.

## 4. Piezas

| Archivo | Qué hace |
|---|---|
| `lib/paradas.ts` | Lógica **pura** (sin BD), usable en navegador y servidor: intervalos, horas libres, día cerrado, validación, textos |
| `lib/paradas-db.ts` | Solo servidor: `obtenerParadasActivas()` y `contarReservasAfectadas()` |
| `app/api/paradas/route.ts` | `GET` público: paradas activas no terminadas (caché 60 s) |
| `app/api/admin/paradas/route.ts` | `GET` lista, `POST` crea (protegido por sesión) |
| `app/api/admin/paradas/[id]/route.ts` | `PATCH` activar/desactivar/descripción, `DELETE` |
| `components/admin/ParadasSection.tsx` | Pantalla del panel |
| `components/BookingForm.tsx` | Carga paradas, filtra días/horas, ajusta y avisa |
| `components/ui/DatePicker.tsx`, `DatePickerCalendar.tsx` | Nueva prop opcional `isDateDisabled` |
| `app/api/reserva/route.ts` | Validación definitiva en servidor |
| `app/(site)/reservar/_components/ReservaForm.tsx` | Muestra el mensaje de parada |

**Tabla:** se usa la tabla `paradas` que ya existía en la BD (copiada del
esquema de ParkingPlus; sin uso ni filas, comprobado por SSH el 10-nov-2026). **No
hay migración que ejecutar.** Columnas: `fecha_inicio`/`hora_inicio`,
`fecha_fin`/`hora_fin`, `descripcion`, `status`. Aquí `status` vale `"activo"` o
`"inactivo"` (como en `precio_temporada`); cualquier otro valor (incluido el `"0"`
por defecto de la columna) se trata como inactivo.

**Zona horaria:** todo son horas de pared `"YYYY-MM-DDTHH:MM"` sin zona, comparadas
como texto. Las columnas `DATE`/`TIME` se leen y escriben en UTC (convención de
Prisma, igual que `precio_temporada`). No hay conversiones con `Date.UTC` sobre
las reservas; ver `timezone-handling` en la memoria del proyecto.

## 5. Decisiones y límites

- **Si la BD falla, no se bloquea nada:** `/api/paradas` devuelve lista vacía y
  `POST /api/reserva` acepta la reserva (registra el error). Prima no perder
  reservas.
- **Reservas creadas desde el admin** (`ReservationFormModal` →
  `/api/admin/reservas`) **no se validan** contra las paradas: el dueño puede
  hacer excepciones a mano.
- `components/BookingModal.tsx` **no se usa** en ningún sitio (código muerto) y no
  se ha tocado.
- La parada **no cancela ni reubica** reservas existentes.
- Las paradas ya terminadas se descartan en la consulta pública (no pueden
  afectar a ninguna reserva).

## 6. Pruebas realizadas (10-nov-2026)

- `tsc --noEmit`: sin errores.
- **47 casos de la lógica pura** (límites exactos 11:45/12:00, estancia que
  atraviesa la parada, día completo, varias paradas, cruce de año, febrero
  bisiesto, conversión a columnas) — todos OK.
- **Navegador (dev server local, paradas simuladas):** avisos visibles; el 31-dic
  desactivado y 24/25-dic activos; entrada el 24-dic ofrece de 00:00 a 11:45; la
  salida por defecto de 18:00 se ajustó sola a 11:45 con el aviso correspondiente.
- Rutas admin sin sesión → 401. Sin BD, `/api/paradas` → 200 con lista vacía.

**NO probado (y por qué):**
- Lectura/escritura real contra MySQL: no hay BD en local.
- `POST /api/reserva` extremo a extremo: dispararía ParkingPlus, correo y Discord
  de verdad. La validación son pocas líneas sobre funciones ya probadas.

## 7. Desplegar y verificar

1. Desplegar en Plesk (manual) y reiniciar la app Node.
2. En `/admin` → Paradas, crear una parada **de prueba lejana** (p. ej. dentro de
   un año) y comprobar que aparece en el listado con las horas correctas.
   - Esto verifica el viaje de ida y vuelta de `DATE`/`TIME` con Prisma, que es
     lo único que no se pudo probar en local.
3. `https://parkingaeromadrid.es/api/paradas/` debe devolverla con `inicio`/`fin`
   en el formato `"YYYY-MM-DDTHH:MM"` exacto que se introdujo (no desplazado 1-2 h).
4. En la web, comprobar el aviso y que el calendario/horas la respetan.
5. Borrar la parada de prueba y crear las reales (p. ej. Navidad).

## 8. Pendiente

- Commit y despliegue.
- Crear las paradas reales de Navidad/Fin de año cuando el dueño confirme las horas.
