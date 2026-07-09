import type { Terminal } from "./config";

/**
 * Tipos y utilidades compartidas del panel de administración.
 * (Se usan tanto en el cliente como en las API del servidor.)
 */

export type VehicleType = "car" | "autocaravana";
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
  /**
   * Recargo fijo por día para autocaravana (€/día sobre el precio de coche).
   * Única tarifa configurable desde el panel: el resto del precio (base, €/día
   * y seguro) sale de la BD (registro_precios + servicios), igual para web y panel.
   */
  autocaravanaSurcharge: number;
  businessName: string;
  ownerEmail: string;
  ownerPhone: string;
}

/** ⚠️ CAMBIAR: valores por defecto de la configuración del negocio */
export const DEFAULT_CONFIG: AdminConfig = {
  autocaravanaSurcharge: 2,
  businessName: "Parking Aero Madrid",
  ownerEmail: "admin@parkingaeromadrid.com",
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
