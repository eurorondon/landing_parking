/**
 * ============================================================
 *  ALMACÉN DE DATOS — Prisma / MySQL
 *
 *  Comparte la misma base de datos que parkingplus-dashboard.
 *  Cada reserva web crea o reutiliza:
 *    1. clientes    — datos del cliente (nombre, email, móvil)
 *    2. coches      — vehículo (matrícula, marca, modelo)
 *    3. reservas    — la reserva en sí, con medio_reserva = 3 (web)
 *
 *  Variable necesaria en .env.local:
 *    DATABASE_URL=mysql://user:pass@host:3306/nombre_db
 *
 *  Sin DATABASE_URL el panel muestra datos de demostración.
 * ============================================================
 */

import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_CONFIG,
  type AdminConfig,
  type ReservaAdmin,
  type ReservaStatus,
  type VehicleType,
} from "./admin";
import { calculateRawParkingDays } from "./pricing";
import type { Terminal } from "./config";

// ── Config local (no va a la BD) ──────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const CFG_FILE = path.join(DATA_DIR, "config.json");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/** ID de reserva para datos demo únicamente */
export function genId(): string {
  return (
    "PAM-" +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase()
  );
}

// ── Prisma (lazy import — solo se usa si DATABASE_URL está definida) ───────────

async function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  const { prisma } = await import("./prisma");
  return prisma;
}

// ── Constantes de mapeo ────────────────────────────────────────────────────────

/**
 * medio_reserva = 3 → reservas creadas desde la landing web.
 * El panel (admin, agente) usa 1 y 2.
 */
const MEDIO_WEB = 3;

const ESTATUS_TO_STATUS: Record<number, ReservaStatus> = {
  0: "cancelled",
  1: "confirmed",
  2: "finished",
  3: "inside",
};

const STATUS_TO_ESTATUS: Record<ReservaStatus, number> = {
  confirmed: 1,
  inside:    3,
  finished:  2,
  cancelled: 0,
};

// ── Conversión BD → ReservaAdmin ──────────────────────────────────────────────

type DbReserva = {
  id:                    number;
  fecha_entrada_completa: Date | null;
  fecha_salida_completa:  Date | null;
  terminal_entrada:       string;
  monto_total:            { toNumber?: () => number } | number;
  estatus:                number;
  observaciones:          string | null;
  created_at:             Date | null;
  clientes: {
    nombre_completo: string;
    correo:          string;
    movil:           string;
  } | null;
  coches: {
    matricula: string;
    marca:     string;
    modelo:    string | null;
  } | null;
};

/** Extrae el tipo de vehículo del campo observaciones */
function extractVehicleType(obs: string | null): VehicleType {
  // Las motos ya no se ofrecen: los registros legacy con prefijo [moto] se
  // interpretan como autocaravana.
  if (obs?.startsWith("[autocaravana]") || obs?.startsWith("[moto]")) return "autocaravana";
  return "car";
}

/** Elimina el prefijo de tipo de vehículo de las notas */
function cleanNotes(obs: string | null): string {
  return (obs ?? "").replace(/^\[(car|moto|autocaravana)\]\s*/, "");
}

/** Formatea un Date a "YYYY-MM-DDTHH:mm" en hora local del servidor */
function toLocalISO(d: Date | null): string {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `T${p(d.getHours())}:${p(d.getMinutes())}`
  );
}

function dbToReserva(r: DbReserva): ReservaAdmin {
  const precio =
    typeof (r.monto_total as { toNumber?: () => number }).toNumber === "function"
      ? (r.monto_total as { toNumber: () => number }).toNumber()
      : Number(r.monto_total);

  return {
    id:          r.id.toString(),
    name:        r.clientes?.nombre_completo ?? "—",
    phone:       r.clientes?.movil          ?? "—",
    email:       r.clientes?.correo         ?? "—",
    vehicleType: extractVehicleType(r.observaciones),
    plate:       r.coches?.matricula        ?? "—",
    model:       [r.coches?.marca, r.coches?.modelo].filter(Boolean).join(" ") || "—",
    terminal:    (r.terminal_entrada        ?? "T1") as Terminal,
    checkIn:     toLocalISO(r.fecha_entrada_completa),
    checkOut:    toLocalISO(r.fecha_salida_completa),
    status:      ESTATUS_TO_STATUS[r.estatus] ?? "confirmed",
    price:       precio,
    notes:       cleanNotes(r.observaciones),
    createdAt:   r.created_at?.toISOString() ?? new Date().toISOString(),
  };
}

// ── API pública ────────────────────────────────────────────────────────────────

/**
 * Lista todas las reservas.
 * Con DATABASE_URL: consulta MySQL. Sin ella: devuelve datos demo.
 */
export async function getReservations(seedIfMissing = false): Promise<ReservaAdmin[]> {
  const db = await getPrisma();
  if (!db) {
    return seedIfMissing ? buildDemo() : [];
  }

  try {
    const rows = await db.reservas.findMany({
      orderBy: { created_at: "desc" },
      take: 2000,
      include: {
        clientes: { select: { nombre_completo: true, correo: true, movil: true } },
        coches:   { select: { matricula: true, marca: true, modelo: true } },
      },
    });

    return rows
      .filter((r) => r.clientes !== null)
      .map((r) => dbToReserva(r as unknown as DbReserva));
  } catch (err) {
    console.error("[store] getReservations:", err);
    return seedIfMissing ? buildDemo() : [];
  }
}

/** Obtiene una reserva por id (eficiente: no carga toda la tabla). */
export async function getReservationById(id: string): Promise<ReservaAdmin | null> {
  const db = await getPrisma();
  if (!db) return null;

  try {
    const r = await db.reservas.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        clientes: { select: { nombre_completo: true, correo: true, movil: true } },
        coches:   { select: { matricula: true, marca: true, modelo: true } },
      },
    });
    if (!r?.clientes) return null;
    return dbToReserva(r as unknown as DbReserva);
  } catch (err) {
    console.error("[store] getReservationById:", err);
    return null;
  }
}

/**
 * Compatibilidad: `saveReservations([])` elimina todas las reservas web.
 * Nunca se llama con un array no vacío en el flujo actual.
 */
export async function saveReservations(arr: ReservaAdmin[]): Promise<void> {
  const db = await getPrisma();
  if (!db) return;

  if (arr.length > 0) {
    console.warn("[store] saveReservations con array no vacío — ignorado");
    return;
  }
  // Solo borra las reservas creadas por la landing (medio_reserva = 3)
  await db.reservas.deleteMany({ where: { medio_reserva: MEDIO_WEB } });
}

/**
 * Crea una reserva completa en MySQL:
 *  1. Busca o crea `clientes` (por teléfono).
 *  2. Busca o crea `coches`   (por matrícula).
 *  3. Genera `nro_reserva` e inserta en `reservas`.
 */
export async function createFullReservation(params: {
  name:        string;
  phone:       string;
  email:       string;
  vehicleType: VehicleType;
  plate:       string;
  model:       string;
  terminal:    Terminal;
  checkIn:     string;   // "2026-06-15T09:00"
  checkOut:    string;
  status:      ReservaStatus;
  price:       number;
  notes:       string;
  /** Cupón ya validado; `price` debe llegar YA descontado */
  cupon?: {
    codigo:    string;
    tipo:      "porcentaje" | "fijo";
    valor:     number;
    /** importe descontado en € */
    descuento: number;
  };
}): Promise<ReservaAdmin> {
  const db = await getPrisma();
  if (!db) {
    // Sin BD: devuelve objeto en memoria (modo desarrollo)
    return {
      id:          genId(),
      name:        params.name,
      phone:       params.phone,
      email:       params.email,
      vehicleType: params.vehicleType,
      plate:       params.plate.toUpperCase(),
      model:       params.model,
      terminal:    params.terminal,
      checkIn:     params.checkIn,
      checkOut:    params.checkOut,
      status:      params.status,
      price:       params.price,
      notes:       params.notes,
      createdAt:   new Date().toISOString(),
    };
  }

  const plate = params.plate.toUpperCase();

  // 1. Cliente: reutilizar si ya existe el mismo teléfono
  let cliente = await db.clientes.findFirst({ where: { movil: params.phone } });
  if (!cliente) {
    cliente = await db.clientes.create({
      data: {
        nombre_completo: params.name,
        movil:           params.phone,
        correo:          params.email,
        created_at:      new Date(),
        updated_at:      new Date(),
      },
    });
  }

  // 2. Coche: reutilizar si ya existe esa matrícula activa
  const parts  = params.model.trim().split(/\s+/);
  const marca  = parts.length > 1 ? parts[0] : params.model;
  const modelo = parts.length > 1 ? parts.slice(1).join(" ") : null;

  let coche = await db.coches.findFirst({
    where: { matricula: plate, estatus_coche: 1 },
  });
  if (!coche) {
    coche = await db.coches.create({
      data: {
        id_cliente:   cliente.id,
        matricula:    plate,
        marca,
        modelo,
        color:        "",
        created_at:   new Date(),
        updated_at:   new Date(),
      },
    });
  }

  // 3. nro_reserva: último + incremento aleatorio 1–20 (igual que el dashboard)
  const ultima = await db.reservas.findFirst({
    orderBy: { id: "desc" },
    select:  { nro_reserva: true },
  });
  const nroReserva = (ultima?.nro_reserva ?? 10000) + Math.floor(Math.random() * 20) + 1;

  // 4. tipo_pago por defecto (primer activo; si la tabla está vacía, lo crea)
  let tipoPago = await db.tipo_pago.findFirst({ where: { estatus: 1 } });
  if (!tipoPago) tipoPago = await db.tipo_pago.findFirst();
  if (!tipoPago) {
    tipoPago = await db.tipo_pago.create({
      data: { descripcion: "Efectivo", estatus: 1 },
    });
  }
  const idTipoPago = tipoPago.id;

  // 5. Fechas
  const checkInDate  = new Date(params.checkIn);
  const checkOutDate = new Date(params.checkOut);

  // 6. Observaciones con prefijo de tipo de vehículo
  const observaciones = `[${params.vehicleType}] ${params.notes}`;

  // 7. Crear reserva
  const reserva = await db.reservas.create({
    data: {
      nro_reserva:            nroReserva,
      fecha_entrada:          checkInDate,
      hora_entrada:           checkInDate,
      fecha_entrada_completa: checkInDate,
      fecha_salida:           checkOutDate,
      hora_salida:            checkOutDate,
      fecha_salida_completa:  checkOutDate,
      id_cliente:             cliente.id,
      id_coche:               coche.id,
      terminal_entrada:       params.terminal,
      terminal_salida:        params.terminal,
      observaciones,
      monto_total:            params.price,
      monto_factura:          params.price / 1.21,
      monto_impuestos:        (params.price / 1.21) * 0.21,
      costo_servicios:        params.price,
      costo_servicios_extra:  0,
      estatus:                STATUS_TO_ESTATUS[params.status],
      medio_reserva:          MEDIO_WEB,
      id_tipo_pago:           idTipoPago,
      // Campos de cupón (mismas columnas que usa parkingplus):
      // monto_des es Int en la BD, así que el importe exacto va también en observaciones
      descuento:              params.cupon ? "SI" : "NO",
      ...(params.cupon ? {
        cupon:           params.cupon.codigo,
        porcentaje_cupo: params.cupon.tipo === "porcentaje" ? params.cupon.valor : null,
        monto_des:       Math.round(params.cupon.descuento),
      } : {}),
      condiciones:            1,
      cod_valid:              "0",
      canceled_by:            0,
      factura:                0,
      cod_postal:             "",
      created_at:             new Date(),
      updated_at:             new Date(),
    },
  });

  return {
    id:          reserva.id.toString(),
    name:        cliente.nombre_completo,
    phone:       cliente.movil,
    email:       cliente.correo,
    vehicleType: params.vehicleType,
    plate,
    model:       params.model,
    terminal:    params.terminal,
    checkIn:     params.checkIn,
    checkOut:    params.checkOut,
    status:      params.status,
    price:       params.price,
    notes:       params.notes,
    createdAt:   reserva.created_at?.toISOString() ?? new Date().toISOString(),
  };
}

/**
 * Actualiza los campos de una reserva existente.
 * Modifica reservas, clientes y/o coches según qué campos cambien.
 */
export async function updateReservationById(
  id: string,
  changes: Partial<ReservaAdmin>,
): Promise<ReservaAdmin> {
  const db = await getPrisma();
  if (!db) throw new Error("Base de datos no configurada");

  const numId = parseInt(id, 10);

  // Cargar reserva actual (necesitamos id_cliente, id_coche y observaciones)
  const current = await db.reservas.findUnique({
    where: { id: numId },
    include: {
      clientes: true,
      coches:   true,
    },
  });
  if (!current) throw new Error(`Reserva ${id} no encontrada`);

  const promises: Promise<unknown>[] = [];

  // — Actualizar reservas ────────────────────────────────────────────────────
  const resUpdate: Record<string, unknown> = { updated_at: new Date() };
  if (changes.status      !== undefined) resUpdate.estatus       = STATUS_TO_ESTATUS[changes.status];
  if (changes.price       !== undefined) {
    resUpdate.monto_total     = changes.price;
    resUpdate.monto_factura   = changes.price / 1.21;
    resUpdate.monto_impuestos = (changes.price / 1.21) * 0.21;
    resUpdate.costo_servicios = changes.price;
  }
  if (changes.terminal !== undefined) {
    resUpdate.terminal_entrada = changes.terminal;
    resUpdate.terminal_salida  = changes.terminal;
  }
  if (changes.checkIn !== undefined) {
    const d = new Date(changes.checkIn);
    resUpdate.fecha_entrada          = d;
    resUpdate.hora_entrada           = d;
    resUpdate.fecha_entrada_completa = d;
  }
  if (changes.checkOut !== undefined) {
    const d = new Date(changes.checkOut);
    resUpdate.fecha_salida          = d;
    resUpdate.hora_salida           = d;
    resUpdate.fecha_salida_completa = d;
  }
  if (changes.notes !== undefined || changes.vehicleType !== undefined) {
    const prevType  = extractVehicleType(current.observaciones);
    const prevNotes = cleanNotes(current.observaciones);
    const newType   = changes.vehicleType ?? prevType;
    const newNotes  = changes.notes       ?? prevNotes;
    resUpdate.observaciones = `[${newType}] ${newNotes}`;
  }

  promises.push(db.reservas.update({ where: { id: numId }, data: resUpdate }));

  // — Actualizar clientes ────────────────────────────────────────────────────
  const cliUpdate: Record<string, unknown> = { updated_at: new Date() };
  if (changes.name  !== undefined) cliUpdate.nombre_completo = changes.name;
  if (changes.email !== undefined) cliUpdate.correo          = changes.email;
  if (changes.phone !== undefined) cliUpdate.movil           = changes.phone;
  if (Object.keys(cliUpdate).length > 1) {
    promises.push(db.clientes.update({ where: { id: current.id_cliente }, data: cliUpdate }));
  }

  // — Actualizar coches ──────────────────────────────────────────────────────
  if (current.id_coche && (changes.plate !== undefined || changes.model !== undefined)) {
    const cocheUpdate: Record<string, unknown> = { updated_at: new Date() };
    if (changes.plate !== undefined) cocheUpdate.matricula = changes.plate.toUpperCase();
    if (changes.model !== undefined) {
      const parts         = changes.model.trim().split(/\s+/);
      cocheUpdate.marca   = parts.length > 1 ? parts[0] : changes.model;
      cocheUpdate.modelo  = parts.length > 1 ? parts.slice(1).join(" ") : null;
    }
    promises.push(db.coches.update({ where: { id: current.id_coche }, data: cocheUpdate }));
  }

  await Promise.all(promises);

  // Combinar estado actual + cambios para devolver el objeto actualizado
  const prev: ReservaAdmin = {
    id,
    name:        current.clientes?.nombre_completo ?? "—",
    phone:       current.clientes?.movil           ?? "—",
    email:       current.clientes?.correo          ?? "—",
    vehicleType: extractVehicleType(current.observaciones),
    plate:       current.coches?.matricula         ?? "—",
    model:       [current.coches?.marca, current.coches?.modelo].filter(Boolean).join(" ") || "—",
    terminal:    current.terminal_entrada as Terminal,
    checkIn:     toLocalISO(current.fecha_entrada_completa),
    checkOut:    toLocalISO(current.fecha_salida_completa),
    status:      ESTATUS_TO_STATUS[current.estatus] ?? "confirmed",
    price:       Number(current.monto_total),
    notes:       cleanNotes(current.observaciones),
    createdAt:   current.created_at?.toISOString() ?? new Date().toISOString(),
  };

  const updated = { ...prev, ...changes, id } as ReservaAdmin;
  if (updated.plate) updated.plate = updated.plate.toUpperCase();
  return updated;
}

/** Elimina una reserva por id. */
export async function deleteReservationById(id: string): Promise<void> {
  const db = await getPrisma();
  if (!db) return;
  await db.reservas.delete({ where: { id: parseInt(id, 10) } });
}

// ── Config (guardada en archivo local) ────────────────────────────────────────

export async function getConfig(): Promise<AdminConfig> {
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(await fs.readFile(CFG_FILE, "utf8")) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(cfg: AdminConfig): Promise<void> {
  await ensureDir();
  await fs.writeFile(CFG_FILE, JSON.stringify(cfg, null, 2), "utf8");
}

// ── Precios base editables (registro_precios + servicios id=4) ─────────────────
//
// El precio del parking sale de `registro_precios` (una fila por nº de días) y
// el seguro de `servicios` id=4. Aquí se leen como 3 parámetros editables y se
// pueden regenerar desde el panel. Esta landing es la ÚNICA dueña de la BD, así
// que regenerar la tabla no entra en conflicto con ningún otro sistema.

export interface PricingParams {
  basePrice:      number; // base/plan de la reserva (día 1 = base + dayPrice)
  dayPrice:       number; // coste por día
  insurancePrice: number; // seguro (servicios id=4)
}

/** Valores por defecto (coinciden con la BD actual) */
export const DEFAULT_PRICING: PricingParams = { basePrice: 19.98, dayPrice: 6, insurancePrice: 1.98 };

/** Cap de estancia larga: a partir de este nº de días el precio del parking es plano */
export const DIAS_CAP = 18;

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Lee los precios base derivándolos de registro_precios + servicios id=4 */
export async function getPricingParams(): Promise<PricingParams> {
  const db = await getPrisma();
  if (!db) return { ...DEFAULT_PRICING };
  try {
    const [f1, f2, seguro] = await Promise.all([
      db.registro_precios.findFirst({ where: { cantidad: 1 }, orderBy: { id: "asc" } }),
      db.registro_precios.findFirst({ where: { cantidad: 2 }, orderBy: { id: "asc" } }),
      db.servicios.findFirst({ where: { id: 4 }, select: { costo: true } }),
    ]);
    const dayPrice  = f1 && f2 ? Number(f2.costo) - Number(f1.costo) : DEFAULT_PRICING.dayPrice;
    const basePrice = f1 ? Number(f1.costo) - dayPrice : DEFAULT_PRICING.basePrice;
    const insurancePrice = seguro ? Number(seguro.costo) : DEFAULT_PRICING.insurancePrice;
    return { basePrice: r2(basePrice), dayPrice: r2(dayPrice), insurancePrice: r2(insurancePrice) };
  } catch {
    return { ...DEFAULT_PRICING };
  }
}

/**
 * Regenera `registro_precios` (filas 1..30, id_lista=1) con costo = base + día×N
 * hasta DIAS_CAP y plano después, y actualiza el seguro (servicios id=4).
 * Todo en una transacción. La lógica de lectura (lib/precio-db.ts) queda intacta.
 */
export async function savePricingParams(p: PricingParams): Promise<PricingParams> {
  const db = await getPrisma();
  const base   = Number(p.basePrice)      || 0;
  const dia    = Number(p.dayPrice)       || 0;
  const seguro = Number(p.insurancePrice) || 0;
  if (!db) return { basePrice: base, dayPrice: dia, insurancePrice: seguro };

  const costoDe = (n: number) => r2(base + dia * Math.min(n, DIAS_CAP));

  const filas = await db.registro_precios.findMany({ where: { id_lista: 1 }, select: { cantidad: true } });
  const existentes = new Set(filas.map((f) => f.cantidad));

  const ops = [];
  for (let n = 1; n <= 30; n++) {
    if (existentes.has(n)) {
      ops.push(db.registro_precios.updateMany({ where: { id_lista: 1, cantidad: n }, data: { costo: costoDe(n) } }));
    } else {
      ops.push(db.registro_precios.create({ data: { id_lista: 1, cantidad: n, costo: costoDe(n) } }));
    }
  }
  ops.push(db.servicios.updateMany({ where: { id: 4 }, data: { costo: seguro } }));
  await db.$transaction(ops);

  return { basePrice: base, dayPrice: dia, insurancePrice: seguro };
}

// ── Datos de demostración (fallback sin DATABASE_URL) ─────────────────────────

function fmtLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Estimación SOLO para los datos demo (sin BD). Usa los mismos valores por
// defecto y el cap de estancia larga que el cálculo real.
function estimarPrecioDemo(type: VehicleType, checkIn: string, checkOut: string): number {
  const dias    = calculateRawParkingDays(new Date(checkIn), new Date(checkOut));
  const parking = DEFAULT_PRICING.basePrice + DEFAULT_PRICING.dayPrice * Math.min(dias, DIAS_CAP);
  const recargo = type === "autocaravana" ? DEFAULT_CONFIG.autocaravanaSurcharge * dias : 0;
  return Math.round((parking + DEFAULT_PRICING.insurancePrice + recargo) * 100) / 100;
}

export function buildDemo(): ReservaAdmin[] {
  const mk = (
    offIn: number, offOut: number, status: ReservaStatus, type: VehicleType,
    terminal: Terminal, name: string, phone: string, email: string,
    plate: string, model: string,
  ): ReservaAdmin => {
    const ci = new Date(); ci.setDate(ci.getDate() + offIn); ci.setHours(9, 0, 0, 0);
    const co = new Date(); co.setDate(co.getDate() + offOut); co.setHours(18, 0, 0, 0);
    const checkIn = fmtLocal(ci); const checkOut = fmtLocal(co);
    return {
      id: genId(), name, phone, email, plate: plate.toUpperCase(), model,
      vehicleType: type, terminal, checkIn, checkOut, status,
      price: estimarPrecioDemo(type, checkIn, checkOut),
      notes: "", createdAt: new Date().toISOString(),
    };
  };

  return [
    mk(0,  5,  "inside",    "car",  "T4", "Carlos Martínez Ruiz",   "+34 678 123 456", "carlos@gmail.com",      "1234ABC", "Toyota Corolla"),
    mk(0,  3,  "inside",    "autocaravana", "T2", "Ana López Pérez",        "+34 612 234 567", "ana@outlook.com",       "5678DEF", "Fiat Ducato Camper"),
    mk(0,  7,  "confirmed", "car",  "T1", "Pedro Sánchez García",   "+34 645 345 678", "pedro@gmail.com",       "9012GHI", "Volkswagen Golf"),
    mk(0,  2,  "confirmed", "car",  "T3", "Laura Fernández Costa",  "+34 699 456 789", "laura@hotmail.com",     "3456JKL", "BMW Serie 3"),
    mk(1,  6,  "confirmed", "car",  "T4", "Miguel Torres Alba",     "+34 677 567 890", "miguel@empresa.com",    "7890MNO", "Seat León"),
    mk(1,  4,  "confirmed", "autocaravana", "T1", "Sara González Ruiz",     "+34 654 678 901", "sara@gmail.com",        "1234PQR", "Volkswagen California"),
    mk(-1, 2,  "inside",    "car",  "T2", "Javier Ramírez López",   "+34 688 789 012", "javier@correo.com",     "5678STU", "Ford Focus"),
    mk(-3, -1, "finished",  "car",  "T3", "María Blanco Díaz",      "+34 611 890 123", "maria@gmail.com",       "9012VWX", "Kia Sportage"),
    mk(-5, -2, "finished",  "autocaravana", "T4", "Roberto Moreno Cano",    "+34 622 901 234", "roberto@gmail.com",     "3456YZA", "Mercedes Marco Polo"),
    mk(-2, -1, "cancelled", "car",  "T1", "Elena Jiménez Vega",     "+34 633 012 345", "elena@outlook.com",     "7890BCD", "Renault Clio"),
    mk(2,  8,  "confirmed", "car",  "T2", "Francisco Navarro Rojo", "+34 644 123 456", "francisco@hotmail.com", "1234EFG", "Peugeot 308"),
    mk(3,  10, "confirmed", "car",  "T4", "Isabel Castro Fuentes",  "+34 655 234 567", "isabel@gmail.com",      "5678HIJ", "Nissan Qashqai"),
  ];
}
