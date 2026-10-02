"use client";

import { Fragment, useMemo } from "react";
import { fmtCurrency, type ReservaAdmin } from "@/lib/admin";
import { aFechaInput } from "@/lib/datetime";
import {
  BASE_INICIO,
  EVENTOS,
  FECHA_CORTE,
  GRAFICO_INICIO,
  PASOS,
  PIVOTE,
  TIPO_COLOR,
  TIPO_LABEL,
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

/* ─── Gráfico ─── */

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

  return (
    <div className="an-chart-scroll">
      <svg
        className="an-chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Reservas web por día, con la media de 7 días y los cambios marcados en la línea de tiempo"
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
            <text x={x(idxAyer) + paso / 2} y={y(despues.porDia) - 6} textAnchor="end" className="an-ref-txt an-ref-txt-despues">{fmtNum(despues.porDia)} / día</text>
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

  const stats = [
    { icon: "📈", color: "#d1fae5", val: fmtNum(antes.porDia), label: `Reservas/día · ${etiqueta(BASE_INICIO)} – ${etiqueta(sumarDias(PIVOTE, -1))}` },
    { icon: "📉", color: "#fee2e2", val: despues.dias ? fmtNum(despues.porDia) : "—", label: `Reservas/día · desde el ${etiqueta(PIVOTE)}` },
    { icon: "↘️", color: "#fef3c7", val: despues.dias ? variacion(antes.porDia, despues.porDia) : "—", label: "Variación de reservas" },
    { icon: "💶", color: "#e0f0ff", val: despues.dias ? variacion(antes.eurSemana, despues.eurSemana) : "—", label: `Ingresos/semana (${fmtCurrency(antes.eurSemana)} → ${fmtCurrency(despues.eurSemana)})` },
  ];

  return (
    <div className="an-wrap">
      <div className="page-header">
        <div>
          <div className="page-title">Análisis de la caída de reservas</div>
          <div className="page-sub">
            Reservas web en vivo desde la base de datos · datos de Google Analytics y Google Ads: foto del {etiqueta(FECHA_CORTE)} de 2026
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

      {/* 2 · Gráfico */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">📅 Línea de tiempo: reservas por día y cambios</div>
        </div>
        <div className="card-body">
          <p className="an-intro">
            Cada barra es el número de reservas creadas ese día; la línea naranja es la media de 7 días. La zona rojiza empieza el{" "}
            <strong>{etiqueta(PIVOTE)}</strong>. Los círculos numerados son los cambios y sucesos que coinciden con la caída (lista debajo).
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

      {/* 3 · Paso a paso */}
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

      {/* 4 · Tabla semanal en vivo */}
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
