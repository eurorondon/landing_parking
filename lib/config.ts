/**
 * ============================================================
 *  CONFIGURACIÓN DEL NEGOCIO
 *  ➜ El programador debe actualizar estos datos antes de
 *    publicar la página.
 * ============================================================
 */

export const NEGOCIO = {
  nombre: "Parking Aéreo Madrid",

  // ⚠️ CAMBIAR: email del dueño del parking (recibe las reservas)
  emailDueno: "dueno@parkingaereomadrid.es",

  // ⚠️ CAMBIAR: teléfono de contacto real
  telefono: "+34 600 000 000",
  telefonoHref: "tel:+34600000000",

  // ⚠️ CAMBIAR: WhatsApp real (formato internacional sin espacios)
  whatsappHref: "https://wa.me/34600000000",

  // ⚠️ CAMBIAR: email público de atención al cliente
  emailContacto: "info@parkingaereomadrid.es",

  // ⚠️ CAMBIAR: dirección real del parking
  direccion: "Av. de la Hispanidad, s/n · 28042 Madrid (junto a Aeropuerto Madrid-Barajas)",

  horario: "Abierto 24 horas · 365 días al año",
} as const;

/** Terminales disponibles del Aeropuerto Madrid-Barajas */
export const TERMINALES = ["T1", "T2", "T3", "T4"] as const;
export type Terminal = (typeof TERMINALES)[number];
