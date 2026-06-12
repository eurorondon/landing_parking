import type { Terminal } from "./config";

/**
 * Tipos y utilidades compartidas del panel de administración.
 * (Se usan tanto en el cliente como en las API del servidor.)
 */

export type VehicleType = "car" | "moto";
export type ReservaStatus = "pending" | "confirmed" | "inside" | "finished" | "cancelled";

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
  minDays: number;
  minPrice: number;
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
  minDays: 1,
  minPrice: 15,
  terminalSurcharge: false,
  terminalSurchargeAmt: 2,
  businessName: "Parking Aéreo Madrid",
  ownerEmail: "admin@parkingaereomadrid.com",
  ownerPhone: "+34 91 000 0000",
};

export const STATUS_LABEL: Record<ReservaStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  inside: "Vehículo dentro",
  finished: "Finalizada",
  cancelled: "Cancelada",
};

export const STATUS_CLASS: Record<ReservaStatus, string> = {
  pending: "badge-pending",
  confirmed: "badge-confirmed",
  inside: "badge-inside",
  finished: "badge-finished",
  cancelled: "badge-cancelled",
};

/** Precio según la configuración del panel (tarifa por día y tipo de vehículo) */
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
  return Math.max(cfg.minPrice, Math.round(days * rate * 100) / 100);
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
