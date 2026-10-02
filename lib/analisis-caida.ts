/**
 * Contenido estático del informe «Análisis de la caída de reservas» (panel /admin → Análisis).
 *
 * Las reservas por día/semana del gráfico se calculan EN VIVO desde la BD; lo de este
 * fichero es una FOTO de datos externos (Google Analytics, Google Ads, historial de código)
 * tomada el 2 de octubre de 2026. Si se actualiza el informe, editar aquí.
 */

/** Fecha de la foto de Analytics/Ads (YYYY-MM-DD) */
export const FECHA_CORTE = "2026-10-02";

/** Primer día del gráfico (lunes completo, tras el arranque de la web) */
export const GRAFICO_INICIO = "2026-07-20";

/** Periodo «normal» de referencia: del 3 ago al 13 sept */
export const BASE_INICIO = "2026-08-03";

/** Día en que empieza el escalón a la baja (rediseño del hero) */
export const PIVOTE = "2026-09-14";

export type TipoEvento = "sitio" | "ads" | "incidencia";

export const TIPO_LABEL: Record<TipoEvento, string> = {
  sitio:      "Cambio en la web",
  ads:        "Cambio en Google Ads",
  incidencia: "Incidencia",
};

export const TIPO_COLOR: Record<TipoEvento, string> = {
  sitio:      "#2a6a84",
  ads:        "#e8853d",
  incidencia: "#ef4444",
};

export interface EventoCaida {
  id: number;
  fecha: string; // YYYY-MM-DD
  tipo: TipoEvento;
  titulo: string;
  detalle: string;
}

export const EVENTOS: EventoCaida[] = [
  {
    id: 1, fecha: "2026-08-16", tipo: "incidencia",
    titulo: "Hueco en el registro (15–16 ago)",
    detalle: "Casi sin visitas y 0 reservas el 16 de agosto; el 17 se registran 23. Pudo ser una caída del sitio o del seguimiento. No investigado.",
  },
  {
    id: 2, fecha: "2026-09-14", tipo: "sitio",
    titulo: "Rediseño del hero y precio «desde»",
    detalle: "Nuevo hero con tarjeta «DESDE X €» y nuevo cálculo del recargo de temporada. Sin temporadas activas el cálculo da lo mismo que antes. El día 15 solo hay 1 reserva.",
  },
  {
    id: 3, fecha: "2026-09-15", tipo: "incidencia",
    titulo: "Android sin acceso al sitio (HTTP/3 · QUIC)",
    detalle: "Entre el 14 y el 15 de septiembre varios Android no podían abrir el sitio (ERR_QUIC_PROTOCOL_ERROR, CONNECTION_REFUSED/ABORTED), con operadoras distintas. En iPhone funcionaba siempre. Se desactiva HTTP/3 en Cloudflare el 15 y los Android vuelven a cargar. Ver docs/diagnostico-caidas-reportadas.md.",
  },
  {
    id: 4, fecha: "2026-09-16", tipo: "incidencia",
    titulo: "Android con datos móviles: error de ECH",
    detalle: "El 16 el panel falla en Android con datos móviles (con WiFi carga) y otro teléfono da ERR_ECH_FALLBACK_CERTIFICATE_INVALID. Se desactiva el ECH de Cloudflare esa noche; falta confirmar que ya carga con datos móviles.",
  },
  {
    id: 5, fecha: "2026-09-18", tipo: "ads",
    titulo: "≈9 palabras clave pausadas",
    detalle: "Madrugada del 18 (2:23–2:41). Eran de muy poco gasto; las que más convierten siguen activas.",
  },
  {
    id: 6, fecha: "2026-09-21", tipo: "ads",
    titulo: "Otra palabra clave de frase pausada",
    detalle: "Pausa de una palabra clave de concordancia de frase en la campaña principal.",
  },
  {
    id: 7, fecha: "2026-09-22", tipo: "ads",
    titulo: "Performance Max pausada",
    detalle: "Pausada desde la app móvil de Google Ads. En agosto aportó ≈26 reservas por 416 €. Desde entonces casi no genera clics ni conversiones.",
  },
  {
    id: 8, fecha: "2026-09-27", tipo: "sitio",
    titulo: "Hero sin tarjeta de precio + mejoras de rendimiento",
    detalle: "Se quita la tarjeta «DESDE X €», se optimiza la imagen del hero y las fuentes. No se ve recuperación posterior.",
  },
  {
    id: 9, fecha: "2026-09-29", tipo: "ads",
    titulo: "Otra palabra clave exacta pausada",
    detalle: "Pausa de una palabra clave de concordancia exacta en la campaña principal.",
  },
  {
    id: 10, fecha: "2026-10-01", tipo: "ads",
    titulo: "Campaña «29 de septiembre» pausada",
    detalle: "La campaña nueva «29 de septiembre intención alta» gastó 14,57 € en 9 clics (CPC 1,62 €) sin conversiones y se pausa.",
  },
  {
    id: 11, fecha: "2026-10-02", tipo: "ads",
    titulo: "Cambios de anuncios, URLs finales y palabras clave",
    detalle: "Ediciones manuales en la campaña principal (anuncio adaptable, 2 URLs finales, palabras clave). Los datos de hoy aún no reflejan una situación estable.",
  },
];

/* ─────────────────────────────────────────────────────────────
   Pasos de la explicación
   ───────────────────────────────────────────────────────────── */

export interface TablaInforme {
  cabecera: string[];
  filas: string[][];
}

export interface PasoInforme {
  titulo: string;
  /** Párrafos de texto (admite **negrita**) */
  texto: string[];
  tabla?: TablaInforme;
  /** Cautela o limitación del paso */
  nota?: string;
}

export const PASOS: PasoInforme[] = [
  {
    titulo: "El escalón empieza el 14–15 de septiembre",
    texto: [
      "Del 3 de agosto al 13 de septiembre entraban unas **7 reservas web al día**. Desde el 14 de septiembre bajan a **unas 3,5 al día**, y en la última semana a ~2,4. Los euros por semana caen más de la mitad.",
      "El ticket medio no cambia (≈56–63 € por reserva): entran menos reservas, no más baratas.",
      "El escalón empieza **antes** de los cambios en Google Ads (palabras clave el 18, Performance Max el 22). Esos cambios agravan la caída, pero no la inician.",
      "En esas mismas fechas coinciden dos cosas: el rediseño del hero (14 sept) y el **fallo de acceso en Android** (HTTP/3 el 14–15 y ECH el 16, ver los eventos 3 y 4). El fallo de Android pudo restar reservas esos días; las reservas siguieron bajas después de corregirlo.",
    ],
  },
  {
    titulo: "El tráfico de pago casi no cayó; la conversión sí",
    texto: [
      "Las visitas de pago bajaron solo un 12–16 %, mientras las reservas bajaron ≈50 %. La conversión de visita a reserva pasa de ~13 % a ~7 %.",
      "En Google Analytics, el coste por reserva de la búsqueda de pago sube de ~11 € (agosto) a ~20 € (septiembre) con un gasto parecido.",
    ],
    tabla: {
      cabecera: ["Periodo", "Reservas (Analytics, todos los canales)", "Gasto en Ads", "Coste por reserva"],
      filas: [
        ["Julio", "78", "675 €", "8,7 €"],
        ["Agosto", "163", "1.799 €", "11,0 €"],
        ["Septiembre (+1 oct)", "108", "≈1.820 €", "≈16,9 €"],
      ],
    },
    nota: "Analytics registra solo ~70–75 % de las reservas reales (en septiembre la BD tiene 148 y Analytics 108): sirve para tendencias, no para valores exactos.",
  },
  {
    titulo: "La caída está en el móvil, tanto Android como iPhone",
    texto: [
      "Por dispositivo, los eventos clave por usuario del móvil bajan casi a la mitad (0,18 → 0,10). En escritorio se mantienen.",
      "El fallo de acceso de Cloudflare (HTTP/3 y ECH) solo afectó a Android; en iPhone el sitio cargaba bien. Aun así la conversión en iPhone bajó igual que en Android, así que ese fallo **no basta para explicar** la caída. Sí pudo restar parte en Android: los usuarios de Chrome móvil bajan un 27 % frente a un 18 % en Safari móvil.",
    ],
    tabla: {
      cabecera: ["Dispositivo (1 ago–15 sep → 16 sep–1 oct)", "Usuarios al día", "Eventos clave al día"],
      filas: [
        ["Chrome móvil", "22,5 → 16,4 (−27 %)", "4,3 → 1,9 (−55 %)"],
        ["Safari móvil (iPhone)", "15,4 → 12,6 (−18 %)", "2,5 → 1,0 (−60 %)"],
        ["Todo el móvil", "38,6 → 29,7 (−23 %)", "7,1 → 3,0 (−58 %)"],
        ["Escritorio", "3,1 → 4,0", "0,9 → 1,0"],
      ],
    },
    nota: "«Eventos clave» incluye reservas, clics en teléfono y clics en WhatsApp. Después del 16 sept hay pocos eventos, así que hay ruido estadístico.",
  },
  {
    titulo: "El embudo móvil: menos gente entra por la portada",
    texto: [
      "Las páginas de terminal (T4, T1, T2) mantienen o suben su tráfico. Lo que baja es la **portada** (`/`), a la que apuntan casi todas las palabras clave genéricas y también Performance Max.",
      "De los que llegan, avanza peor el paso `/planes` → `/reservar` (de ~52 % a ~42 %). `/reservar` en sí funciona bien en móvil.",
    ],
    tabla: {
      cabecera: ["Página (móvil, usuarios al día)", "Antes", "Después", "Cambio"],
      filas: [
        ["/ (portada)", "25,5", "13,9", "−46 %"],
        ["/planes", "15,7", "10,6", "−32 %"],
        ["/reservar", "8,1", "4,5", "−44 %"],
        ["Landing T4", "7,7", "7,6", "≈0 %"],
        ["Landing T1", "4,1", "5,4", "+33 %"],
      ],
    },
  },
  {
    titulo: "Google Ads: alcance, coste y conversión empeoran a la vez",
    texto: [
      "Comparando 1 ago–17 sep con 18 sep–2 oct, por día: las impresiones caen un 52 %, los clics un 33 %, el CPC sube un 23 % y la conversión por clic baja un 35 %. El coste por conversión se duplica.",
      "La campaña de búsqueda sigue activa, pero casi todo es concordancia exacta y su cuota de impresiones ronda el 28 %, perdida sobre todo por ranking del anuncio (≈63 %) y no por presupuesto (<10 %).",
    ],
    tabla: {
      cabecera: ["Métrica por día (todas las campañas)", "1 ago–17 sep", "18 sep–2 oct", "Cambio"],
      filas: [
        ["Impresiones", "482", "230", "−52 %"],
        ["Clics", "48,1", "32,4", "−33 %"],
        ["CPC medio", "0,88 €", "1,08 €", "+23 %"],
        ["Gasto", "42,4 €", "34,9 €", "−18 %"],
        ["Conversiones", "3,4", "1,5", "−56 %"],
        ["Conversión por clic", "7,0 %", "4,5 %", "−35 %"],
        ["Coste por conversión", "12,59 €", "23,80 €", "×1,9"],
      ],
    },
    nota: "Google Ads cuenta ~3,4 conversiones al día frente a ~7 reservas reales: el seguimiento ve cerca de la mitad.",
  },
  {
    titulo: "Los términos de búsqueda: mismo tráfico, peor conversión",
    texto: [
      "Las búsquedas que activan los anuncios son las mismas de siempre y están bien relacionadas con el negocio: no hay una oleada de búsquedas irrelevantes. El CTR incluso sube (10 % → 14 %).",
      "Aun así, las mismas palabras convierten peor, sobre todo las de la terminal 4. Eso apunta al otro lado del clic (la web, el precio percibido o la demanda) más que a la calidad del tráfico.",
    ],
    tabla: {
      cabecera: ["Término (concordancia exacta)", "Antes", "Después"],
      filas: [
        ["parking larga estancia t4", "118 clics · 13 conv. · 11 %", "26 clics · 1 conv. · 3,9 %"],
        ["parking t4 barajas", "84 clics · 7 conv. · 8,3 %", "23 clics · 1 conv. · 4,3 %"],
        ["parking aeropuerto madrid t4", "107 clics · 4,7 conv.", "10 clics · 0 conv."],
      ],
    },
    nota: "Muestras pequeñas por término (1–3 conversiones): pesa más el patrón conjunto que cada cifra suelta.",
  },
  {
    titulo: "Lo que se ha descartado",
    texto: [
      "**Fallo de acceso en Android (HTTP/3 el 14–15 sept y ECH el 16):** coincide con el inicio de la caída y pudo restar reservas de Android esos días, pero se corrigió y las reservas siguieron bajas. En iPhone, donde el sitio cargaba bien, la conversión bajó igual. No explica la caída persistente.",
      "**Palabras clave pausadas el 18 de septiembre:** eran de muy poco gasto (menos de 8 € cada una, salvo `\"parking t4 barajas\"`, a 39 € por conversión). Las que más convierten siguen activas.",
      "**Cálculo de precios del 14 de septiembre:** la tabla de temporadas está vacía, así que el recargo es 0 € con el código anterior y con el nuevo. Los totales que ve el cliente no han cambiado.",
      "**Formulario `/reservar` en móvil:** se ve y funciona bien (campos, botón de confirmar, sin elementos flotantes que lo tapen).",
    ],
    tabla: {
      cabecera: ["Días", "Parking", "+ seguro (1,99 €)"],
      filas: [
        ["1", "29,99 €", "31,98 €"],
        ["3", "39,99 €", "41,98 €"],
        ["7", "59,99 €", "61,98 €"],
        ["15", "99,99 €", "101,98 €"],
        ["18 a 30", "114,99 €", "116,98 €"],
      ],
    },
  },
  {
    titulo: "Sospechosos por orden y qué cambiaría primero",
    texto: [
      "**1. Performance Max pausada (22 sept) — certeza alta.** Era la mayor fuente de alcance en la portada. Reactivarla o crear otra equivalente es lo que más reservas recuperaría.",
      "**2. Poca cuota de impresiones en las genéricas — certeza alta.** Se pierde por ranking: subir pujas o mejorar los anuncios de `parking aeropuerto madrid` y similares.",
      "**3. Peor conversión en móvil — certeza media.** Revisar el paso `/planes` → `/reservar` y el aspecto de la portada en móvil.",
      "**4. Rediseño del hero (14 sept) — certeza baja.** Coincide en fechas, pero el camino de reserva no cambió y más gente pasa de la portada a `/planes`. Quitar la tarjeta de precio el 27 no recuperó nada.",
      "**5. Fallo de acceso en Android (14–16 sept) — contribuyó al inicio, no a lo persistente.** Corregido el 15 (HTTP/3) y el 16 (ECH). Pendiente: confirmar que el admin ya entra con datos móviles.",
      "**6. Estacionalidad — por medir.** Mediados de septiembre y octubre suelen ser más flojos tras el pico de agosto. La tabla semanal de abajo (antelación y reservas por semana) ayuda a estimarlo.",
    ],
    nota: "Es una foto a 2 de octubre de 2026. Las coincidencias de fechas no prueban la causa. Pendiente: reservas por fecha de entrada comparadas con el año anterior, si hay datos.",
  },
];
