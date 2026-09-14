/**
 * ============================================================
 *  CONFIGURACIÓN DEL NEGOCIO
 *  ➜ El programador debe actualizar estos datos antes de
 *    publicar la página.
 * ============================================================
 */

export const NEGOCIO = {
  nombre: "Parking Aero Madrid",

  // Aero Madrid no tiene identidad fiscal propia (confirmado 2026-09-04):
  // esta web solo capta clientes, el servicio lo presta y factura Parking
  // Plus bajo esta entidad real (ver también aviso-legal/page.tsx).
  razonSocial: "MARICHAL 4 PARKING SL",
  nif: "B88537345",

  // email del dueño del parking (recibe las reservas)
  emailDueno: "parkingaeromadrid@gmail.com",

  // teléfono de contacto real
  telefono: "+34 632 868 936",
  telefonoHref: "tel:+34632868936",

  // WhatsApp real (formato internacional sin espacios) con mensaje predefinido
  whatsappHref: "https://wa.me/34632868936?text=" + encodeURIComponent("Hola, necesito información para el parking del aeropuerto de Madrid."),

  // email público de atención al cliente
  emailContacto: "parkingaeromadrid@gmail.com",

  // ⚠️ CAMBIAR: dirección real del parking. Antes tenía un valor de ejemplo
  // ("Av. de la Hispanidad, s/n") que nunca se reemplazó y quedó publicado
  // como si fuera real (aviso legal + JSON-LD de Google) — se quitó el
  // 2026-09-04. No poner nada aquí hasta tener la dirección física real.
  direccion: "",

  horario: "Abierto 24 horas · 365 días al año",
} as const;

/** Terminales disponibles del Aeropuerto Madrid-Barajas */
export const TERMINALES = ["T1", "T2", "T3", "T4"] as const;
/** Opción para viajeros que aún no conocen su terminal (mismo texto que el resto de proyectos) */
export const SIN_TERMINAL = "No conozco la terminal" as const;
/** Opciones de los selects de terminal en la landing */
export const OPCIONES_TERMINAL = [...TERMINALES, SIN_TERMINAL] as const;
export type Terminal = (typeof OPCIONES_TERMINAL)[number];
