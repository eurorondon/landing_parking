import type { Terminal } from "./config";

/**
 * Tipos y utilidades compartidas del panel de administración.
 * (Se usan tanto en el cliente como en las API del servidor.)
 */

export type VehicleType = "car" | "moto";
/**
 * Flujo de estados: la reserva entra confirmada por email al reservar y
 * se muestra como "Pendiente" (a la espera del vehículo) → "Activa"
 * (vehículo dentro) → "Finalizada".
 */
export type ReservaStatus = "confirmed" | "inside" | "finished" | "cancelled";

export interface ReservaAdmin {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: VehicleType;
  plate: string;
  model: string;
  terminal: Terminal;
  checkIn: string; // "2026-07-01T09:00"
  checkOut: string;
  status: ReservaStatus;
  price: number;
  notes: string;
  createdAt: string; // ISO
}

export interface AdminConfig {
  carPrice: number;
  motoPrice: number;
  valetPrice: number;     // suplemento fijo por servicio de valet (€/reserva)
  insurancePrice: number; // suplemento fijo por seguro (€/reserva)
  minDays: number;
  terminalSurcharge: boolean;
  terminalSurchargeAmt: number;
  businessName: string;
  ownerEmail: string;
  ownerPhone: string;
}

/** ⚠️ CAMBIAR: valores por defecto de la configuración del negocio */
export const DEFAULT_CONFIG: AdminConfig = {
  carPrice: 8.9,
  motoPrice: 4.5,
  valetPrice: 10,
  insurancePrice: 5,
  minDays: 1,
  terminalSurcharge: false,
  terminalSurchargeAmt: 2,
  businessName: "Parking Aéreo Madrid",
  ownerEmail: "admin@parkingaereomadrid.com",
  ownerPhone: "+34 91 000 0000",
};

export const STATUS_LABEL: Record<ReservaStatus, string> = {
  confirmed: "Pendiente",
  inside: "Activa",
  finished: "Finalizada",
  cancelled: "Cancelada",
};

export const STATUS_CLASS: Record<ReservaStatus, string> = {
  confirmed: "badge-pending",
  inside: "badge-inside",
  finished: "badge-finished",
  cancelled: "badge-cancelled",
};

/**
 * Precio según la configuración del panel: días × tarifa (coche o moto)
 * más los suplementos fijos de valet y seguro de cada reserva.
 *
 * Los días se calculan con las horas reales y todo día empezado se
 * cobra completo (26 horas → 2 días). El precio mínimo de una reserva
 * es, por tanto: 1 día + valet + seguro.
 */
export function calcAdminPrice(
  cfg: AdminConfig,
  type: VehicleType,
  checkIn: string,
  checkOut: string
): number {
  if (!checkIn || !checkOut) return 0;
  const d1 = new Date(checkIn).getTime();
  const d2 = new Date(checkOut).getTime();
  if (!Number.isFinite(d1) || !Number.isFinite(d2) || d2 <= d1) return 0;
  const days = Math.max(cfg.minDays, Math.ceil((d2 - d1) / 86400000));
  const rate = type === "car" ? cfg.carPrice : cfg.motoPrice;
  const total = days * rate + (cfg.valetPrice || 0) + (cfg.insurancePrice || 0);
  return Math.round(total * 100) / 100;
}

export function fmtDate(dt: string): string {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(dt: string): string {
  if (!dt) return "—";
  const d = new Date(dt);
  return (
    d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  );
}

export function fmtCurrency(n: number): string {
  return "€" + (Number(n) || 0).toFixed(2);
}

export function isToday(dt: string): boolean {
  if (!dt) return false;
  const d = new Date(dt);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}
