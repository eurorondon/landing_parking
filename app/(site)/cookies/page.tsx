import Link from "next/link";
import { NEGOCIO } from "@/lib/config";

export const metadata = {
  title: `Política de cookies | ${NEGOCIO.nombre}`,
};

const BROWSERS = [
  { name: "Google Chrome",      url: "https://support.google.com/chrome/answer/95647?hl=es" },
  { name: "Mozilla Firefox",    url: "https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" },
  { name: "Internet Explorer",  url: "https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies" },
  { name: "Safari (Mac)",       url: "https://support.apple.com/es-es/guide/safari/sfri11471/mac" },
  { name: "Safari (iOS)",       url: "https://support.apple.com/es-es/HT201265" },
  { name: "Chrome para Android",url: "https://support.google.com/chrome/answer/95647?hl=es-419" },
];

const COOKIE_TYPES = [
  {
    title: "Cookies Técnicas",
    desc: "Son necesarias para que nuestra página web pueda funcionar, no necesitan de tu autorización y son las únicas que tenemos activadas por defecto.",
  },
  {
    title: "Cookies de Análisis",
    desc: "Nos permiten estudiar la navegación de los usuarios de nuestra página web en general (secciones más visitadas, servicios más usados, funcionamiento, etc.). A partir de esta información estadística mejoramos tanto la página como los distintos servicios que ofrece.",
  },
  {
    title: "Cookies de Funcionalidad y Personalización",
    desc: "Nos permiten recordar tus preferencias para personalizar determinadas características y opciones generales de nuestra página web cada vez que accedas a la misma.",
  },
  {
    title: "Cookies de Publicidad",
    desc: "Nos permiten la gestión de los espacios publicitarios incluidos en nuestra página web en base a criterios como el contenido mostrado o la frecuencia en la que se muestran los anuncios.",
  },
  {
    title: "Cookies de Publicidad Comportamental",
    desc: "Nos permiten obtener información basada en la observación de tus hábitos y comportamientos de navegación, a fin de poder mostrarte contenidos publicitarios que se ajusten mejor a tus gustos e intereses.",
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
            Política de <span style={{ color: "var(--orange)" }}>Uso de Cookies</span>
          </h1>
          <p style={{ fontSize: 14, color: "#fff", margin: "0 0 20px" }}>
            {NEGOCIO.razonSocial} &mdash; NIF {NEGOCIO.nif}
          </p>
          <p style={{ color: "#fff", lineHeight: 1.72, fontSize: 15, margin: 0 }}>
            Bienvenido/a a la POLÍTICA DE COOKIES de la página web de{" "}
            <strong style={{ color: "#fff" }}>{NEGOCIO.razonSocial}</strong>, donde te explicaremos
            en un lenguaje claro y sencillo todas las cuestiones necesarias para que
            puedas tener el control sobre ellas en base a tus decisiones personales.
          </p>
        </div>

        {/* Acordeón */}
        <div style={{ display: "grid", gap: 10 }}>

          <details>
            <summary>¿QUÉ SON LAS COOKIES Y PARA QUÉ LAS USAMOS?</summary>
            <p>
              Una cookie o galleta informática es un pequeño archivo de información
              que se guarda en tu ordenador, &ldquo;smartphone&rdquo; o tableta cada
              vez que visitas nuestra página web.
            </p>
            <p style={{ marginTop: 10 }}>
              En principio, una cookie es inofensiva: no contiene virus, troyanos,
              gusanos, etc. que puedan dañar tu terminal, pero sí tiene cierto impacto
              sobre tu derecho a la protección de tus datos personales, pues recoge
              determinada información concerniente a tu persona (hábitos de navegación,
              identidad, preferencias, etc.).
            </p>
            <p style={{ marginTop: 10 }}>
              Es por ello que, en base a lo establecido en la normativa aplicable
              (LSSI y normativa vigente de protección de datos personales), la
              activación de determinados tipos de cookies necesitará de tu autorización
              previa.
            </p>
          </details>

          <details>
            <summary>TIPOS DE COOKIES</summary>
            <p style={{ marginBottom: 14 }}>
              Las cookies pueden ser de varios tipos en función de su finalidad:
            </p>
            {COOKIE_TYPES.map(({ title, desc }) => (
              <div
                key={title}
                style={{ borderLeft: "3px solid rgba(255,149,0,.35)", paddingLeft: 16, margin: "12px 0" }}
              >
                <p style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 4 }}>{title}</p>
                <p style={{ margin: 0, fontSize: 14 }}>{desc}</p>
              </div>
            ))}
            <p style={{ marginTop: 14 }}>
              Algunas son <strong style={{ color: "#fff" }}>cookies propias</strong> y otras
              pertenecen a empresas externas (<strong style={{ color: "#fff" }}>cookies de terceros</strong>).
            </p>
            <p style={{ marginTop: 10 }}>
              En función del plazo de tiempo que permanecen activas:
            </p>
            <ul style={{ margin: "10px 0 0 0", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
              {[
                ["Cookies de sesión", "Expiran automáticamente cuando terminas la sesión en tu dispositivo."],
                ["Cookies persistentes", "Permanecen almacenadas durante un periodo determinado, desde unos minutos hasta varios años."],
              ].map(([term, def]) => (
                <li key={term} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--orange)", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 14 }}><strong style={{ color: "#fff" }}>{term}:</strong> {def}</span>
                </li>
              ))}
            </ul>
          </details>

          <details>
            <summary>¿QUÉ TIPO DE COOKIES SE UTILIZAN EN NUESTRA PÁGINA WEB?</summary>
            <div style={{ borderLeft: "3px solid rgba(255,149,0,.35)", paddingLeft: 16, margin: "12px 0" }}>
              <p style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 4 }}>Cookies Propias</p>
              <p style={{ margin: 0, fontSize: 14 }}>
                Son aquéllas que permiten al usuario la navegación a través de nuestra
                página web y la utilización de las diferentes opciones o servicios que
                en ella existan: controlar el tráfico, identificar la sesión, acceder a
                partes de acceso restringido, entre otros.
              </p>
            </div>
            <div style={{ borderLeft: "3px solid rgba(255,149,0,.35)", paddingLeft: 16, margin: "12px 0" }}>
              <p style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 4 }}>Cookies de Terceros</p>
              <p style={{ margin: 0, fontSize: 14 }}>
                En particular, este sitio web utiliza <strong style={{ color: "#fff" }}>Google Analytics</strong>,
                un servicio analítico prestado por Google, Inc. (1600 Amphitheatre Parkway,
                Mountain View, California 94043, EE.UU.).
              </p>
            </div>
          </details>

          <details>
            <summary>¿QUÉ PUEDES HACER CON LAS COOKIES?</summary>
            <p>
              Cuando accedes por primera vez a nuestra página web, se te muestra una
              ventana informativa sobre los tipos de cookies:
            </p>
            <ul style={{ margin: "12px 0", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
              <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "var(--orange)", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                <span style={{ fontSize: 14 }}>Las cookies técnicas son necesarias para el funcionamiento de la web y están activadas por defecto sin requerir autorización.</span>
              </li>
              <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "var(--orange)", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                <span style={{ fontSize: 14 }}>El resto sirven para mejorar la página o mostrarte publicidad ajustada. Puedes aceptar todas con <strong style={{ color: "#fff" }}>«Aceptar todo»</strong> o rechazarlas con <strong style={{ color: "#fff" }}>«Solo esenciales»</strong>.</span>
              </li>
            </ul>
            <p style={{ marginTop: 10 }}>
              Una vez tomada tu decisión, podrás cambiarla contactando con nosotros en{" "}
              <a href={`mailto:${NEGOCIO.emailContacto}`} style={{ color: "var(--orange)" }}>
                {NEGOCIO.emailContacto}
              </a>{" "}
              o borrando las cookies desde tu navegador.
            </p>
            <p style={{ marginTop: 10 }}>
              Recuerda también que, a través de la configuración de tu navegador, puedes
              bloquear o recibir alertas de la presencia de cookies, aunque esto puede
              afectar al correcto funcionamiento de las cookies técnicas necesarias.
            </p>

            {/* Links navegadores — solo con clase CSS, sin event handlers */}
            <p style={{ marginTop: 18, fontWeight: 700, color: "#fff", fontSize: 14 }}>
              Desactivar cookies en tu navegador:
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

            <p style={{ marginTop: 20, textAlign: "center", fontWeight: 600, color: "#fff", fontSize: 14 }}>
              Muchas gracias por tu colaboración.
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
          <Link href="/privacidad" style={{ color: "var(--orange)" }}>
            Política de privacidad
          </Link>
        </p>

      </div>
    </main>
  );
}
