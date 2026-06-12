import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_CONFIG,
  calcAdminPrice,
  type AdminConfig,
  type ReservaAdmin,
  type ReservaStatus,
  type VehicleType,
} from "./admin";
import type { Terminal } from "./config";

/**
 * ============================================================
 *  ALMACÉN DE DATOS (archivos JSON en /data)
 *
 *  Funciona sin instalar nada y es suficiente para un servidor
 *  Node propio (VPS). ⚠️ Para producción en serverless (Vercel)
 *  o con varios usuarios, el programador debe sustituir este
 *  archivo por una base de datos real. Recomendado: Supabase.
 *
 *    CREATE TABLE reservations (
 *      id TEXT PRIMARY KEY,
 *      name TEXT, phone TEXT, email TEXT,
 *      vehicle_type TEXT, plate TEXT, model TEXT,
 *      terminal TEXT, check_in TIMESTAMPTZ,
 *      check_out TIMESTAMPTZ, status TEXT,
 *      price NUMERIC, notes TEXT,
 *      created_at TIMESTAMPTZ DEFAULT NOW()
 *    );
 *
 *  Solo hay que reimplementar las funciones exportadas aquí;
 *  el resto de la app no cambia.
 * ============================================================
 */

const DATA_DIR = path.join(process.cwd(), "data");
const RES_FILE = path.join(DATA_DIR, "reservations.json");
const CFG_FILE = path.join(DATA_DIR, "config.json");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export function genId(): string {
  return (
    "PAM-" +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase()
  );
}

export async function getReservations(seedIfMissing = false): Promise<ReservaAdmin[]> {
  try {
    const arr: ReservaAdmin[] = JSON.parse(await fs.readFile(RES_FILE, "utf8"));
    // Migración: el estado "pending" ya no existe; las reservas antiguas pasan a confirmadas
    return arr.map((r) =>
      String(r.status) === "pending" ? { ...r, status: "confirmed" as const } : r
    );
  } catch {
    // Primera ejecución: el panel se inicializa con datos de demostración
    const demo = seedIfMissing ? buildDemo() : [];
    if (seedIfMissing) await saveReservations(demo);
    return demo;
  }
}

export async function saveReservations(arr: ReservaAdmin[]): Promise<void> {
  await ensureDir();
  await fs.writeFile(RES_FILE, JSON.stringify(arr, null, 2), "utf8");
}

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

/* ── Datos de demostración ── */

function fmtLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function buildDemo(): ReservaAdmin[] {
  const mk = (
    offIn: number,
    offOut: number,
    status: ReservaStatus,
    type: VehicleType,
    terminal: Terminal,
    name: string,
    phone: string,
    email: string,
    plate: string,
    model: string
  ): ReservaAdmin => {
    const ci = new Date();
    ci.setDate(ci.getDate() + offIn);
    ci.setHours(9, 0, 0, 0);
    const co = new Date();
    co.setDate(co.getDate() + offOut);
    co.setHours(18, 0, 0, 0);
    const checkIn = fmtLocal(ci);
    const checkOut = fmtLocal(co);
    return {
      id: genId(),
      name, phone, email,
      plate: plate.toUpperCase(),
      model,
      vehicleType: type,
      terminal, checkIn, checkOut, status,
      price: calcAdminPrice(DEFAULT_CONFIG, type, checkIn, checkOut),
      notes: "",
      createdAt: new Date().toISOString(),
    };
  };

  return [
    mk(0, 5, "inside", "car", "T4", "Carlos Martínez Ruiz", "+34 678 123 456", "carlos@gmail.com", "1234ABC", "Toyota Corolla"),
    mk(0, 3, "inside", "moto", "T2", "Ana López Pérez", "+34 612 234 567", "ana@outlook.com", "5678DEF", "Honda CB500"),
    mk(0, 7, "confirmed", "car", "T1", "Pedro Sánchez García", "+34 645 345 678", "pedro@gmail.com", "9012GHI", "Volkswagen Golf"),
    mk(0, 2, "confirmed", "car", "T3", "Laura Fernández Costa", "+34 699 456 789", "laura@hotmail.com", "3456JKL", "BMW Serie 3"),
    mk(1, 6, "confirmed", "car", "T4", "Miguel Torres Alba", "+34 677 567 890", "miguel@empresa.com", "7890MNO", "Seat León"),
    mk(1, 4, "confirmed", "moto", "T1", "Sara González Ruiz", "+34 654 678 901", "sara@gmail.com", "1234PQR", "Yamaha MT-07"),
    mk(-1, 2, "inside", "car", "T2", "Javier Ramírez López", "+34 688 789 012", "javier@correo.com", "5678STU", "Ford Focus"),
    mk(-3, -1, "finished", "car", "T3", "María Blanco Díaz", "+34 611 890 123", "maria@gmail.com", "9012VWX", "Kia Sportage"),
    mk(-5, -2, "finished", "moto", "T4", "Roberto Moreno Cano", "+34 622 901 234", "roberto@gmail.com", "3456YZA", "Kawasaki Z650"),
    mk(-2, -1, "cancelled", "car", "T1", "Elena Jiménez Vega", "+34 633 012 345", "elena@outlook.com", "7890BCD", "Renault Clio"),
    mk(2, 8, "confirmed", "car", "T2", "Francisco Navarro Rojo", "+34 644 123 456", "francisco@hotmail.com", "1234EFG", "Peugeot 308"),
    mk(3, 10, "confirmed", "car", "T4", "Isabel Castro Fuentes", "+34 655 234 567", "isabel@gmail.com", "5678HIJ", "Nissan Qashqai"),
  ];
}
