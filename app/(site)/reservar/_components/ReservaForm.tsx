"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatoEuros } from "@/lib/pricing";
import { NEGOCIO } from "@/lib/config";
import type { DatosCliente, ReservaCompleta } from "@/lib/types";

const clienteVacio: DatosCliente = {
  nombre: "",
  telefono: "",
  email: "",
  matricula: "",
  modelo: "",
};

function validar(c: DatosCliente): string | null {
  if (c.nombre.trim().length < 3) return "Escribe tu nombre completo.";
  if (!/^[+\d][\d\s-]{7,}$/.test(c.telefono.trim()))
    return "Escribe un teléfono válido (mínimo 8 dígitos).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim()))
    return "Escribe un correo electrónico válido.";
  if (c.matricula.trim().length < 4) return "Escribe la matrícula del vehículo.";
  if (c.modelo.trim().length < 2) return "Escribe el modelo del vehículo.";
  return null;
}

export default function ReservaForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const entryDate       = sp.get("entryDate")       ?? "";
  const entryTime       = sp.get("entryTime")       ?? "08:00";
  const exitDate        = sp.get("exitDate")        ?? "";
  const exitTime        = sp.get("exitTime")        ?? "18:00";
  const terminalEntrada = sp.get("terminalEntrada") ?? "T1";
  const terminalSalida  = sp.get("terminalSalida")  ?? "T1";
  const vehiculo        = (sp.get("vehiculo") ?? "car") as "car" | "autocaravana";
  const dias            = parseInt(sp.get("dias") ?? "0", 10);
  const plan            = parseInt(sp.get("plan") ?? "1", 10);
  const planNombre      = sp.get("planNombre") ?? "Estándar";
  const total           = parseFloat(sp.get("total") ?? "0");
  const nocturno        = sp.get("nocturno") === "1";
  const lavadoNombre    = sp.get("lavadoNombre") ?? "";

  const [cliente, setCliente]   = useState<DatosCliente>(clienteVacio);
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [reservaId, setReservaId] = useState<number | string | null>(null);
  // La reserva puede quedar registrada aunque el correo falle: se avisa en la pantalla de éxito
  const [emailEnviado, setEmailEnviado] = useState(true);

  // ── Cupón promocional (se valida contra /api/cupon; el servidor revalida al confirmar) ──
  const [cuponInput, setCuponInput]       = useState("");
  const [cupon, setCupon]                 = useState<{ codigo: string; descuento: number } | null>(null);
  const [cuponError, setCuponError]       = useState<string | null>(null);
  const [cuponCargando, setCuponCargando] = useState(false);

  const totalFinal = cupon ? Math.round((total - cupon.descuento) * 100) / 100 : total;

  async function aplicarCupon() {
    const codigo = cuponInput.trim().toUpperCase();
    if (!codigo) return;
    setCuponCargando(true);
    setCuponError(null);
    try {
      const res  = await fetch(`/api/cupon?codigo=${encodeURIComponent(codigo)}&total=${total}`);
      const data = await res.json();
      if (data.valido) {
        setCupon({ codigo: data.codigo, descuento: data.descuento });
      } else {
        setCupon(null);
        setCuponError(data.motivo ?? "El código no es válido.");
      }
    } catch {
      setCuponError("No se pudo validar el código. Inténtalo de nuevo.");
    } finally {
      setCuponCargando(false);
    }
  }

  function quitarCupon() {
    setCupon(null);
    setCuponInput("");
    setCuponError(null);
  }

  function actualizar(campo: keyof DatosCliente, valor: string) {
    setCliente((c) => ({ ...c, [campo]: valor }));
    setError(null);
  }

  const fmtFecha = (d: string) =>
    d ? new Date(d + "T00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "";

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    const err = validar(cliente);
    if (err) { setError(err); return; }

    setEnviando(true);
    setError(null);

    const payload: ReservaCompleta = {
      ...cliente,
      vehiculo,
      entrada:  `${entryDate}T${entryTime}`,
      salida:   `${exitDate}T${exitTime}`,
      terminalEntrada: terminalEntrada as any,
      terminalSalida:  terminalSalida  as any,
      dias,
      total: totalFinal,
      plan,
      planNombre,
      ...(lavadoNombre ? { lavadoNombre } : {}),
      ...(cupon ? { cuponCodigo: cupon.codigo, cuponDescuento: cupon.descuento, totalSinDescuento: total } : {}),
    };

    try {
      const res = await fetch("/api/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();

      const data = await res.json();
      const id   = data.reservaId ?? null;
      setReservaId(id);
      setEmailEnviado(data.emailEnviado !== false);

      // ── DataLayer: evento de conversión para GTM/GA4 ──────────────────────
      if (typeof window !== "undefined") {
        (window as any).dataLayer = (window as any).dataLayer ?? [];
        (window as any).dataLayer.push({
          event:             "reserva_confirmada",
          transaction_id:    id,
          transaction_value: Math.round(totalFinal * 100) / 100,
          currency:          "EUR",
          plan:              planNombre,
          // Cupón aplicado (vacío si no hay): permite medir campañas en GA4/Ads
          coupon:            cupon?.codigo ?? "",
        });
      }

      setEnviada(true);
    } catch {
      setError("No se pudo enviar la reserva. Inténtalo de nuevo o llámanos por teléfono.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="reservar-page">
      {/* ── Cabecera ── */}
      <div className="planes-header">
        <button className="planes-back" onClick={() => router.back()} type="button" disabled={enviada}>
          ← Cambiar plan
        </button>
        <h1 className="planes-titulo">Completa tu reserva</h1>
        <p className="planes-subtitulo">Plan <strong>{planNombre}</strong> · Aeropuerto de Madrid · Barajas</p>
      </div>

      <div className="reservar-content">
        {/* ── Resumen ── */}
        <div className="reservar-resumen">
          <h2 className="reservar-resumen-titulo">Resumen</h2>
          <div className="reservar-resumen-fila">
            <span>Entrada</span>
            <strong>{fmtFecha(entryDate)} · {entryTime}</strong>
          </div>
          <div className="reservar-resumen-fila">
            <span>Salida</span>
            <strong>{fmtFecha(exitDate)} · {exitTime}</strong>
          </div>
          <div className="reservar-resumen-fila">
            <span>Estancia</span>
            <strong>{dias} {dias === 1 ? "día" : "días"}</strong>
          </div>
          <div className="reservar-resumen-fila">
            <span>Terminal entrada</span>
            <strong>{terminalEntrada}</strong>
          </div>
          <div className="reservar-resumen-fila">
            <span>Terminal salida</span>
            <strong>{terminalSalida}</strong>
          </div>
          <div className="reservar-resumen-fila">
            <span>Vehículo</span>
            <strong>{vehiculo === "autocaravana" ? "🚐 Autocaravana" : "🚗 Coche"}</strong>
          </div>
          <div className="reservar-resumen-fila">
            <span>Plan</span>
            <strong>{planNombre}</strong>
          </div>
          {lavadoNombre && (
            <div className="reservar-resumen-fila reservar-resumen-fila--lavado">
              <span>🧹 Lavado</span>
              <strong>{lavadoNombre}</strong>
            </div>
          )}
          {nocturno && (
            <div className="reservar-resumen-fila reservar-resumen-fila--nocturno">
              <span>🌙 Recargo nocturno</span>
              <strong>incluido</strong>
            </div>
          )}

          {/* ── Cupón promocional ── */}
          {cupon ? (
            <div className="reservar-resumen-fila reservar-resumen-fila--cupon">
              <span>🎟️ Cupón <strong>{cupon.codigo}</strong></span>
              <strong className="reservar-cupon-descuento">
                −{formatoEuros(cupon.descuento)}
                <button
                  type="button"
                  className="reservar-cupon-quitar"
                  onClick={quitarCupon}
                  disabled={enviando}
                  aria-label="Quitar cupón"
                  title="Quitar cupón"
                >
                  ×
                </button>
              </strong>
            </div>
          ) : (
            <div className="reservar-cupon-wrap">
              <input
                type="text"
                className="reservar-cupon-input"
                placeholder="¿Tienes un código promocional?"
                value={cuponInput}
                onChange={(e) => { setCuponInput(e.target.value.toUpperCase()); setCuponError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); aplicarCupon(); } }}
                disabled={enviando || cuponCargando}
                maxLength={50}
              />
              <button
                type="button"
                className="reservar-cupon-btn"
                onClick={aplicarCupon}
                disabled={enviando || cuponCargando || !cuponInput.trim()}
              >
                {cuponCargando ? "…" : "Aplicar"}
              </button>
            </div>
          )}
          {cuponError && <p className="reservar-cupon-error">{cuponError}</p>}

          <div className="reservar-resumen-fila reservar-resumen-fila--total">
            <span>Total estimado</span>
            <strong>
              {cupon && <span className="reservar-total-antes">{formatoEuros(total)}</span>}
              {formatoEuros(totalFinal)}
            </strong>
          </div>
          <p className="reservar-resumen-nota">
            💳 Sin pago anticipado — pagas al entregar el vehículo
          </p>
        </div>

        {/* ── Formulario ── */}
        <div className="reservar-form-wrap">
          {enviada ? (
            <div className="reservar-exito">
              <div className="reservar-exito-icon">✅</div>
              <h2>¡Reserva confirmada!</h2>
              {emailEnviado ? (
                <p>
                  Te hemos enviado la confirmación a <strong>{cliente.email}</strong>.
                  Recuerda: no pagas nada hasta entregar tu vehículo.
                </p>
              ) : (
                <p>
                  Tu reserva <strong>ya está registrada</strong>, no hace falta repetirla.
                  No hemos podido enviarte el correo de confirmación: si no lo recibes en unos
                  minutos, llámanos al <strong>{NEGOCIO.telefono}</strong> y te lo confirmamos.
                  Recuerda: no pagas nada hasta entregar tu vehículo.
                </p>
              )}
              <button className="plan-btn plan-btn--destacado" onClick={() => router.push("/")} type="button">
                Volver al inicio
              </button>
            </div>
          ) : (
            <form onSubmit={confirmar} className="reservar-form">
              <h2 className="reservar-form-titulo">Tus datos de contacto</h2>

              <div className="reservar-fields">
                <div className="reservar-field">
                  <label htmlFor="nombre">Nombre completo</label>
                  <input
                    id="nombre" type="text" required autoComplete="name"
                    placeholder="Ej. María García"
                    value={cliente.nombre}
                    onChange={(e) => actualizar("nombre", e.target.value)}
                    disabled={enviando}
                  />
                </div>

                <div className="reservar-field">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    id="telefono" type="tel" required autoComplete="tel"
                    placeholder="+34 600 000 000"
                    value={cliente.telefono}
                    onChange={(e) => actualizar("telefono", e.target.value)}
                    disabled={enviando}
                  />
                </div>

                <div className="reservar-field reservar-field--full">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    id="email" type="email" required autoComplete="email"
                    placeholder="correo@email.com"
                    value={cliente.email}
                    onChange={(e) => actualizar("email", e.target.value)}
                    disabled={enviando}
                  />
                </div>

                <div className="reservar-field">
                  <label htmlFor="matricula">Matrícula</label>
                  <input
                    id="matricula" type="text" required
                    placeholder="1234 ABC"
                    value={cliente.matricula}
                    onChange={(e) => actualizar("matricula", e.target.value.toUpperCase())}
                    disabled={enviando}
                  />
                </div>

                <div className="reservar-field">
                  <label htmlFor="modelo">Modelo del vehículo</label>
                  <input
                    id="modelo" type="text" required
                    placeholder="Ej. Toyota Corolla blanco"
                    value={cliente.modelo}
                    onChange={(e) => actualizar("modelo", e.target.value)}
                    disabled={enviando}
                  />
                </div>
              </div>

              {error && <div className="reservar-error">{error}</div>}

              <button
                className="plan-btn plan-btn--destacado reservar-submit"
                type="submit"
                disabled={enviando}
              >
                {enviando ? "Enviando reserva…" : `Confirmar reserva · ${formatoEuros(totalFinal)}`}
              </button>

              <p className="reservar-legal">
                Al confirmar aceptas nuestros <a href="/aviso-legal">términos y condiciones</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
