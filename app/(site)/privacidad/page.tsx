import Link from "next/link";
import { NEGOCIO } from "@/lib/config";

export const metadata = {
  title: `Política de privacidad | ${NEGOCIO.nombre}`,
};

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
            ParkingAeroMadrid.es
          </p>
          <p style={{ color: "rgba(255,255,255,.8)", lineHeight: 1.72, fontSize: 15 }}>
            En cumplimiento del Reglamento General de Protección de Datos (RGPD) y
            la Ley Orgánica de Protección de Datos (LOPDGDD), le informamos de
            cómo tratamos los datos personales recogidos a través de este sitio web.
          </p>
        </div>

        {/* Acordeón de secciones */}
        <div style={{ display: "grid", gap: 10 }}>

          {/* Responsable */}
          <details open>
            <summary>RESPONSABLE DEL TRATAMIENTO</summary>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              {[
                ["Responsable:", "Administración de la web ParkingAeroMadrid.es"],
                ["Contacto:", NEGOCIO.emailContacto],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 14, margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          </details>

          {/* Finalidad */}
          <details>
            <summary>FINALIDAD DEL TRATAMIENTO</summary>
            <p>
              Los datos personales facilitados a través de esta web se utilizan
              para <strong>gestionar reservas y responder solicitudes</strong> enviadas
              por WhatsApp o a través del formulario de contacto.
            </p>
            <p style={{ marginTop: 10 }}>
              Los datos podrán ser comunicados a <strong>Parking Plus</strong> exclusivamente
              para gestionar la reserva solicitada por el usuario.
            </p>
          </details>

          {/* Datos bancarios */}
          <details>
            <summary>PAGOS Y DATOS BANCARIOS</summary>
            <p>
              Este sitio web <strong>no utiliza pasarelas de pago ni almacena datos
              bancarios</strong>. El pago del servicio se realiza directamente al
              titular del parking (Parking Plus), quien emite la correspondiente
              factura al cliente.
            </p>
          </details>

          {/* Derechos */}
          <details>
            <summary>SUS DERECHOS</summary>
            <p>
              El usuario puede solicitar en cualquier momento el <strong>acceso,
              modificación o eliminación</strong> de sus datos personales escribiendo
              al correo:{" "}
              <a href={`mailto:${NEGOCIO.emailContacto}`} style={{ color: "var(--orange)" }}>
                {NEGOCIO.emailContacto}
              </a>
            </p>
            <p style={{ marginTop: 10 }}>
              Asimismo, si considera que sus derechos no han sido atendidos,
              puede presentar una reclamación ante la{" "}
              <strong>Agencia Española de Protección de Datos</strong> (
              <a href="https://www.aepd.es" target="_blank" rel="noreferrer" style={{ color: "var(--orange)" }}>
                www.aepd.es
              </a>
              ).
            </p>

            {[
              { label: "Sede electrónica:", value: "www.aepd.es" },
              { label: "Dirección postal:", value: "C/ Jorge Juan, 6 · 28001 Madrid" },
              { label: "Vía telefónica:", value: "901 100 099 / 91 266 35 17" },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  borderLeft: "3px solid rgba(255,149,0,.35)",
                  paddingLeft: 16,
                  margin: "14px 0",
                }}
              >
                <p style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 4 }}>{label}</p>
                <p style={{ margin: 0, fontSize: 14 }}>{value}</p>
              </div>
            ))}
          </details>

          {/* Conservación */}
          <details>
            <summary>CONSERVACIÓN DE LOS DATOS</summary>
            <p>
              Los datos se conservarán durante el tiempo necesario para la
              gestión de la reserva o consulta, y mientras lo exijan las
              obligaciones legales aplicables. Una vez finalizado ese plazo,
              serán eliminados de forma segura.
            </p>
          </details>

          {/* Analítica y grabación de sesiones */}
          <details>
            <summary>ANALÍTICA WEB Y GRABACIÓN DE SESIONES (MICROSOFT CLARITY)</summary>
            <p>
              Si aceptas las cookies con <strong>«Aceptar todo»</strong>, utilizamos{" "}
              <strong>Microsoft Clarity</strong>, un servicio de Microsoft Corporation,
              para ver cómo usas y te desenvuelves en nuestra web mediante métricas de
              comportamiento, mapas de calor y reproducciones de sesión. Lo hacemos para
              mejorar la usabilidad de la página y detectar errores, y se basa en
              cookies propias y de terceros (consulta la{" "}
              <Link href="/cookies" style={{ color: "var(--orange)" }}>Política de cookies</Link>).
            </p>
            <p style={{ marginTop: 10 }}>
              <strong>Base legitimadora:</strong> tu consentimiento (art. 6.1.a RGPD),
              que otorgas con «Aceptar todo» y puedes retirar en cualquier momento
              escribiendo a{" "}
              <a href={`mailto:${NEGOCIO.emailContacto}`} style={{ color: "var(--orange)" }}>
                {NEGOCIO.emailContacto}
              </a>{" "}
              o borrando las cookies de tu navegador. Si eliges «Solo esenciales», esta
              herramienta no se activa.
            </p>
            <p style={{ marginTop: 10 }}>
              <strong>Qué no se recoge:</strong> los campos de los formularios de reserva
              (nombre, teléfono, correo, matrícula y modelo del vehículo) se ocultan en
              las grabaciones.
            </p>
            <p style={{ marginTop: 10 }}>
              <strong>Conservación:</strong> según Microsoft, las grabaciones se conservan
              30 días y los datos agregados de clics y las sesiones marcadas, hasta 9 meses.
            </p>
            <p style={{ marginTop: 10 }}>
              Más información sobre cómo Microsoft trata los datos en su{" "}
              <a
                href="https://www.microsoft.com/privacy/privacystatement"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--orange)" }}
              >
                declaración de privacidad
              </a>.
            </p>
          </details>

          {/* Transferencias internacionales */}
          <details>
            <summary>TRANSFERENCIAS INTERNACIONALES</summary>
            <p>
              Nuestra política es no enviar fuera del Espacio Económico Europeo los
              datos personales que facilitas para gestionar tu reserva. En caso de que
              fuera necesario, se informará previamente al usuario y se aplicarán las
              garantías legales pertinentes.
            </p>
            <p style={{ marginTop: 10 }}>
              No obstante, si aceptas las cookies de analítica, proveedores con sede en
              Estados Unidos como <strong>Google</strong> (Google Analytics) y{" "}
              <strong>Microsoft</strong> (Clarity) pueden tratar datos de uso de tu
              navegación fuera del Espacio Económico Europeo, con las garantías
              previstas por cada proveedor (por ejemplo, cláusulas contractuales tipo
              o el Marco de Privacidad de Datos UE–EE. UU.).
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
