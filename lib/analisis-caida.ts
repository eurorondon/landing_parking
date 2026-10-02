/**
 * Contenido estático del informe «Análisis de la caída de reservas» (panel /admin → Análisis de caída).
 *
 * Las reservas por día/semana del gráfico se calculan EN VIVO desde la BD; lo de este
 * fichero es una FOTO de datos externos (Google Analytics, Google Ads, historial de código y
 * otras bases del VPS para la estacionalidad) tomada el 2 de octubre de 2026.
 * Si se actualiza el informe, editar aquí.
 */

/** Fecha de la foto de Analytics/Ads (YYYY-MM-DD) */
export const FECHA_CORTE = "2026-10-02";

/** Día en que se evalúan los cambios de Google Ads del 1–2 oct (7–14 días de estabilización) */
export const FECHA_DECISION = "2026-10-16";

/** Primer día del gráfico (lunes completo, tras el arranque de la web) */
export const GRAFICO_INICIO = "2026-07-20";

/** Periodo «normal» de referencia: del 3 ago al 13 sept */
export const BASE_INICIO = "2026-08-03";

/** Día en que empieza el escalón a la baja */
export const PIVOTE = "2026-09-14";

/**
 * Nivel de reservas/día esperable en octubre solo por estacionalidad:
 * 66–73 % del nivel de agosto/inicio de septiembre (≈7,2/día) → 4,8–5,3.
 */
export const NIVEL_ESPERADO = { min: 4.8, max: 5.3 };

/** Umbrales de decisión sobre la media de 7 días (reservas/día) */
export const UMBRAL_OK = 4.5;
export const UMBRAL_BAJO = 3.5;

export type TipoEvento = "sitio" | "ads" | "incidencia" | "mercado";

export const TIPO_LABEL: Record<TipoEvento, string> = {
  sitio:      "Cambio en la web",
  ads:        "Cambio en Google Ads",
  incidencia: "Incidencia",
  mercado:    "Mercado / temporada",
};

export const TIPO_COLOR: Record<TipoEvento, string> = {
  sitio:      "#2a6a84",
  ads:        "#e8853d",
  incidencia: "#ef4444",
  mercado:    "#7c3aed",
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
    id: 2, fecha: "2026-09-07", tipo: "mercado",
    titulo: "Baja estacional del nicho (semana ISO 37)",
    detalle: "En otras bases del VPS (ParkingPlus y aparcabarajas), la demanda cae entre un 23 % y un 33 % en esta semana, tanto en 2025 como en 2026. Tu web también bajó (−21 %) y luego se queda plana en octubre.",
  },
  {
    id: 3, fecha: "2026-09-14", tipo: "sitio",
    titulo: "Rediseño del hero y precio «desde»",
    detalle: "Nuevo hero con tarjeta «DESDE X €» y nuevo cálculo del recargo de temporada. Sin temporadas activas el cálculo da lo mismo que antes. El día 15 solo hay 1 reserva y la semana cae un 46 %, algo que ningún otro sitio comparado muestra.",
  },
  {
    id: 4, fecha: "2026-09-15", tipo: "incidencia",
    titulo: "Android sin acceso al sitio (HTTP/3 · QUIC)",
    detalle: "Entre el 14 y el 15 de septiembre varios Android no podían abrir el sitio (ERR_QUIC_PROTOCOL_ERROR, CONNECTION_REFUSED/ABORTED), con operadoras distintas. En iPhone funcionaba siempre. Se desactiva HTTP/3 en Cloudflare el 15 y los Android vuelven a cargar. Ver docs/diagnostico-caidas-reportadas.md.",
  },
  {
    id: 5, fecha: "2026-09-16", tipo: "incidencia",
    titulo: "Android con datos móviles: error de ECH",
    detalle: "El 16 el panel falla en Android con datos móviles (con WiFi carga) y otro teléfono da ERR_ECH_FALLBACK_CERTIFICATE_INVALID. Se desactiva el ECH de Cloudflare esa noche; falta confirmar que ya carga con datos móviles.",
  },
  {
    id: 6, fecha: "2026-09-18", tipo: "ads",
    titulo: "≈9 palabras clave pausadas",
    detalle: "Madrugada del 18 (2:23–2:41). Eran de muy poco gasto; las que más convierten siguen activas.",
  },
  {
    id: 7, fecha: "2026-09-21", tipo: "ads",
    titulo: "Otra palabra clave de frase pausada",
    detalle: "Pausa de una palabra clave de concordancia de frase en la campaña principal.",
  },
  {
    id: 8, fecha: "2026-09-22", tipo: "ads",
    titulo: "Performance Max pausada",
    detalle: "Pausada desde la app móvil de Google Ads. En agosto aportó ≈26 reservas medidas por 416 €. Su salida ya había caído desde el 16 (impresiones de 3.245 a 1.145), así que la pausa llegó con la campaña casi apagada. No se sabe por qué cayó ni por qué se pausó.",
  },
  {
    id: 9, fecha: "2026-09-27", tipo: "sitio",
    titulo: "Hero sin tarjeta de precio + mejoras de rendimiento",
    detalle: "Se quita la tarjeta «DESDE X €», se optimiza la imagen del hero y las fuentes. No se ve recuperación posterior.",
  },
  {
    id: 10, fecha: "2026-09-29", tipo: "ads",
    titulo: "Otra palabra clave exacta pausada",
    detalle: "Pausa de una palabra clave de concordancia exacta en la campaña principal.",
  },
  {
    id: 11, fecha: "2026-10-01", tipo: "ads",
    titulo: "Campaña «29 de septiembre» pausada",
    detalle: "La campaña nueva «29 de septiembre intención alta» gastó 14,57 € en 9 clics (CPC 1,62 €) sin conversiones y se pausa.",
  },
  {
    id: 12, fecha: "2026-10-02", tipo: "ads",
    titulo: "Cambios de anuncios, URLs finales y palabras clave",
    detalle: "Ediciones manuales en la campaña principal (anuncio adaptable, 2 URLs finales, palabras clave). Google necesita 7–14 días para estabilizarlas: los datos de estos días no son comparables.",
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
  /** Párrafos de texto (admite **negrita** y `código`) */
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
      "En esas mismas fechas coinciden dos cosas: el rediseño del hero (14 sept) y el **fallo de acceso en Android** (HTTP/3 el 14–15 y ECH el 16, ver los eventos 4 y 5). El fallo de Android pudo restar reservas esos días; las reservas siguieron bajas después de corregirlo.",
    ],
  },
  {
    titulo: "La estacionalidad explica una parte, pero no el escalón",
    texto: [
      "Se compararon las reservas del mismo periodo en otras dos bases del VPS: **ParkingPlus** y **aparcabarajas** (2025 y 2026). En los dos, la demanda cae entre un 23 % y un 33 % en la **semana ISO 37** (7–13 sept), y tu web también (−21 %).",
      "La semana siguiente (14–20 sept) es la que distingue: tu web cae otro **−46 %**, mientras los otros sitios van de **−18 % a +38 %**. Ningún comparador, en ningún año, muestra un salto así. Ese escalón es propio de la web.",
      "Cuánto de la caída total es estacional **no se puede cuantificar con precisión**: según el sitio y el año va de una pequeña parte a la mayor parte. Lo robusto es el escalón de la semana 38, no el porcentaje.",
    ],
    tabla: {
      cabecera: ["Semana ISO (inicio)", "ParkingPlus 2025", "ParkingPlus 2026", "aparcabarajas 2025", "aparcabarajas 2026", "Esta web 2026"],
      filas: [
        ["36 (31 ago)", "287", "293", "66", "114", "58"],
        ["37 (7 sep)", "222", "227", "44", "78", "46"],
        ["38 (14 sep)", "252", "314", "36", "72", "25"],
        ["39 (21 sep)", "228", "185", "31", "51", "24"],
        ["40 (28 sep)", "239", "200 (parcial)", "41", "58 (parcial)", "12 (5 días)"],
      ],
    },
    nota: "Son negocios distintos: ParkingPlus tiene más teléfono y agencias, y aparcabarajas crece mucho (2026 ≈ 2–3 veces 2025). Cuentan reservas creadas, sin canceladas ni las de «Parking Aero Madrid» duplicadas. Esta web tiene pocas reservas por semana (±15–20 % de ruido).",
  },
  {
    titulo: "En octubre la demanda se queda plana, no sigue cayendo",
    texto: [
      "En 2025, de agosto a septiembre las reservas del nicho caen un 24 %, a octubre otro 13 %, y se quedan en **≈66 % del agosto** (semanas 41–44 sin más bajada). Diciembre rebota.",
      "Aplicado a tu web (≈7,2 reservas/día entre el 3 de agosto y el 13 de septiembre), el nivel esperable de octubre por **estacionalidad sola** es de **unas 5 reservas al día (4,8–5,3)**. Hoy estás por debajo: la diferencia, de 1,5–2 al día, es lo que se puede intentar recuperar.",
      "Un matiz: en 2024 aparcabarajas (en fase de arranque) rebotó en octubre por encima de agosto. Por eso 5 al día es un objetivo prudente, no un techo.",
    ],
  },
  {
    titulo: "El nicho reserva sobre la hora (y tu web, más aún)",
    texto: [
      "Cerca de la mitad reserva **2 días o menos antes** de entrar, y ~8 de cada 10 a 7 días o menos. En el verano y en diciembre hay más planificadores (en agosto, el 30 % reserva con más de una semana de antelación).",
      "Tu web es todavía más de última hora: entre el 61 % y el 76 % reserva a 2 días o menos. Desde el 14 de septiembre bajan las dos clases: las de más de 7 días de antelación (de ~0,9 a ~0,2 al día) y las de 7 días o menos (de ~6,4 a ~3,0 al día).",
      "**No hay colchón:** lo que se reserva hoy es el viaje de esta semana. Por eso la caída actual refleja demanda captada ahora, y el presupuesto de Ads puede seguir la temporada casi en tiempo real, con 2–4 semanas de adelanto antes de los picos.",
    ],
    tabla: {
      cabecera: ["Mes de entrada (web, 2025)", "Media (días antes)", "Reservan ≤2 días antes", "Reservan >7 días antes"],
      filas: [
        ["Enero", "5,1", "58 %", "16 %"],
        ["Febrero", "5,6", "52 %", "23 %"],
        ["Marzo", "6,6", "53 %", "21 %"],
        ["Abril", "7,0", "55 %", "21 %"],
        ["Mayo", "5,7", "55 %", "18 %"],
        ["Junio", "8,9", "47 %", "26 %"],
        ["Julio", "8,2", "48 %", "23 %"],
        ["Agosto", "10,8", "45 %", "30 %"],
        ["Septiembre", "5,8", "54 %", "18 %"],
        ["Octubre", "5,9", "51 %", "21 %"],
        ["Noviembre", "6,3", "56 %", "21 %"],
        ["Diciembre", "7,9", "52 %", "23 %"],
        ["Esta web · julio 2026", "3,9", "61 %", "13 %"],
        ["Esta web · agosto 2026", "4,4", "69 %", "15 %"],
        ["Esta web · septiembre 2026", "2,4", "76 %", "6 %"],
      ],
    },
    nota: "Desde el 14 de septiembre solo hay 61 reservas web, de las que ~4 son con más de 7 días de antelación: muestra mínima.",
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
      "Las páginas de terminal (T4, T1, T2) mantienen o suben su tráfico. Lo que baja es la **portada** (`/`), a la que apuntan casi todas las palabras clave genéricas.",
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
    titulo: "Sospechosos por orden",
    texto: [
      "**1. Estacionalidad — parte real, no cuantificable.** El nicho baja desde la semana ISO 37 y en octubre se queda en ≈66–73 % del agosto. Explica por qué el nivel esperable ronda las 5 reservas al día, no las 7.",
      "**2. Poca cuota de impresiones en las genéricas — certeza alta.** Se pierde por ranking: subir pujas o mejorar los anuncios de `parking aeropuerto madrid` y similares.",
      "**3. Performance Max pausada (22 sept) — contribuyó (certeza alta), pero explica como mucho un tercio.** Su salida ya había caído antes de pausarla y no se sabe por qué; reactivarla no garantiza recuperar nada. Antes hay que averiguar por qué cayó.",
      "**4. Peor conversión en móvil — certeza media.** Revisar el paso `/planes` → `/reservar` y el aspecto de la portada en móvil.",
      "**5. Fallo de acceso en Android (14–16 sept) — contribuyó al inicio, no a lo persistente.** Corregido el 15 (HTTP/3) y el 16 (ECH). Pendiente: confirmar que el admin ya entra con datos móviles.",
      "**6. Rediseño del hero (14 sept) — certeza baja.** Coincide en fechas, pero el camino de reserva no cambió y más gente pasa de la portada a `/planes`. Quitar la tarjeta de precio el 27 no recuperó nada.",
    ],
    nota: "Es una foto a 2 de octubre de 2026. Las coincidencias de fechas no prueban la causa.",
  },
];

/* ─────────────────────────────────────────────────────────────
   Estacionalidad del nicho (ParkingPlus 2025, único año completo y estable)
   ───────────────────────────────────────────────────────────── */

export interface MesEstacional {
  mes: string;
  /** reservas no canceladas por mes de ENTRADA */
  entradas: number;
  /** índice por entrada: mes ÷ media mensual (1,00 = mes normal) */
  indiceEntrada: number;
  /** índice por CREACIÓN de la reserva */
  indiceCreacion: number;
}

export const ESTACIONALIDAD: MesEstacional[] = [
  { mes: "Ene", entradas: 703,  indiceEntrada: 0.70, indiceCreacion: 0.72 },
  { mes: "Feb", entradas: 775,  indiceEntrada: 0.77, indiceCreacion: 0.84 },
  { mes: "Mar", entradas: 903,  indiceEntrada: 0.90, indiceCreacion: 0.87 },
  { mes: "Abr", entradas: 1126, indiceEntrada: 1.12, indiceCreacion: 1.15 },
  { mes: "May", entradas: 940,  indiceEntrada: 0.93, indiceCreacion: 0.94 },
  { mes: "Jun", entradas: 1094, indiceEntrada: 1.08, indiceCreacion: 1.12 },
  { mes: "Jul", entradas: 1076, indiceEntrada: 1.07, indiceCreacion: 1.14 },
  { mes: "Ago", entradas: 1494, indiceEntrada: 1.48, indiceCreacion: 1.37 },
  { mes: "Sep", entradas: 1076, indiceEntrada: 1.07, indiceCreacion: 1.03 },
  { mes: "Oct", entradas: 945,  indiceEntrada: 0.94, indiceCreacion: 0.90 },
  { mes: "Nov", entradas: 842,  indiceEntrada: 0.83, indiceCreacion: 0.91 },
  { mes: "Dic", entradas: 1130, indiceEntrada: 1.12, indiceCreacion: 1.00 },
];

export const ESTACIONALIDAD_TEXTO: string[] = [
  "Índice = reservas del mes ÷ media mensual del año (1,00 es un mes normal). Se calcula con ParkingPlus 2025 (≈12.100 reservas no canceladas), el único año completo y estable que hay en el VPS.",
  "**Meses buenos:** agosto (el pico, +48 %), abril (Semana Santa), diciembre (Navidad) y el verano (junio, julio) y septiembre. **Meses flojos o malos:** enero y febrero (el valle del año), noviembre, y por debajo de la media octubre, mayo y marzo.",
  "**Septiembre → octubre → noviembre es una bajada escalonada**, no el fin del negocio: diciembre rebota. En 2026 el mercado no crece: ParkingPlus va un 37 % por debajo de 2025 en abril, un 32 % en mayo, un 21 % en junio, un 9 % en julio, un 13 % en agosto y un 1 % en septiembre.",
];

export const ESTACIONALIDAD_NOTA =
  "Solo hay un año completo (2025): la Semana Santa y los puentes cambian de mes de un año a otro. ParkingPlus no es tu negocio (más teléfono y agencias) y esto cuenta todos los canales. 2024 no sirve: ParkingPlus arrancó a finales de 2024 y aparcabarajas estaba en fase de arranque.";

/* ─────────────────────────────────────────────────────────────
   Plan de acción
   ───────────────────────────────────────────────────────────── */

export interface FasePlan {
  fase: string;
  titulo: string;
  hacer: string[];
  esfuerzo: string;
  cuando: string;
}

export const FASES: FasePlan[] = [
  {
    fase: "0", titulo: "Medir antes de tocar",
    hacer: [
      "Ver el gráfico diario y el estado de Performance Max en Google Ads (por qué cayó antes de pausarse).",
      "Estimar la estacionalidad con las reservas de otros años de las bases del VPS (**hecho**: ver «Estacionalidad del nicho»).",
      "Confirmar que Android carga con datos móviles (el admin aún no lo ha confirmado).",
      "Mirar la media de 7 días de este panel cada día, sin cambiar nada.",
      "**Microsoft Clarity** (grabaciones y mapas de calor), cargado solo si el usuario pulsa «Aceptar todo» en el banner de cookies actual: del 9 al 16 de octubre, ver grabaciones de móvil que llegaron a `/reservar` y no confirmaron, clics que no responden y errores de JavaScript.",
    ],
    esfuerzo: "Bajo · solo lectura",
    cuando: "Ya, hasta el 9 oct",
  },
  {
    fase: "1", titulo: "Arreglar el seguimiento",
    hacer: [
      "Analytics ve ~73 % de las reservas y Ads ~48 %. Con datos incompletos, la puja automática optimiza peor.",
      "Asegurar que cada reserva dispara `reserva_confirmada` y que Ads la usa como conversión.",
    ],
    esfuerzo: "Medio · vale la pena antes de gastar más",
    cuando: "Ya, en paralelo (no cambia lo que ve el cliente)",
  },
  {
    fase: "2", titulo: "Ads: recuperar alcance",
    hacer: [
      "Subir pujas o mejorar los anuncios en las genéricas (se pierde ~63 % de impresiones por ranking).",
      "Prueba pequeña de Performance Max: 2 semanas, presupuesto bajo, la reserva como objetivo — solo si la fase 0 la justifica.",
    ],
    esfuerzo: "Medio · reversible",
    cuando: "Desde el 16 oct, tras evaluar. Un cambio cada vez",
  },
  {
    fase: "3", titulo: "Web móvil",
    hacer: [
      "Revisar el paso `/planes` → `/reservar` (52 % → 42 %).",
      "Probar una versión del hero anterior al 14 de septiembre y comparar.",
    ],
    esfuerzo: "Medio · con prueba controlada",
    cuando: "No a la vez que Ads: después de la ventana de 2 semanas",
  },
  {
    fase: "4", titulo: "Atribución real",
    hacer: [
      "Guardar en cada reserva de dónde vino (UTM/`gclid`) para saber cuántas reservas reales aporta cada campaña.",
    ],
    esfuerzo: "Medio · cambio de código",
    cuando: "Ya, en paralelo (invisible para el cliente)",
  },
];

export interface FilaCalendario { cuando: string; que: string }

export const CALENDARIO: FilaCalendario[] = [
  { cuando: "Hoy – 9 oct", que: "**Congelar Ads y la web.** El 1–2 de octubre se editaron anuncios, URLs finales y palabras clave, y Google necesita 7–14 días para estabilizar. Hacer solo las fases 0, 1 y 4." },
  { cuando: "9 – 16 oct", que: "**Evaluar** los cambios de Google con la media de 7 días de este panel (ver la tabla de decisión)." },
  { cuando: "Desde el 16 oct", que: "Si hace falta, **un cambio cada vez** (fases 2 y 3), con 2 semanas de espera y un criterio de reversión entre uno y otro." },
  { cuando: "Antes de la próxima temporada alta", que: "Subir el presupuesto de Ads **2–4 semanas antes** de los picos (junio–agosto, Semana Santa, diciembre) para captar a los planificadores, que reservan con más de una semana de antelación." },
];

export interface FilaDecision { rango: string; lectura: string; accion: string }

export const DECISION: FilaDecision[] = [
  { rango: `≥ ${UMBRAL_OK.toString().replace(".", ",")} al día`, lectura: "Nivel de temporada", accion: "Seguir esperando. No tocar nada." },
  { rango: `${UMBRAL_BAJO.toString().replace(".", ",")} – ${UMBRAL_OK.toString().replace(".", ",")} al día`, lectura: "Algo por debajo de lo esperable", accion: "Mejoras pequeñas en Ads: pujas y anuncios de las genéricas." },
  { rango: `< ${UMBRAL_BAJO.toString().replace(".", ",")} al día`, lectura: "Sigue la caída propia", accion: "Cambios mayores, uno cada vez: prueba pequeña de Performance Max y revisar `/planes` → `/reservar` en móvil; después, la prueba del hero." },
];

/** Lo que el plan inicial no cubría */
export const FALTABA: string[] = [
  "**Congelar y esperar:** no se decía que el 1–2 de octubre ya se tocó Ads y que hay que dejar 7–14 días antes de cambiar más.",
  "**Cómo decidir:** un objetivo (≈5 reservas/día en octubre) y umbrales sobre la media de 7 días, para saber si algo funcionó.",
  "**Rentabilidad:** definir el coste máximo aceptable por reserva. Hoy Ads sale a ~17–24 € por reserva con un ticket de ~58 €, y no se conoce el margen.",
  "**WhatsApp y teléfono:** esta base solo registra la web. Parte de la caída podría haberse desplazado a reservas por WhatsApp o teléfono sin medirse: mirar los clics de WhatsApp/teléfono y registrar esas reservas.",
  "**Comparativa de subastas** (Google Ads → Estadísticas e informes): ver si ha subido la competencia, porque el CPC subió un 23 %.",
  "**Registro de cambios:** anotar quién cambia qué en Ads y por qué. Preguntar por qué se pausó Performance Max y las palabras clave.",
  "**El hueco del 15–16 de agosto** (casi sin visitas y 0 reservas el 16): sigue sin investigar.",
  "**Segundo año de estacionalidad:** validar con 2026 completo y calcular también estancia media y ticket por mes.",
];
