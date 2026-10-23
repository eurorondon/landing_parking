import Link from "next/link";
import { NEGOCIO } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `Política de cookies | ${NEGOCIO.nombre}`,
  description:
    "Qué cookies usa parkingaeromadrid.es, para qué sirven y cómo aceptarlas, rechazarlas o configurarlas desde tu navegador y desde nuestro banner.",
  path: "/cookies/",
});

const BROWSERS = [
  { name: "Chrome",  url: "https://support.google.com/chrome/answer/95647?hl=es" },
  { name: "Firefox", url: "https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" },
  { name: "Safari",  url: "https://support.apple.com/es-es/guide/safari/sfri11471/mac" },
  { name: "Edge",    url: "https://support.microsoft.com/es-es/microsoft-edge" },
];

const COOKIE_GROUPS = [
  {
    title: "Cookies técnicas (siempre activas)",
    items: [
      { name: "Cookie de consentimiento", provider: "ParkingAeroMadrid", purpose: "guardar tu elección sobre las cookies", duration: "12 meses" },
    ],
  },
  {
    title: "Cookies analíticas (solo si las aceptas)",
    items: [
      { name: "_ga", provider: "Google Ireland Ltd.", purpose: "distinguir usuarios en Google Analytics", duration: "2 años" },
      { name: "_ga_[ID]", provider: "Google Ireland Ltd.", purpose: "mantener el estado de la sesión en Google Analytics", duration: "2 años" },
      { name: "_clck", provider: "Microsoft", purpose: "identificador seudónimo de Clarity", duration: "1 año" },
      { name: "_clsk", provider: "Microsoft", purpose: "unir las páginas vistas en una misma sesión", duration: "1 día" },
      { name: "CLID y MUID", provider: "Microsoft", purpose: "identificar el navegador en Clarity", duration: "1 año" },
      { name: "ANONCHK, MR y SM", provider: "Microsoft", purpose: "funcionamiento interno de Clarity", duration: "desde la sesión hasta 7 días" },
    ],
  },
  {
    title: "Cookies publicitarias (solo si las aceptas)",
    items: [
      { name: "_gcl_au", provider: "Google Ireland Ltd.", purpose: "medir las reservas que llegan desde los anuncios de Google Ads", duration: "90 días" },
    ],
  },
];

export default function PoliticaCookies() {
  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 800, paddingTop: 100 }}>

        {/* Volver */}
        <Link
          href="/"
          style={{ color: "var(--orange)", fontWeight: 600, fontSize: 14, display: "inline-block", marginBottom: 32 }}
        >
          ← Volver al inicio
        </Link>

        {/* Cabecera */}
        <div style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "32px 36px",
          marginBottom: 32,
        }}>
          <p style={{ color: "var(--orange)", fontWeight: 700, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>
            LSSI · Normativa de cookies
          </p>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, letterSpacing: "-.03em", color: "#fff", margin: "0 0 6px" }}>
            Política de <span style={{ color: "var(--orange)" }}>Cookies</span>
          </h1>
          <p style={{ fontSize: 14, color: "#fff", margin: 0 }}>
            Última actualización: 17 de octubre de 2026
          </p>
        </div>

        {/* Acordeón */}
        <div style={{ display: "grid", gap: 10 }}>

          <details>
            <summary>1. TITULAR</summary>
            <p>
              Esta web es titularidad de <strong style={{ color: "#fff" }}>GLOBAL SOLUCION MARICHAL, S.L.</strong>{" "}
              (Sociedad Unipersonal), marca ParkingAeroMadrid, NIF B19765569, con domicilio en
              Calle Venus, 11, 1.º E, 28042 Madrid, inscrita en el Registro Mercantil de Madrid,
              hoja M-825952. Email:{" "}
              <a href="mailto:parkingaeromadrid@gmail.com" style={{ color: "var(--orange)" }}>
                parkingaeromadrid@gmail.com
              </a>.
            </p>
          </details>

          <details>
            <summary>2. QUÉ SON LAS COOKIES</summary>
            <p>
              Una cookie es un pequeño archivo que se guarda en tu dispositivo cuando visitas una web.
              Las cookies técnicas son necesarias para que la web funcione y no requieren tu
              consentimiento. Las cookies analíticas y publicitarias solo se instalan si las aceptas.
            </p>
          </details>

          <details>
            <summary>3. COOKIES QUE UTILIZA ESTA WEB</summary>
            {COOKIE_GROUPS.map(({ title, items }) => (
              <div
                key={title}
                style={{ borderLeft: "3px solid rgba(255,149,0,.35)", paddingLeft: 16, margin: "14px 0" }}
              >
                <p style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 8 }}>{title}</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                  {items.map(({ name, provider, purpose, duration }) => (
                    <li key={name} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--orange)", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                      <span style={{ fontSize: 14 }}>
                        <strong style={{ color: "#fff" }}>{name}.</strong>{" "}
                        Proveedor: {provider}. Finalidad: {purpose}. Duración: {duration}.
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </details>

          <details>
            <summary>4. CÓMO ACEPTAR, RECHAZAR O CAMBIAR TU ELECCIÓN</summary>
            <p>
              Al entrar por primera vez verás un aviso con dos opciones:{" "}
              <strong style={{ color: "#fff" }}>«Aceptar todo»</strong> o{" "}
              <strong style={{ color: "#fff" }}>«Solo esenciales»</strong>. Si eliges «Solo esenciales»,
              no se instala ninguna cookie analítica ni publicitaria.
            </p>
            <p style={{ marginTop: 10 }}>
              Puedes cambiar o retirar tu consentimiento en cualquier momento desde el enlace
              «Gestionar cookies» del pie de página.
            </p>
            <p style={{ marginTop: 10 }}>
              También puedes borrar o bloquear las cookies desde la configuración de tu navegador:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginTop: 10 }}>
              {BROWSERS.map(({ name, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cookie-browser-link"
                >
                  🔗 {name}
                </a>
              ))}
            </div>
          </details>

          <details>
            <summary>5. TRANSFERENCIAS INTERNACIONALES</summary>
            <p>
              Google y Microsoft pueden tratar datos fuera del Espacio Económico Europeo, con las
              garantías del Marco de Privacidad de Datos UE-EE. UU. Tienes más información en nuestra{" "}
              <Link href="/privacidad/" style={{ color: "var(--orange)" }}>
                Política de privacidad
              </Link>.
            </p>
          </details>

        </div>

        {/* Pie */}
        <p style={{ marginTop: 40, fontSize: 13, color: "#fff", textAlign: "center" }}>
          Contacto:{" "}
          <a href={`mailto:${NEGOCIO.emailContacto}`} style={{ color: "var(--orange)" }}>
            {NEGOCIO.emailContacto}
          </a>
          {" · "}
          <Link href="/privacidad/" style={{ color: "var(--orange)" }}>
            Política de privacidad
          </Link>
        </p>

      </div>
    </main>
  );
}
