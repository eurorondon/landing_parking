"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "./ui/Select";
import DatePicker from "./ui/DatePicker";
import { OPCIONES_TERMINAL } from "@/lib/config";
import { getNearestSlot, OPCIONES_HORA, aFechaInput } from "@/lib/datetime";
import {
  calculateRawParkingDays,
  aplicaNocturnidad,
  formatoEuros,
  type CalculoPrecio,
} from "@/lib/pricing";
import type { DatosReserva } from "@/lib/types";

/**
 * Calculadora de precio — tema claro.
 * El precio se obtiene desde /api/precio?dias=N[&nocturno=1], que consulta
 * registro_precios + precio_temporada + servicios en la misma BD que el dashboard.
 * La nocturnidad (00:30–03:30) suma el coste del servicio id=11.
 */
export default function BookingForm() {
  // ── Estado de fechas vacío hasta que el cliente monte ───────────────────────
  // Las fechas se calculan SIEMPRE en el cliente para evitar el desfase de
  // zona horaria del SSR (el servidor corre en UTC, el usuario está en UTC+2).
  const [reserva, setReserva] = useState<DatosReserva>({
    vehiculo:        "car",
    entryDate:       "",      // se rellena en useEffect (cliente)
    entryTime:       "",      // se rellena en useEffect (cliente)
    exitDate:        "",      // se rellena en useEffect (cliente)
    exitTime:        "18:00",
    terminalEntrada: "T1",
    terminalSalida:  "T1",
  });
  const [hoy, setHoy]         = useState("");   // también se rellena en cliente
  const [calculo, setCalculo] = useState<CalculoPrecio | null>(null);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  // Estado del servicio de lavado seleccionado desde ServiciosLimpieza
  const [lavado, setLavado] = useState<{ id: number; nombre: string; precio: string } | null>(null);

  // Inicializa en el cliente:
  // · Calcula "hoy" para el atributo min de los inputs de fecha
  // · Pre-rellena solo la hora (igual que el dashboard: la fecha la elige el usuario)
  // · Lee el lavado pendiente guardado por ServiciosLimpieza
  // · Re-sincroniza "hoy" si la pestaña queda abierta hasta el día siguiente
  useEffect(() => {
    function actualizarHoy() {
      const todayStr   = aFechaInput(new Date());
      const slotInicio = getNearestSlot();
      setHoy(todayStr);
      // Solo pre-rellena la hora de entrada; la fecha la elige el usuario
      setReserva(r => ({
        ...r,
        entryTime: r.entryTime || slotInicio,
      }));
    }

    actualizarHoy();

    // Lee el servicio de lavado guardado por ServiciosLimpieza (si el usuario
    // ya había hecho clic antes de que el form montara, p. ej. vuelve con Atrás)
    const lid    = sessionStorage.getItem("lavado_id");
    const lnomb  = sessionStorage.getItem("lavado_nombre");
    const lprec  = sessionStorage.getItem("lavado_precio");
    if (lid && lnomb) setLavado({ id: Number(lid), nombre: lnomb, precio: lprec ?? "" });

    // Escucha el evento en tiempo real: cuando el usuario hace clic en "Solicitar"
    // en la sección de lavado DESPUÉS de que este form ya montó
    const onLavado = (e: Event) => {
      const { id, nombre, precio } = (e as CustomEvent<{ id: number; nombre: string; precio: string }>).detail;
      setLavado({ id: Number(id), nombre, precio });
    };
    window.addEventListener("lavado-seleccionado", onLavado);

    // Re-sync "hoy" cuando el usuario vuelve a la pestaña o desde bfcache
    const onVisibility = () => {
      if (document.visibilityState === "visible") setHoy(aFechaInput(new Date()));
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setHoy(aFechaInput(new Date()));
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("lavado-seleccionado", onLavado);
    };
  }, []);

  // Difunde el tipo de vehículo para que otras secciones (ServiciosLimpieza)
  // puedan adaptar su texto (p. ej. ocultar "interior" en autocaravana).
  useEffect(() => {
    sessionStorage.setItem("vehiculo", reserva.vehiculo);
    window.dispatchEvent(new CustomEvent("vehiculo-cambiado", { detail: reserva.vehiculo }));
  }, [reserva.vehiculo]);

  // Recalcula precio desde la BD cuando cambian fechas u horas
  useEffect(() => {
    const entrada = new Date(`${reserva.entryDate}T${reserva.entryTime}`);
    const salida  = new Date(`${reserva.exitDate}T${reserva.exitTime}`);

    if (!Number.isFinite(entrada.getTime()) || !Number.isFinite(salida.getTime())) {
      setCalculo(null);
      return;
    }

    const dias      = calculateRawParkingDays(entrada, salida);
    const nocturno  = aplicaNocturnidad(reserva.entryTime, reserva.exitTime);

    if (dias <= 0) {
      setCalculo(null);
      return;
    }

    setCargando(true);
    const vehiculoParam = reserva.vehiculo === "autocaravana" ? "&vehiculo=autocaravana" : "";
    fetch(`/api/precio?dias=${dias}${nocturno ? "&nocturno=1" : ""}${vehiculoParam}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error en la respuesta del servidor");
        return r.json();
      })
      .then((data: { costo_parking: number; costo_seguro: number; costo_nocturnidad: number; costo_autocaravana: number; total: number }) => {
        setCalculo({
          dias,
          costoParking:     data.costo_parking,
          costoSeguro:      data.costo_seguro,
          costoNocturnidad: nocturno ? data.costo_nocturnidad : 0,
          costoAutocaravana: data.costo_autocaravana ?? 0,
          total:            data.total,
        });
      })
      .catch(() => setCalculo(null))
      .finally(() => setCargando(false));
  }, [reserva.entryDate, reserva.entryTime, reserva.exitDate, reserva.exitTime, reserva.vehiculo]);

  function actualizar(campo: keyof DatosReserva, valor: string) {
    setReserva((r) => {
      const nuevo = { ...r, [campo]: valor };

      // Si la fecha de entrada cambia a hoy → asegura que la hora no sea pasada
      if (campo === "entryDate" && valor === hoy) {
        const minSlot = getNearestSlot();
        if (!r.entryTime || r.entryTime < minSlot) {
          nuevo.entryTime = minSlot;
        }
      }

      // Si la nueva fecha de entrada es posterior a la salida, adelanta la salida
      if (campo === "entryDate" && valor > r.exitDate) {
        nuevo.exitDate = valor;
      }

      return nuevo;
    });
  }

  // Opciones de hora de entrada: si la fecha es hoy, solo muestra slots futuros
  const opcionesHoraEntrada = (reserva.entryDate === hoy && hoy)
    ? OPCIONES_HORA.filter(h => h >= getNearestSlot())
    : OPCIONES_HORA;

  function verPlanes() {
    if (!reserva.entryDate || !reserva.exitDate) {
      alert("Por favor selecciona las fechas de entrada y salida.");
      return;
    }
    if (!calculo) {
      alert("Por favor revisa las fechas de entrada y salida.");
      return;
    }
    const nocturno = calculo.costoNocturnidad > 0;
    const params = new URLSearchParams({
      entryDate:       reserva.entryDate,
      entryTime:       reserva.entryTime,
      exitDate:        reserva.exitDate,
      exitTime:        reserva.exitTime,
      terminalEntrada: reserva.terminalEntrada,
      terminalSalida:  reserva.terminalSalida,
      vehiculo:        reserva.vehiculo,
      dias:            String(calculo.dias),
      nocturno:        nocturno ? "1" : "0",
      baseTotal:       String(calculo.total),
      ...(lavado ? { lavadoId: String(lavado.id), lavadoNombre: lavado.nombre } : {}),
    });
    router.push(`/planes?${params.toString()}`);
  }

  const isNocturno = calculo ? calculo.costoNocturnidad > 0 : false;

  return (
    <>
      <div className="bform-card">

        {/* ── Cabecera ── */}
        <div className="bform-header">
          <p className="bform-subtitle">
            Calcula tu precio y reserva en menos de 1 minuto.
          </p>
          <div className="bform-trust-badge">
            <LockIcon /> Sin pago anticipado
          </div>
        </div>

        {/* ── Campos ── */}
        <div className="bform-fields">
          {/* Fila 1: entrada */}
          <div className="bform-field">
            <span className="bform-label">Fecha de entrada</span>
            <div className="bform-icon-wrap">
              <span className="bform-field-icon"><CalendarIcon /></span>
              <DatePicker
                value={reserva.entryDate}
                min={hoy}
                onChange={(v) => actualizar("entryDate", v)}
                ariaLabel="Fecha de entrada"
                title="Fecha de entrada"
                placeholder="Entrada"
              />
            </div>
          </div>

          <div className="bform-field">
            <span className="bform-label">Hora de entrada</span>
            <div className="bform-icon-wrap">
              <span className="bform-field-icon"><ClockIcon /></span>
              <Select
                ariaLabel="Hora de entrada"
                value={reserva.entryTime}
                opciones={opcionesHoraEntrada}
                onChange={(v) => actualizar("entryTime", v)}
              />
            </div>
          </div>

          {/* Fila 2: salida */}
          <div className="bform-field">
            <span className="bform-label">Fecha de salida</span>
            <div className="bform-icon-wrap">
              <span className="bform-field-icon"><CalendarIcon /></span>
              <DatePicker
                value={reserva.exitDate}
                min={reserva.entryDate || hoy}
                onChange={(v) => actualizar("exitDate", v)}
                ariaLabel="Fecha de salida"
                title="Fecha de salida"
                placeholder="Salida"
              />
            </div>
          </div>

          <div className="bform-field">
            <span className="bform-label">Hora de salida</span>
            <div className="bform-icon-wrap">
              <span className="bform-field-icon"><ClockIcon /></span>
              <Select
                ariaLabel="Hora de salida"
                value={reserva.exitTime}
                opciones={OPCIONES_HORA}
                onChange={(v) => actualizar("exitTime", v)}
              />
            </div>
          </div>

          {/* Fila 3: terminales */}
          <div className="bform-field">
            <span className="bform-label">Terminal de entrada</span>
            <div className="bform-icon-wrap">
              <span className="bform-field-icon"><PlaneIcon /></span>
              <Select
                ariaLabel="Terminal de entrada"
                value={reserva.terminalEntrada}
                opciones={OPCIONES_TERMINAL}
                onChange={(v) => actualizar("terminalEntrada", v)}
              />
            </div>
          </div>

          <div className="bform-field">
            <span className="bform-label">Terminal de salida</span>
            <div className="bform-icon-wrap">
              <span className="bform-field-icon"><PlaneIcon /></span>
              <Select
                ariaLabel="Terminal de salida"
                value={reserva.terminalSalida}
                opciones={OPCIONES_TERMINAL}
                onChange={(v) => actualizar("terminalSalida", v)}
              />
            </div>
          </div>

          {/* Fila 4: tipo de vehículo — ocupa todo el ancho */}
          <div className="bform-field" style={{ gridColumn: "1 / -1" }}>
            <span className="bform-label">Tipo de vehículo</span>
            <div className="bform-vehicle-toggle" role="radiogroup" aria-label="Tipo de vehículo">
              <button
                type="button"
                className={reserva.vehiculo === "car" ? "active" : ""}
                onClick={() => actualizar("vehiculo", "car")}
                aria-pressed={reserva.vehiculo === "car"}
              >
                🚗 Coche
              </button>
              <button
                type="button"
                className={reserva.vehiculo === "autocaravana" ? "active" : ""}
                onClick={() => actualizar("vehiculo", "autocaravana")}
                aria-pressed={reserva.vehiculo === "autocaravana"}
              >
                🚐 Autocaravana
              </button>
            </div>
          </div>
        </div>

        {/* ── Badge lavado seleccionado ── */}
        {lavado && (
          <div className="bform-lavado-badge">
            <span>🧹 {lavado.nombre} · {lavado.precio}</span>
            <button
              type="button"
              className="bform-lavado-remove"
              aria-label="Quitar servicio de lavado"
              onClick={() => {
                setLavado(null);
                sessionStorage.removeItem("lavado_id");
                sessionStorage.removeItem("lavado_nombre");
                sessionStorage.removeItem("lavado_precio");
              }}
            >✕</button>
          </div>
        )}

        {/* ── Aviso nocturnidad ── */}
        {isNocturno && (
          <div className="bform-nocturno-aviso">
            🌙 Se aplica recargo nocturno de {formatoEuros(calculo!.costoNocturnidad)} por horario entre las 00:30 y las 03:30
          </div>
        )}

        {/* ── Aviso recargo autocaravana ── */}
        {calculo && calculo.costoAutocaravana > 0 && (
          <div className="bform-nocturno-aviso">
            🚐 Se aplica recargo de autocaravana de {formatoEuros(calculo.costoAutocaravana)} ({calculo.dias} {calculo.dias === 1 ? "día" : "días"})
          </div>
        )}

        {/* ── Caja de precio ── */}
        <div className="bform-price-box">
          <div className="bform-price-left">
            <div className="bform-price-label">Precio estimado</div>
            <div className="bform-price-amount">
              {!reserva.entryDate || !reserva.exitDate
                ? "—"
                : cargando ? "…" : calculo ? formatoEuros(calculo.total) : "—"}
            </div>
            <div className="bform-price-iva">IVA incluido</div>
          </div>
          <div className="bform-price-divider" />
          <div className="bform-price-right">
            <div className="bform-price-days">
              {calculo ? calculo.dias : "—"}{" "}
              <span className="bform-price-days-unit">días</span>
            </div>
            <div className="bform-price-days-label">de estancia</div>
          </div>
        </div>

        {/* ── Botón CTA ── */}
        <button
          className="bform-cta"
          onClick={verPlanes}
          disabled={cargando && !!(reserva.entryDate && reserva.exitDate)}
          type="button"
        >
          {!reserva.entryDate || !reserva.exitDate
            ? <>📅 Selecciona las fechas</>
            : <>VER DISPONIBILIDAD<br />Y RESERVAR</>}
        </button>

        {/* ── Nota de confianza ── */}
        <div className="bform-trust-note">
          <LockIcon />
          Sin pago anticipado · Confirmación rápida por WhatsApp
        </div>

      </div>

    </>
  );
}

/* ── Iconos SVG inline ──────────────────────────────── */

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.7 1l.8 1.8c.2.5.6.8 1.1.8h2.8l-1.7 3.9c-.1.4.1.8.5 1.1l2.1 1.5c.4.3.9.3 1.3 0l3.9-2.8v2.8c0 .5.3.9.8 1.1l1.8.8c.5.2.9-.2 1-.7z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
