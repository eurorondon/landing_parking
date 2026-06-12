# Parking Aero Madrid — Landing + Panel de Administración

Proyecto **Next.js 15 (App Router) + TypeScript** con dos partes:

- **Landing page** (`/`): diseño glassmorphism navy/petróleo, calculador de precio y modal de reserva.
- **Panel de administración** (`/admin`): gestión completa de reservas (inicio con métricas, listado con filtros, calendario, clientes, reportes y configuración).

## Arrancar el proyecto

```bash
npm install
npm run dev        # desarrollo → http://localhost:3000
npm run build      # build de producción
npm start          # servir el build
```

## Panel de administración

- URL: `http://localhost:3000/admin`
- Contraseña: la definida en `.env.local` → `ADMIN_PASSWORD` (por defecto `admin123` en desarrollo). ⚠️ **Cambiarla antes de publicar.**
- La primera vez se carga con datos de demostración; se pueden borrar desde **Configuración → Zona de peligro**.

### Flujo conectado con la landing

Cuando un cliente confirma una reserva en la web:
1. Se guarda en el almacén del servidor con estado **Pendiente** y la nota "Recibida desde la web".
2. Se envía el correo al email del propietario (el configurado en **/admin → Configuración**, con `lib/config.ts → NEGOCIO.emailDueno` como respaldo).
3. Aparece al instante en el panel (Inicio, Reservas, Calendario…), donde el admin puede confirmarla, marcar el vehículo dentro, finalizarla o cancelarla.

### Almacenamiento de datos

Las reservas y la configuración se guardan en archivos JSON en `data/` (vía `lib/store.ts`). Esto funciona en cualquier servidor Node propio. ⚠️ Para producción serverless (Vercel) o mayor robustez, sustituir `lib/store.ts` por una base de datos — **Supabase recomendado** (el esquema SQL está comentado dentro de `lib/store.ts`). El resto de la app no necesita cambios.

## Qué debe cambiar el programador antes de publicar

| Qué | Dónde |
|---|---|
| **Contraseña del panel** | `.env.local` → `ADMIN_PASSWORD` |
| Email del dueño (respaldo) | `lib/config.ts` → `NEGOCIO.emailDueno` (editable también desde /admin → Configuración) |
| Teléfono, WhatsApp, dirección | `lib/config.ts` → `NEGOCIO` |
| **Tarifas de la landing** | `lib/pricing.ts` → `TARIFAS` |
| **Tarifas del panel** (coche/moto por día) | /admin → Configuración (o `lib/admin.ts` → `DEFAULT_CONFIG`) |
| Textos legales | `app/(site)/privacidad/` y `app/(site)/aviso-legal/` |
| Clave de envío de correo | `.env.local` → `RESEND_API_KEY` (ver `.env.local.example`) |

## Envío de correo de reservas

API en `app/api/reserva/route.ts`:

- **Con Resend (implementado):** rellenar `RESEND_API_KEY` y `EMAIL_FROM` en `.env.local`. Usa la API HTTP de Resend, sin dependencias extra.
- **Sin configurar:** la reserva se registra igualmente en el panel y se imprime en la consola del servidor.
- **Alternativa Nodemailer/SMTP:** bloque comentado al final del archivo.

## Estructura

```
app/
  (site)/               # web pública (landing + legales) con su CSS
    page.tsx  layout.tsx  landing.css  privacidad/  aviso-legal/
  admin/                # panel de administración con su CSS
    page.tsx  layout.tsx  admin.css  login/
  api/
    reserva/            # reserva desde la landing (guarda + email)
    admin/              # CRUD reservas, config, login/logout, demo
components/
  Header, Hero, BookingForm, BookingModal, TrustBar, ...   # landing
  admin/                # AdminDashboard, secciones y modales del panel
lib/
  config.ts    # datos del negocio (⚠️ editar)
  pricing.ts   # tarifas del calculador web (⚠️ editar)
  admin.ts     # tipos y precios del panel
  store.ts     # almacén JSON (sustituir por BD en producción)
middleware.ts  # protege /admin y /api/admin con cookie de sesión
data/          # reservas y configuración (generado, fuera de git)
```

## Lógica de precios

- **Landing** (`lib/pricing.ts`): 1–6 días `18€ + 5€/día` · 7–14 días `45€ + 4€/día extra` · 15+ días `76€ + 3,50€/día extra`.
- **Panel** (`lib/admin.ts` + Configuración): tarifa por día según vehículo (coche/moto) con mínimo de días y precio mínimo. Se aplica a reservas creadas o editadas desde el panel.
