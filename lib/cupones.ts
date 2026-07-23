import { prisma } from "@/lib/prisma";

/**
 * ============================================================
 *  CUPONES DE DESCUENTO — landing_parking
 *
 *  Tabla propia `cupones` (no existe en parkingplus). La usan:
 *    - GET  /api/cupon              → validación desde la web pública
 *    - POST /api/reserva            → revalidación + registro de uso
 *    - /api/admin/cupones[...]      → CRUD desde el panel
 *
 *  El cupón aplicado queda registrado en la reserva:
 *    descuento="SI", cupon, porcentaje_cupo, monto_des.
 * ============================================================
 */

export type TipoCupon = "porcentaje" | "fijo";

export interface CuponValido {
  valido: true;
  id:     number;
  codigo: string;
  tipo:   TipoCupon;
  /** % (tipo porcentaje) o € (tipo fijo) */
  valor:  number;
}

export interface CuponInvalido {
  valido: false;
  /** Mensaje apto para mostrar al cliente */
  motivo: string;
}

export type ResultadoCupon = CuponValido | CuponInvalido;

/** Los códigos se guardan y comparan siempre en mayúsculas sin espacios */
export function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase();
}

/**
 * Comprueba si un código es canjeable ahora mismo: existe, está activo,
 * dentro de fechas (hora del servidor, Europe/Madrid) y con usos disponibles.
 * No registra el uso — eso se hace al confirmar la reserva.
 */
export async function validarCupon(codigoRaw: string): Promise<ResultadoCupon> {
  const codigo = normalizarCodigo(codigoRaw ?? "");
  if (!codigo) return { valido: false, motivo: "Introduce un código." };

  const c = await prisma.cupones.findUnique({ where: { codigo } });
  if (!c || !c.activo) return { valido: false, motivo: "El código no es válido." };

  const ahora = new Date();
  if (c.valido_desde && ahora < c.valido_desde) {
    return { valido: false, motivo: "Este código aún no está activo." };
  }
  if (c.valido_hasta && ahora > c.valido_hasta) {
    return { valido: false, motivo: "Este código ha caducado." };
  }
  if (c.max_usos !== null && c.usos >= c.max_usos) {
    return { valido: false, motivo: "Este código ya no está disponible." };
  }

  return {
    valido: true,
    id:     c.id,
    codigo: c.codigo,
    tipo:   c.tipo === "fijo" ? "fijo" : "porcentaje",
    valor:  Number(c.valor),
  };
}

/**
 * Importe a descontar sobre un total, redondeado a céntimos y
 * nunca mayor que el propio total.
 */
export function calcularDescuento(total: number, tipo: TipoCupon, valor: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  const bruto = tipo === "porcentaje" ? (total * valor) / 100 : valor;
  return Math.min(Math.round(bruto * 100) / 100, total);
}

/**
 * "YYYY-MM-DD" (formulario del admin) → Date a las 00:00:00 o 23:59:59
 * según sea inicio o fin de vigencia. Hora local del servidor (Europe/Madrid).
 */
export function parseFechaCupon(valor: string | null | undefined, finDeDia: boolean): Date | null {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  return new Date(`${valor}T${finDeDia ? "23:59:59" : "00:00:00"}`);
}

/** Body que envía el formulario de cupones del panel */
export interface CuponPayload {
  codigo?:      string;
  tipo?:        string;
  valor?:       number;
  validoDesde?: string | null;
  validoHasta?: string | null;
  maxUsos?:     number | null;
  campana?:     string | null;
  activo?:      boolean;
}

/** Suma un uso al cupón (llamar solo cuando la reserva ya está creada) */
export async function registrarUsoCupon(codigo: string): Promise<void> {
  await prisma.cupones.update({
    where: { codigo: normalizarCodigo(codigo) },
    data:  { usos: { increment: 1 }, updated_at: new Date() },
  });
}
