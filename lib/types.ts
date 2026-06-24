import type { VehicleType } from "./admin";
import type { Terminal } from "./config";

/** Datos que el usuario elige en el calculador del hero */
export interface DatosReserva {
  vehiculo: VehicleType; // "car" | "moto"
  entryDate: string; // "2026-06-15"
  entryTime: string; // "08:00"
  exitDate: string;
  exitTime: string;
  terminalEntrada: Terminal;
  terminalSalida: Terminal;
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
  vehiculo: VehicleType;
  entrada: string; // "2026-06-15T08:00"
  salida: string;
  terminalEntrada: Terminal;
  terminalSalida: Terminal;
  dias: number;
  total: number;
  /** Plan seleccionado (1=Estándar, 2=Premium, 3=Priority, 4=Económico) */
  plan?: number;
  planNombre?: string;
}
