import Link from "next/link";
import { NEGOCIO } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `Política de privacidad | ${NEGOCIO.nombre}`,
  description:
    "Cómo trata parkingaeromadrid.es tus datos personales: responsable, finalidades, base legal, destinatarios y cómo ejercer tus derechos RGPD.",
  path: "/privacidad/",
});

const RESPONSABLE: [string, string][] = [
  ["Razón social", "GLOBAL SOLUCION MARICHAL, S.L. (Sociedad Unipersonal), marca ParkingAeroMadrid"],
  ["NIF", "B19765569"],
  ["Domicilio", "Calle Venus, 11, 1.º E, 28042 Madrid"],
  ["Registro", "Inscrita en el Registro Mercantil de Madrid, hoja M-825952"],
  ["Email", "parkingaeromadrid@gmail.com"],
  ["Teléfono", "+34 632 868 936"],
];

const FINALIDADES = [
  {
    title: "a) Gestionar tu solicitud de reserva y transmitirla al prestador del servicio.",
    base: "aplicación de medidas precontractuales y ejecución del contrato (art. 6.1.b RGPD).",
    conservacion: "hasta finalizar el servicio y, después, durante los plazos de prescripción legal.",
  },
  {
    title: "b) Responder tus consultas por formulario, email o WhatsApp.",
    base: "atender tu solicitud (art. 6.1.b RGPD).",
    conservacion: "hasta resolver la consulta y un máximo de 12 meses.",
  },
  {
    title: "c) Analítica web (Google Analytics y Microsoft Clarity).",
    base: "tu consentimiento (art. 6.1.a RGPD).",
    conservacion: "la indicada en la Política de cookies.",
  },
  {
    title: "d) Medición y publicidad (Google Ads).",
    base: "tu consentimiento (art. 6.1.a RGPD).",
    conservacion: "la indicada en la Política de cookies.",
  },
  {
    title: "e) Cumplir obligaciones legales.",
    base: "obligación legal (art. 6.1.c RGPD).",
    conservacion: "los plazos que marque la ley.",
  },
];

const DESTINATARIOS = [
  "MARICHAL 4 PARKING SL (Parking Plus), CIF B88537345, prestador del servicio. Recibe los datos de tu reserva para ejecutarla, cobrarla y facturarla, y los trata como responsable independiente.",
  "Proveedores que nos prestan servicios y solo acceden a los datos por nuestra cuenta: nuestro proveedor de alojamiento web, Cloudflare (seguridad y entrega de la web), Google (Analytics y Ads), Microsoft (Clarity) y Meta (WhatsApp, si nos escribes por ese canal).",
  "Autoridades, cuando lo exija la ley.",
];

function DataList({ rows }: { rows: [string, string][] }) {
  return (
    <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
      {rows.map(([label, value]) => (
        <li key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color: "var(--orange)", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
          <span style={{ fontSize: 14 }}>
            <strong style={{ color: "#fff" }}>{label}:</strong> {value}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function Privacidad() {
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
            RGPD · Protección de datos
          </p>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, letterSpacing: "-.03em", color: "#fff", margin: "0 0 6px" }}>
            Política de Privacidad
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", margin: "0 0 24px" }}>
            Última actualización: 17 de octubre de 2026
          </p>
          <p style={{ color: "rgba(255,255,255,.8)", lineHeight: 1.72, fontSize: 15, margin: 0 }}>
            En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y de la Ley Orgánica 3/2018 de
            Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), te
            informamos de cómo tratamos tus datos personales.
          </p>
        </div>

        {/* Acordeón de secciones */}
        <div style={{ display: "grid", gap: 10 }}>

          <details open>
            <summary>1. RESPONSABLE DEL TRATAMIENTO</summary>
            <DataList rows={RESPONSABLE} />
          </details>

          <details>
            <summary>2. QUÉ DATOS TRATAMOS</summary>
            <p>
              Nombre, teléfono, email, matrícula y modelo del vehículo, fechas y horas de entrada y
              salida, terminal y, en su caso, número de vuelo. También datos de navegación si
              aceptas las cookies analíticas o publicitarias. No tratamos datos bancarios.
            </p>
          </details>

          <details>
            <summary>3. PARA QUÉ USAMOS TUS DATOS Y CON QUÉ BASE LEGAL</summary>
            {FINALIDADES.map(({ title, base, conservacion }) => (
              <div
                key={title}
                style={{ borderLeft: "3px solid rgba(255,149,0,.35)", paddingLeft: 16, margin: "14px 0" }}
              >
                <p style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 4 }}>{title}</p>
                <p style={{ margin: 0, fontSize: 14 }}>Base legal: {base}</p>
                <p style={{ margin: "4px 0 0", fontSize: 14 }}>Conservación: {conservacion}</p>
              </div>
            ))}
          </details>

          <details>
            <summary>4. MICROSOFT CLARITY</summary>
            <p>
              Si pulsas «Aceptar todo», usamos Microsoft Clarity para ver mapas de calor y
              grabaciones de sesión y así mejorar la web. Los campos de los formularios (nombre,
              teléfono, email, matrícula y modelo) se ocultan en las grabaciones. Según Microsoft,
              las grabaciones se conservan 30 días y los datos agregados hasta 9 meses. Si eliges
              «Solo esenciales», Clarity no se activa.
            </p>
          </details>

          <details>
            <summary>5. A QUIÉN COMUNICAMOS TUS DATOS</summary>
            <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
              {DESTINATARIOS.map((text) => (
                <li key={text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--orange)", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 14 }}>{text}</span>
                </li>
              ))}
            </ul>
          </details>

          <details>
            <summary>6. TRANSFERENCIAS INTERNACIONALES</summary>
            <p>
              Google, Microsoft y Meta pueden tratar datos fuera del Espacio Económico Europeo.
              Estas transferencias se amparan en el Marco de Privacidad de Datos UE-EE. UU. o en
              cláusulas contractuales tipo aprobadas por la Comisión Europea.
            </p>
          </details>

          <details>
            <summary>7. TUS DERECHOS</summary>
            <p>
              Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición,
              limitación del tratamiento y portabilidad, y retirar tu consentimiento en cualquier
              momento, escribiendo a{" "}
              <a href="mailto:parkingaeromadrid@gmail.com" style={{ color: "var(--orange)" }}>
                parkingaeromadrid@gmail.com
              </a>{" "}
              e indicando qué derecho quieres ejercer. Si necesitamos verificar tu identidad, te lo
              pediremos. Para los datos que trata el parking, también puedes dirigirte a MARICHAL 4
              PARKING SL (parkingplus01@gmail.com).
            </p>
            <p style={{ marginTop: 10 }}>
              Si consideras que no hemos atendido tus derechos, puedes presentar una reclamación
              ante la Agencia Española de Protección de Datos:{" "}
              <a href="https://www.aepd.es" target="_blank" rel="noreferrer" style={{ color: "var(--orange)" }}>
                www.aepd.es
              </a>
              , C/ Jorge Juan 6, 28001 Madrid.
            </p>
          </details>

          <details>
            <summary>8. SEGURIDAD</summary>
            <p>
              Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a
              pérdida, acceso no autorizado o alteración.
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
          <a href={NEGOCIO.telefonoHref} style={{ color: "var(--orange)" }}>
            {NEGOCIO.telefono}
          </a>
        </p>

      </div>
    </main>
  );
}
