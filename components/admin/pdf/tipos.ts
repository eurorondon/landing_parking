/**
 * Tipo compartido por los 3 documentos PDF de planning.
 * Coincide con lo que devuelve GET /api/admin/planning.
 */
export interface ReservaPDF {
  id:               number;
  nro_reserva:      string;   // "12345"
  fecha_entrada:    string;   // "DD/MM/YYYY"
  hora_entrada:     string;   // "HH:MM"
  fecha_salida:     string;
  hora_salida:      string;
  terminal_entrada: string;   // "T1", "T2", etc.
  terminal_salida:  string;
  monto_total:      number;
  pago_confirmado:  number;   // 1 = pagado online
  id_tipo_pago:     number;   // 5 o 7 = pago online
  medio_reserva:    number;   // 1=teléfono, 2=agencia, 3=web
  plan:             number;   // 1=Estándar 2=Premium 3=Priority
  plan_nombre:      string;
  nombre:           string;
  movil:            string;
  matricula:        string;
  marca:            string;
  modelo:           string;
  marcaModelo:      string;   // "MARCA MODELO" en mayúsculas
  servicios:        { nombre_servicio: string; fijo: number }[];
}

/**
 * Abreviatura del terminal: "T1", "T2", "T3", "T4".
 * Cualquier valor sin número («No conozco la terminal», "N/E", vacío…) sale
 * como "T?", que es lo que el conductor interpreta como pendiente de confirmar.
 */
export function abrevTerminal(t: string): string {
  const m = t?.match(/\d+/);
  return m ? `T${m[0]}` : "T?";
}

/** "1" → "T1", etc. (ya viene formateado desde la API) */
export function normalizeTerminal(t: string): string {
  return abrevTerminal(t);
}
