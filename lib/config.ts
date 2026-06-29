/**
 * ============================================================
 *  CONFIGURACIÓN DEL NEGOCIO
 *  ➜ El programador debe actualizar estos datos antes de
 *    publicar la página.
 * ============================================================
 */

export const NEGOCIO = {
  nombre: "Parking Aero Madrid",

  // ⚠️ CAMBIAR: razón social y NIF reales del negocio
  razonSocial: "Parking Aero Madrid S.L.",
  nif: "B00000000",

  // email del dueño del parking (recibe las reservas)
  emailDueno: "parkingaeromadrid@gmail.com",

  // teléfono de contacto real
  telefono: "+34 632 868 936",
  telefonoHref: "tel:+34632868936",

  // WhatsApp real (formato internacional sin espacios)
  whatsappHref: "https://wa.me/34632868936",

  // email público de atención al cliente
  emailContacto: "parkingaeromadrid@gmail.com",

  // ⚠️ CAMBIAR: dirección real del parking
  direccion: "Av. de la Hispanidad, s/n · 28042 Madrid (junto a Aeropuerto Madrid-Barajas)",

  horario: "Abierto 24 horas · 365 días al año",
} as const;

/** Terminales disponibles del Aeropuerto Madrid-Barajas */
export const TERMINALES = ["T1", "T2", "T3", "T4"] as const;
/** Opción para viajeros que aún no conocen su terminal */
export const SIN_TERMINAL = "No sé la terminal" as const;
/** Opciones de los selects de terminal en la landing */
export const OPCIONES_TERMINAL = [...TERMINALES, SIN_TERMINAL] as const;
export type Terminal = (typeof OPCIONES_TERMINAL)[number];
