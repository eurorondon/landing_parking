"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Rutas donde NO se muestra el banner */
const POLICY_PATHS = ["/privacidad", "/cookies", "/aviso-legal"];

const CONSENT_KEY = "cookie_consent";
const CONSENT_EXPIRY_MS = 365 * 24 * 60 * 60 * 1000; // 1 año

type ConsentValue = "granted" | "denied";

interface ConsentData {
  analytics: ConsentValue;
  marketing: ConsentValue;
  timestamp: number;
}

function saveConsent(data: ConsentData) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
}

function loadConsent(): ConsentData | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const data: ConsentData = JSON.parse(raw);
    if (Date.now() - data.timestamp > CONSENT_EXPIRY_MS) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/** ID del proyecto de Microsoft Clarity (grabaciones y mapas de calor) */
const CLARITY_ID = "yrkv325bdz";

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] };

/**
 * Microsoft Clarity: el script SOLO se carga cuando el usuario acepta las
 * cookies de analítica en este mismo banner. Clarity no lee el Consent Mode de
 * Google, así que se le pasa el estado con su Consent API v2 (las claves
 * `ad_Storage` y `analytics_Storage` distinguen mayúsculas).
 * Si el usuario rechaza y Clarity ya estaba cargado en esta sesión, se le avisa
 * para que deje de escribir cookies.
 */
function actualizarClarity(analytics: ConsentValue, marketing: ConsentValue) {
  if (typeof window === "undefined") return;
  const w = window as Window & { clarity?: ClarityFn };

  if (analytics !== "granted") {
    if (w.clarity) w.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
    return;
  }

  if (!w.clarity) {
    // Mismo stub que el snippet oficial: encola las llamadas hasta que cargue el script
    w.clarity = function () {
      // eslint-disable-next-line prefer-rest-params
      (w.clarity!.q = w.clarity!.q || []).push(arguments);
    } as ClarityFn;
  }
  if (!document.getElementById("clarity-script")) {
    const script = document.createElement("script");
    script.id = "clarity-script";
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
    document.head.appendChild(script);
  }
  w.clarity("consentv2", { ad_Storage: marketing, analytics_Storage: "granted" });
}

/** Notifica a GTM (y a Clarity) el estado de consentimiento */
function pushConsentUpdate(analytics: ConsentValue, marketing: ConsentValue) {
  if (typeof window === "undefined") return;
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("consent", "update", {
      analytics_storage: analytics,
      ad_storage: marketing,
      ad_user_data: marketing,
      ad_personalization: marketing,
    });
  }
  actualizarClarity(analytics, marketing);
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [configurando, setConfigurando] = useState(false);
  const [analitica, setAnalitica] = useState(false);
  const [publicidad, setPublicidad] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Con trailingSlash, usePathname devuelve p. ej. "/cookies/"
    if (POLICY_PATHS.includes(pathname.replace(/\/$/, ""))) {
      setVisible(false);
      return;
    }
    const stored = loadConsent();
    if (stored) {
      pushConsentUpdate(stored.analytics, stored.marketing);
    } else {
      setVisible(true);
    }
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  function guardar(analytics: ConsentValue, marketing: ConsentValue) {
    saveConsent({ analytics, marketing, timestamp: Date.now() });
    pushConsentUpdate(analytics, marketing);
    setVisible(false);
  }

  const acceptAll = () => guardar("granted", "granted");
  const rejectAll = () => guardar("denied", "denied");

  if (!visible) return null;

  const botonBase: React.CSSProperties = {
    flex: 1,
    minWidth: 120,
    padding: "12px 16px",
    borderRadius: 12,
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  };
  const botonSecundario: React.CSSProperties = {
    ...botonBase,
    border: "1.5px solid rgba(255,255,255,.25)",
    background: "transparent",
    color: "#fff",
  };
  const botonPrimario: React.CSSProperties = {
    ...botonBase,
    border: "none",
    background: "var(--orange)",
    color: "#000",
    fontWeight: 800,
  };

  return (
    <>
      {/* Overlay oscuro */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }} />

      {/* Banner */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Preferencias de cookies"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          zIndex: 9999,
          padding: "16px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          background: "#181818",
          border: "1px solid rgba(255,149,0,.25)",
          borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,.6)",
          padding: "22px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          {/* Texto */}
          <div>
            <p style={{ fontWeight: 800, color: "#fff", fontSize: 15, marginBottom: 6 }}>
              🍪 Usamos cookies
            </p>
            <p style={{ color: "#fff", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
              Utilizamos cookies propias y de terceros para analizar el uso del
              sitio y mejorar tu experiencia. Puedes aceptar todas, rechazarlas o
              elegir cuáles activar.{" "}
              <Link
                href="/cookies/"
                style={{ color: "var(--orange)", fontWeight: 600, textDecoration: "underline" }}
              >
                Política de cookies
              </Link>
              {" · "}
              <Link
                href="/privacidad/"
                style={{ color: "var(--orange)", fontWeight: 600, textDecoration: "underline" }}
              >
                Privacidad
              </Link>
            </p>
          </div>

          {/* Panel Configurar */}
          {configurando && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  titulo: "Necesarias",
                  texto: "Imprescindibles para que la web funcione. Siempre activas.",
                  valor: true,
                  fija: true,
                  cambiar: () => {},
                },
                {
                  titulo: "Analítica",
                  texto: "Google Analytics y Microsoft Clarity: nos ayudan a entender cómo se usa la web.",
                  valor: analitica,
                  fija: false,
                  cambiar: () => setAnalitica((v) => !v),
                },
                {
                  titulo: "Publicidad",
                  texto: "Google Ads: medir campañas y mostrar anuncios relevantes.",
                  valor: publicidad,
                  fija: false,
                  cambiar: () => setPublicidad((v) => !v),
                },
              ].map((c) => (
                <label
                  key={c.titulo}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 14px", borderRadius: 12,
                    background: "rgba(255,255,255,.05)",
                    cursor: c.fija ? "default" : "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={c.valor}
                    disabled={c.fija}
                    onChange={c.cambiar}
                    style={{ marginTop: 3, width: 18, height: 18, accentColor: "#FF9500" }}
                  />
                  <span style={{ color: "#fff", fontSize: 14, lineHeight: 1.5 }}>
                    <b>{c.titulo}</b>
                    <br />
                    <span style={{ color: "rgba(255,255,255,.75)" }}>{c.texto}</span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Botones */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={rejectAll} style={botonSecundario}>
              Rechazar
            </button>
            {configurando ? (
              <button
                onClick={() => guardar(analitica ? "granted" : "denied", publicidad ? "granted" : "denied")}
                style={botonSecundario}
              >
                Guardar selección
              </button>
            ) : (
              <button onClick={() => setConfigurando(true)} style={botonSecundario}>
                Configurar
              </button>
            )}
            <button onClick={acceptAll} style={botonPrimario}>
              Aceptar todo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
