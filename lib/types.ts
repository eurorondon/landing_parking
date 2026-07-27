import type { VehicleType } from "./admin";
import type { Terminal } from "./config";

/** Datos que el usuario elige en el calculador del hero */
export interface DatosReserva {
  vehiculo: VehicleType; // "car" | "autocaravana"
  entryDate: string; // "2026-06-15"
  entryTime: string; // "08:00"
  exitDate: string;
  exitTime: string;
  /** "" hasta que el cliente elige: el select arranca vacío con su placeholder */
  terminalEntrada: Terminal | "";
  terminalSalida: Terminal | "";
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
  /** Servicio de lavado adicional elegido desde ServiciosLimpieza */
  lavadoNombre?: string;
  /**
   * IDs de la tabla `servicios` contratados además del parking (lavados,
   * limpiezas…). Viajan a ParkingPlus para que el sobre imprima "INCLUYE".
   * La nocturnidad y el seguro los deduce el servidor, no hace falta enviarlos.
   */
  servicios?: number[];
  /**
   * true en altas hechas desde el panel: el correo de confirmación
   * no menciona "Autocaravana" (solo modelo y matrícula).
   */
  ocultarAutocaravana?: boolean;
  /** Código promocional introducido (el servidor lo revalida y recalcula) */
  cuponCodigo?: string;
  /** Total antes del descuento; el servidor calcula el descuento sobre él */
  totalSinDescuento?: number;
  /** Importe descontado en € (informativo, para correos y desglose) */
  cuponDescuento?: number;
}
