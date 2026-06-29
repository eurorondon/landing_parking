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

/** Notifica a GTM el estado de consentimiento */
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
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (POLICY_PATHS.includes(pathname)) {
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

  function acceptAll() {
    const data: ConsentData = { analytics: "granted", marketing: "granted", timestamp: Date.now() };
    saveConsent(data);
    pushConsentUpdate("granted", "granted");
    setVisible(false);
  }

  function rejectAll() {
    const data: ConsentData = { analytics: "denied", marketing: "denied", timestamp: Date.now() };
    saveConsent(data);
    pushConsentUpdate("denied", "denied");
    setVisible(false);
  }

  if (!visible) return null;

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
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        zIndex: 9999,
        padding: "16px",
        display: "flex",
        justifyContent: "center",
      }}>
        <div style={{
          width: "100%",
          maxWidth: 720,
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
              sitio y mejorar tu experiencia. Puedes aceptar todas o solo las
              esenciales.{" "}
              <Link
                href="/cookies"
                style={{ color: "var(--orange)", fontWeight: 600, textDecoration: "underline" }}
              >
                Política de cookies
              </Link>
              {" · "}
              <Link
                href="/privacidad"
                style={{ color: "var(--orange)", fontWeight: 600, textDecoration: "underline" }}
              >
                Privacidad
              </Link>
            </p>
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={rejectAll}
              style={{
                flex: 1,
                minWidth: 140,
                padding: "12px 20px",
                borderRadius: 12,
                border: "1.5px solid rgba(255,255,255,.25)",
                background: "transparent",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "background .2s, border-color .2s",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,.08)")}
              onMouseOut={e => (e.currentTarget.style.background = "transparent")}
            >
              Solo esenciales
            </button>
            <button
              onClick={acceptAll}
              style={{
                flex: 1,
                minWidth: 140,
                padding: "12px 20px",
                borderRadius: 12,
                border: "none",
                background: "var(--orange)",
                color: "#000",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                transition: "background .2s, transform .2s",
              }}
              onMouseOver={e => { e.currentTarget.style.background = "#d97700"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseOut={e => { e.currentTarget.style.background = "var(--orange)"; e.currentTarget.style.transform = "none"; }}
            >
              Aceptar todo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
