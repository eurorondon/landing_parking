"use client";

import { Fragment, useMemo } from "react";
import { fmtCurrency, type ReservaAdmin } from "@/lib/admin";
import { aFechaInput } from "@/lib/datetime";
import {
  BASE_INICIO,
  CALENDARIO,
  DECISION,
  ESTACIONALIDAD,
  ESTACIONALIDAD_NOTA,
  ESTACIONALIDAD_TEXTO,
  EVENTOS,
  FALTABA,
  FASES,
  FECHA_CORTE,
  FECHA_DECISION,
  GRAFICO_INICIO,
  NIVEL_ESPERADO,
  PASOS,
  PIVOTE,
  TIPO_COLOR,
  TIPO_LABEL,
  UMBRAL_BAJO,
  UMBRAL_OK,
  type TipoEvento,
} from "@/lib/analisis-caida";

/* ─── Fechas (YYYY-MM-DD, aritmética en UTC para evitar saltos por horario de verano) ─── */

const DIA_MS = 86_400_000;
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const aMs = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const aIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const diasEntre = (a: string, b: string) => Math.round((aMs(b) - aMs(a)) / DIA_MS);
const sumarDias = (iso: string, n: number) => aIso(aMs(iso) + n * DIA_MS);
const diaSemana = (iso: string) => (new Date(aMs(iso)).getUTCDay() + 6) % 7; // 0 = lunes
const etiqueta = (iso: string) => `${+iso.slice(8, 10)} ${MESES[+iso.slice(5, 7) - 1]}`;
const fmtNum = (n: number, dec = 1) => n.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec });

/** Texto con **negrita** y `código` */
function Rico({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong>
        : p.startsWith("`") ? <code key={i}>{p.slice(1, -1)}</code>
        : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

interface DiaDato { fecha: string; n: number; eur: number }

function resumen(dias: DiaDato[], desde: string, hasta: string) {
  const sel = dias.filter((d) => d.fecha >= desde && d.fecha <= hasta);
  const n = sel.reduce((s, d) => s + d.n, 0);
  const eur = sel.reduce((s, d) => s + d.eur, 0);
  const len = Math.max(sel.length, 1);
  return { dias: sel.length, n, porDia: n / len, eurSemana: (eur / len) * 7 };
}

function variacion(antes: number, despues: number): string {
  if (!antes) return "—";
  const v = ((despues - antes) / antes) * 100;
  return `${v > 0 ? "+" : ""}${v.toFixed(0)} %`;
}

/** 0 = nivel de temporada, 1 = algo por debajo, 2 = sigue la caída propia */
function bandaDecision(v: number): 0 | 1 | 2 {
  return v >= UMBRAL_OK ? 0 : v >= UMBRAL_BAJO ? 1 : 2;
}

/* ─── Gráfico de reservas por día ─── */

const W = 900;
const H = 380;
const M = { l: 38, r: 14, t: 78, b: 42 };

function Grafico({ dias, hoy }: { dias: DiaDato[]; hoy: string }) {
  const n = dias.length;
  const plotW = W - M.l - M.r;
  const plotH = H - M.t - M.b;
  const paso = plotW / Math.max(n, 1);
  const ayer = sumarDias(hoy, -1);

  const maxVal = Math.max(...dias.map((d) => d.n), 1);
  const yMax = Math.max(10, Math.ceil(maxVal / 5) * 5);
  const x = (i: number) => M.l + (i + 0.5) * paso;
  const y = (v: number) => M.t + plotH * (1 - v / yMax);

  // media móvil de 7 días (solo con días completos)
  const media = dias.map((d, i) => {
    if (i < 6 || d.fecha > ayer) return null;
    const ventana = dias.slice(i - 6, i + 1);
    return ventana.reduce((s, v) => s + v.n, 0) / 7;
  });
  const puntos = media
    .map((v, i) => (v === null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`))
    .filter(Boolean)
    .join(" ");

  const idxPivote = dias.findIndex((d) => d.fecha === PIVOTE);
  const idxBase = dias.findIndex((d) => d.fecha === BASE_INICIO);
  const idxAyer = dias.findIndex((d) => d.fecha === ayer);
  const antes = resumen(dias, BASE_INICIO, sumarDias(PIVOTE, -1));
  const despues = resumen(dias, PIVOTE, ayer);

  const ticksY = Array.from({ length: yMax / 5 + 1 }, (_, i) => i * 5);
  const lunes = dias.map((d, i) => ({ d, i })).filter(({ d }) => diaSemana(d.fecha) === 0);

  const eventos = EVENTOS.map((e, k) => ({ e, i: dias.findIndex((d) => d.fecha === e.fecha), fila: k % 3 }))
    .filter((v) => v.i >= 0);

  const xZonaIni = idxPivote >= 0 ? x(idxPivote) - paso / 2 : 0;
  const xFin = x(n - 1) + paso / 2;

  return (
    <div className="an-chart-scroll">
      <svg
        className="an-chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Reservas web por día, con la media de 7 días, el nivel estacional esperado y los cambios marcados en la línea de tiempo"
      >
        {/* Zona posterior al escalón */}
        {idxPivote >= 0 && (
          <rect x={M.l + idxPivote * paso} y={M.t} width={plotW - idxPivote * paso} height={plotH} className="an-zona" />
        )}

        {/* Rejilla y eje Y */}
        {ticksY.map((v) => (
          <g key={v}>
            <line x1={M.l} x2={W - M.r} y1={y(v)} y2={y(v)} className="an-grid" />
            <text x={M.l - 6} y={y(v) + 4} textAnchor="end" className="an-tick">{v}</text>
          </g>
        ))}

        {/* Barras diarias */}
        {dias.map((d, i) => (
          <rect
            key={d.fecha}
            x={x(i) - (paso * 0.7) / 2}
            y={y(d.n)}
            width={paso * 0.7}
            height={Math.max(plotH * (d.n / yMax), d.n ? 1 : 0)}
            className={d.fecha === hoy ? "an-bar an-bar-hoy" : "an-bar"}
          >
            <title>{`${etiqueta(d.fecha)}: ${d.n} reservas${d.fecha === hoy ? " (día en curso)" : ""}`}</title>
          </rect>
        ))}

        {/* Nivel estacional esperado en octubre */}
        {idxPivote >= 0 && (
          <g>
            <rect
              x={xZonaIni}
              y={y(NIVEL_ESPERADO.max)}
              width={xFin - xZonaIni}
              height={y(NIVEL_ESPERADO.min) - y(NIVEL_ESPERADO.max)}
              className="an-esperado"
            />
            <text x={xZonaIni + 6} y={y(NIVEL_ESPERADO.max) - 5} className="an-ref-txt an-ref-txt-esperado">
              Nivel estacional esperado ≈ 5 / día
            </text>
          </g>
        )}

        {/* Medias antes / después */}
        {idxBase >= 0 && idxPivote > idxBase && (
          <g>
            <line x1={x(idxBase) - paso / 2} x2={x(idxPivote - 1) + paso / 2} y1={y(antes.porDia)} y2={y(antes.porDia)} className="an-ref an-ref-antes" />
            <text x={x(idxBase)} y={y(antes.porDia) - 6} className="an-ref-txt an-ref-txt-antes">{fmtNum(antes.porDia)} / día</text>
          </g>
        )}
        {idxPivote >= 0 && idxAyer >= idxPivote && (
          <g>
            <line x1={x(idxPivote) - paso / 2} x2={x(idxAyer) + paso / 2} y1={y(despues.porDia)} y2={y(despues.porDia)} className="an-ref an-ref-despues" />
            <text x={x(idxAyer) + paso / 2} y={y(despues.porDia) + 15} textAnchor="end" className="an-ref-txt an-ref-txt-despues">{fmtNum(despues.porDia)} / día</text>
          </g>
        )}

        {/* Media móvil */}
        {puntos && <polyline points={puntos} className="an-media" />}

        {/* Eje X: lunes */}
        {lunes.map(({ d, i }) => (
          <g key={d.fecha}>
            <line x1={x(i)} x2={x(i)} y1={M.t + plotH} y2={M.t + plotH + 4} className="an-eje" />
            <text x={x(i)} y={M.t + plotH + 18} textAnchor="middle" className="an-tick">{etiqueta(d.fecha)}</text>
          </g>
        ))}
        <line x1={M.l} x2={W - M.r} y1={M.t + plotH} y2={M.t + plotH} className="an-eje" />

        {/* Marcadores de eventos */}
        {eventos.map(({ e, i, fila }) => {
          const cy = 18 + fila * 19;
          return (
            <g key={e.id}>
              <line x1={x(i)} x2={x(i)} y1={cy + 9} y2={M.t + plotH} stroke={TIPO_COLOR[e.tipo]} className="an-evento-linea" />
              <circle cx={x(i)} cy={cy} r={9} fill={TIPO_COLOR[e.tipo]}>
                <title>{`${etiqueta(e.fecha)} · ${e.titulo}`}</title>
              </circle>
              <text x={x(i)} y={cy + 3.5} textAnchor="middle" className="an-evento-num">{e.id}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Gráfico mensual de estacionalidad ─── */

const MW = 720;
const MH = 300;
const MM = { l: 40, r: 10, t: 22, b: 36 };

function colorIndice(v: number): string {
  return v >= 1.05 ? "#16a34a" : v < 0.88 ? "#ef4444" : "#e8853d";
}

function lecturaIndice(v: number): string {
  return v >= 1.05 ? "Bueno" : v < 0.88 ? "Malo" : "Flojo";
}

function GraficoMensual() {
  const plotW = MW - MM.l - MM.r;
  const plotH = MH - MM.t - MM.b;
  const paso = plotW / ESTACIONALIDAD.length;
  const yMax = 1.6;
  const y = (v: number) => MM.t + plotH * (1 - v / yMax);
  const x = (i: number) => MM.l + (i + 0.5) * paso;
  const ticks = [0, 0.5, 1, 1.5];

  return (
    <div className="an-chart-scroll">
      <svg
        className="an-chart an-chart-mensual"
        viewBox={`0 0 ${MW} ${MH}`}
        role="img"
        aria-label="Índice de estacionalidad por mes: agosto es el pico y enero, febrero y noviembre los meses más flojos"
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={MM.l} x2={MW - MM.r} y1={y(v)} y2={y(v)} className="an-grid" />
            <text x={MM.l - 6} y={y(v) + 4} textAnchor="end" className="an-tick">{fmtNum(v, 1)}</text>
          </g>
        ))}
        <line x1={MM.l} x2={MW - MM.r} y1={y(1)} y2={y(1)} className="an-ref an-ref-media" />
        <text x={MM.l + 6} y={y(1) - 5} className="an-ref-txt an-ref-txt-media">mes normal = 1,00</text>

        {ESTACIONALIDAD.map((m, i) => {
          const actual = m.mes === "Sep" || m.mes === "Oct";
          return (
            <g key={m.mes}>
              {actual && (
                <rect x={x(i) - paso / 2 + 2} y={MM.t} width={paso - 4} height={plotH} className="an-mes-actual" />
              )}
              <rect
                x={x(i) - paso * 0.31}
                y={y(m.indiceEntrada)}
                width={paso * 0.62}
                height={plotH * (m.indiceEntrada / yMax)}
                fill={colorIndice(m.indiceEntrada)}
                rx={3}
              >
                <title>{`${m.mes}: ${m.entradas} entradas · índice ${fmtNum(m.indiceEntrada, 2)} (entrada) · ${fmtNum(m.indiceCreacion, 2)} (creación)`}</title>
              </rect>
              <text x={x(i)} y={MM.t + plotH - 9} textAnchor="middle" className="an-mes-valor">{fmtNum(m.indiceEntrada, 2)}</text>
              <circle cx={x(i)} cy={y(m.indiceCreacion)} r={4.5} className="an-mes-punto">
                <title>{`Índice por creación de la reserva: ${fmtNum(m.indiceCreacion, 2)}`}</title>
              </circle>
              <text x={x(i)} y={MM.t + plotH + 18} textAnchor="middle" className="an-tick">{m.mes}</text>
            </g>
          );
        })}
        <line x1={MM.l} x2={MW - MM.r} y1={MM.t + plotH} y2={MM.t + plotH} className="an-eje" />
      </svg>
    </div>
  );
}

/* ─── Sección ─── */

export default function AnalisisSection({ reservas }: { reservas: ReservaAdmin[] }) {
  const hoy = aFechaInput(new Date());
  const ayer = sumarDias(hoy, -1);

  const { dias, semanas } = useMemo(() => {
    const porFecha = new Map<string, { n: number; eur: number }>();
    reservas.forEach((r) => {
      const f = r.createdAt?.slice(0, 10);
      if (!f) return;
      const c = porFecha.get(f) ?? { n: 0, eur: 0 };
      c.n += 1;
      c.eur += Number(r.price) || 0;
      porFecha.set(f, c);
    });

    const lista: DiaDato[] = [];
    for (let f = GRAFICO_INICIO; f <= hoy; f = sumarDias(f, 1)) {
      const c = porFecha.get(f);
      lista.push({ fecha: f, n: c?.n ?? 0, eur: c?.eur ?? 0 });
    }

    // Semanas (lunes–domingo): reservas creadas, euros y antelación con la que se reserva
    const semanasMap = new Map<string, { n: number; eur: number; antelaciones: number[] }>();
    reservas.forEach((r) => {
      const f = r.createdAt?.slice(0, 10);
      if (!f || f < GRAFICO_INICIO || f > hoy) return;
      const lunes = sumarDias(f, -diaSemana(f));
      const s = semanasMap.get(lunes) ?? { n: 0, eur: 0, antelaciones: [] };
      s.n += 1;
      s.eur += Number(r.price) || 0;
      const entrada = r.checkIn?.slice(0, 10);
      if (entrada) s.antelaciones.push(diasEntre(f, entrada));
      semanasMap.set(lunes, s);
    });
    const filas = [...semanasMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([lunes, s]) => {
        const media = s.antelaciones.length ? s.antelaciones.reduce((a, b) => a + b, 0) / s.antelaciones.length : null;
        const cortas = s.antelaciones.length ? (s.antelaciones.filter((d) => d < 7).length / s.antelaciones.length) * 100 : null;
        return { lunes, n: s.n, eur: s.eur, media, cortas, enCurso: sumarDias(lunes, 6) >= hoy };
      });

    return { dias: lista, semanas: filas };
  }, [reservas, hoy]);

  const antes = resumen(dias, BASE_INICIO, sumarDias(PIVOTE, -1));
  const despues = resumen(dias, PIVOTE, ayer);
  const hayDatos = dias.some((d) => d.n > 0);

  // Media de los últimos 7 días completos (para el indicador de decisión)
  const ultimos7 = resumen(dias, sumarDias(ayer, -6), ayer);
  const media7 = ultimos7.dias === 7 ? ultimos7.porDia : null;
  const banda = media7 === null ? null : bandaDecision(media7);

  const stats = [
    { icon: "📈", color: "#d1fae5", val: fmtNum(antes.porDia), label: `Reservas/día · ${etiqueta(BASE_INICIO)} – ${etiqueta(sumarDias(PIVOTE, -1))}` },
    { icon: "📉", color: "#fee2e2", val: despues.dias ? fmtNum(despues.porDia) : "—", label: `Reservas/día · desde el ${etiqueta(PIVOTE)}` },
    { icon: "↘️", color: "#fef3c7", val: despues.dias ? variacion(antes.porDia, despues.porDia) : "—", label: "Variación de reservas" },
    { icon: "💶", color: "#e0f0ff", val: despues.dias ? variacion(antes.eurSemana, despues.eurSemana) : "—", label: `Ingresos/semana (${fmtCurrency(antes.eurSemana)} → ${fmtCurrency(despues.eurSemana)})` },
  ];

  const conclusion = [
    `Las reservas web pasaron de **~7 al día a ~3,5** desde el ${etiqueta(PIVOTE)} (ingresos semanales −57 %).`,
    "**Parte es estacionalidad:** el nicho baja desde la semana 37 y en octubre se queda en ≈66–73 % de agosto, así que lo esperable son **unas 5 reservas al día**. Lo propio de la web es el escalón de la semana del 14 de septiembre, que ningún otro sitio comparado muestra.",
    "**Google Ads se tocó el 1–2 de octubre: toca esperar** 7–14 días antes de cambiar nada más en Ads o en la web. Mientras tanto, solo las fases 0, 1 y 4 del plan (medir, arreglar el seguimiento y guardar el origen de las reservas).",
    "**El 16 de octubre se decide** con la media de 7 días de este panel (tabla de decisión más abajo): si es ≥ 4,5 al día, no se toca nada.",
  ];

  return (
    <div className="an-wrap">
      <div className="page-header">
        <div>
          <div className="page-title">Análisis de la caída de reservas</div>
          <div className="page-sub">
            Reservas web en vivo desde la base de datos · datos de Google Analytics, Google Ads y otras bases del VPS: foto del {etiqueta(FECHA_CORTE)} de 2026
          </div>
        </div>
      </div>

      {/* 1 · Resumen */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-card-value">{s.val}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 2 · Conclusión */}
      <div className="card an-conclusion" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">🧭 Conclusión: qué hacer y cuándo</div>
        </div>
        <div className="card-body">
          <ul className="an-lista-concl">
            {conclusion.map((t, i) => (
              <li key={i}><Rico texto={t} /></li>
            ))}
          </ul>
          <div className={`an-semaforo an-sem-${banda ?? "nd"}`}>
            {media7 === null ? (
              <span>Aún no hay 7 días completos para calcular la media.</span>
            ) : (
              <span>
                <strong>Media de los últimos 7 días: {fmtNum(media7)} reservas/día</strong> → {DECISION[banda!].lectura.toLowerCase()}.{" "}
                {hoy < FECHA_DECISION
                  ? <>Hasta el {etiqueta(FECHA_DECISION)} no se actúa. Si sigue así ese día: {DECISION[banda!].accion.replace(/`/g, "")}</>
                  : DECISION[banda!].accion.replace(/`/g, "")}
                {hoy < FECHA_DECISION && (
                  <em>Lectura provisional: los cambios de Ads del 1–2 de octubre tardan 7–14 días en estabilizarse.</em>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3 · Gráfico */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">📅 Línea de tiempo: reservas por día y cambios</div>
        </div>
        <div className="card-body">
          <p className="an-intro">
            Cada barra es el número de reservas creadas ese día; la línea naranja es la media de 7 días. La zona rojiza empieza el{" "}
            <strong>{etiqueta(PIVOTE)}</strong> y la franja morada marca el <strong>nivel estacional esperado</strong> (≈5 al día). Los círculos
            numerados son los cambios y sucesos que coinciden con la caída (lista debajo).
          </p>
          {hayDatos ? (
            <Grafico dias={dias} hoy={hoy} />
          ) : (
            <div className="empty-state"><p>No hay reservas en el periodo del gráfico.</p></div>
          )}
          <div className="an-leyenda">
            <span><i className="an-sw an-sw-bar" /> Reservas por día</span>
            <span><i className="an-sw an-sw-media" /> Media 7 días</span>
            <span><i className="an-sw an-sw-antes" /> Media antes del {etiqueta(PIVOTE)}</span>
            <span><i className="an-sw an-sw-despues" /> Media después</span>
            <span><i className="an-sw an-sw-esperado" /> Nivel estacional esperado</span>
            {(Object.keys(TIPO_LABEL) as TipoEvento[]).map((t) => (
              <span key={t}><i className="an-sw an-sw-ev" style={{ background: TIPO_COLOR[t] }} /> {TIPO_LABEL[t]}</span>
            ))}
          </div>
          <ol className="an-eventos">
            {EVENTOS.map((e) => (
              <li key={e.id}>
                <span className="an-ev-num" style={{ background: TIPO_COLOR[e.tipo] }}>{e.id}</span>
                <div>
                  <div className="an-ev-titulo">
                    <strong>{etiqueta(e.fecha)}</strong> · {e.titulo}
                    <span className="an-ev-tipo" style={{ color: TIPO_COLOR[e.tipo] }}>{TIPO_LABEL[e.tipo]}</span>
                  </div>
                  <div className="an-ev-detalle">{e.detalle}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 4 · Paso a paso */}
      <div className="an-pasos">
        {PASOS.map((p, i) => (
          <div className="card an-paso" key={p.titulo}>
            <div className="card-header">
              <div className="card-title"><span className="an-paso-num">{i + 1}</span> {p.titulo}</div>
            </div>
            <div className="card-body">
              {p.texto.map((t, k) => (
                <p key={k}><Rico texto={t} /></p>
              ))}
              {p.tabla && (
                <div className="table-wrap an-tabla">
                  <table>
                    <thead>
                      <tr>{p.tabla.cabecera.map((c) => <th key={c}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {p.tabla.filas.map((f, r) => (
                        <tr key={r}>{f.map((c, k) => <td key={k}>{c}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {p.nota && <p className="an-nota">⚠️ {p.nota}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* 5 · Estacionalidad del nicho */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">🌦️ Estacionalidad del nicho: meses buenos y malos</div>
        </div>
        <div className="card-body">
          {ESTACIONALIDAD_TEXTO.map((t, i) => (
            <p key={i} className="an-intro"><Rico texto={t} /></p>
          ))}
          <GraficoMensual />
          <div className="an-leyenda">
            <span><i className="an-sw" style={{ background: "#16a34a" }} /> Bueno (≥ 1,05)</span>
            <span><i className="an-sw" style={{ background: "#e8853d" }} /> Flojo</span>
            <span><i className="an-sw" style={{ background: "#ef4444" }} /> Malo (&lt; 0,88)</span>
            <span><i className="an-sw an-sw-punto" /> Índice por fecha de creación de la reserva</span>
            <span><i className="an-sw an-sw-mesactual" /> Meses de esta caída (sep–oct)</span>
          </div>
          <div className="table-wrap an-tabla">
            <table>
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Reservas por fecha de entrada (2025)</th>
                  <th>Índice entrada</th>
                  <th>Índice creación</th>
                  <th>Lectura</th>
                </tr>
              </thead>
              <tbody>
                {ESTACIONALIDAD.map((m) => (
                  <tr key={m.mes}>
                    <td>{m.mes}</td>
                    <td>{m.entradas.toLocaleString("es-ES")}</td>
                    <td>{fmtNum(m.indiceEntrada, 2)}</td>
                    <td>{fmtNum(m.indiceCreacion, 2)}</td>
                    <td style={{ color: colorIndice(m.indiceEntrada), fontWeight: 600 }}>{lecturaIndice(m.indiceEntrada)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="an-nota">⚠️ {ESTACIONALIDAD_NOTA}</p>
        </div>
      </div>

      {/* 6 · Plan de acción */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">🛠️ Plan de acción por fases</div>
        </div>
        <div className="card-body">
          <div className="table-wrap an-tabla">
            <table className="an-tabla-fases">
              <thead>
                <tr><th>Fase</th><th>Qué hacer</th><th>Esfuerzo / riesgo</th><th>Cuándo</th></tr>
              </thead>
              <tbody>
                {FASES.map((f) => (
                  <tr key={f.fase}>
                    <td><strong>{f.fase}. {f.titulo}</strong></td>
                    <td>
                      <ul className="an-lista">
                        {f.hacer.map((h, i) => <li key={i}><Rico texto={h} /></li>)}
                      </ul>
                    </td>
                    <td>{f.esfuerzo}</td>
                    <td>{f.cuando}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="an-sub">Calendario: ¿toca esperar?</h3>
          <div className="table-wrap an-tabla">
            <table>
              <thead><tr><th>Cuándo</th><th>Qué hacer</th></tr></thead>
              <tbody>
                {CALENDARIO.map((c) => (
                  <tr key={c.cuando}>
                    <td><strong>{c.cuando}</strong></td>
                    <td><Rico texto={c.que} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="an-sub">Cómo decidir el 16 de octubre (media de 7 días)</h3>
          <div className="table-wrap an-tabla">
            <table>
              <thead><tr><th>Media de 7 días</th><th>Lectura</th><th>Qué hacer</th></tr></thead>
              <tbody>
                {DECISION.map((d, i) => (
                  <tr key={d.rango} className={banda === i ? "an-fila-actual" : undefined}>
                    <td><strong>{d.rango}</strong>{banda === i ? <span className="an-aqui"> ← estás aquí</span> : null}</td>
                    <td>{d.lectura}</td>
                    <td><Rico texto={d.accion} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="an-nota">
            ⚠️ El nivel de ≈5 al día tiene un margen amplio: un solo año completo de comparación, otro negocio y pocas reservas por semana.
            Y no hay garantía de que la web llegue a ese nivel.
          </p>

          <h3 className="an-sub">Lo que el plan inicial no cubría</h3>
          <ul className="an-lista an-lista-faltaba">
            {FALTABA.map((t, i) => <li key={i}><Rico texto={t} /></li>)}
          </ul>
        </div>
      </div>

      {/* 7 · Tabla semanal en vivo */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">🗓️ Reservas por semana y antelación (en vivo)</div>
        </div>
        <div className="card-body">
          <p className="an-intro">
            Semanas de lunes a domingo según la fecha de creación de la reserva. La antelación es el tiempo entre que se reserva y la fecha de entrada:
            si baja, se reserva más tarde y la demanda es más «de última hora», algo típico de temporada baja.
          </p>
          <div className="table-wrap an-tabla">
            <table>
              <thead>
                <tr>
                  <th>Semana del</th>
                  <th>Reservas</th>
                  <th>Ingresos</th>
                  <th>Antelación media</th>
                  <th>Entrada en menos de 7 días</th>
                </tr>
              </thead>
              <tbody>
                {semanas.map((s) => (
                  <tr key={s.lunes}>
                    <td>{etiqueta(s.lunes)}{s.enCurso ? " (en curso)" : ""}</td>
                    <td>{s.n}</td>
                    <td>{fmtCurrency(s.eur)}</td>
                    <td>{s.media === null ? "—" : `${fmtNum(s.media)} días`}</td>
                    <td>{s.cortas === null ? "—" : `${s.cortas.toFixed(0)} %`}</td>
                  </tr>
                ))}
                {semanas.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)" }}>Sin datos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
