import type { Terminal } from "./config";

/** Datos que el usuario elige en el calculador del hero */
export interface DatosReserva {
  entryDate: string; // "2026-06-15"
  entryTime: string; // "08:00"
  exitDate: string;
  exitTime: string;
  terminal: Terminal;
}

/** Datos personales del formulario del modal */
export interface DatosCliente {
  nombre: string;
  telefono: string;
  email: string;
  matricula: string;
  modelo: string;
}

/** Payload completo que se envía a la API de reservas */
export interface ReservaCompleta extends DatosCliente {
  entrada: string; // "2026-06-15T08:00"
  salida: string;
  terminal: Terminal;
  dias: number;
  total: number;
}
