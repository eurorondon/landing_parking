import Link from "next/link";
import { NEGOCIO } from "@/lib/config";

export const metadata = { title: `Aviso legal | ${NEGOCIO.nombre}` };

export default function AvisoLegal() {
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
            Información legal
          </p>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, letterSpacing: "-.03em", color: "#fff", margin: "0 0 6px" }}>
            Aviso Legal
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", margin: "0 0 24px" }}>
            {NEGOCIO.nombre} &mdash; {NEGOCIO.direccion}
          </p>
          <p style={{ color: "rgba(255,255,255,.8)", lineHeight: 1.72, fontSize: 15 }}>
            Le informamos de las condiciones legales bajo las que se presta el servicio
            a través de este sitio web y la naturaleza de la relación entre esta
            plataforma y el prestador del servicio de estacionamiento.
          </p>
        </div>

        {/* Secciones */}
        <div style={{ display: "grid", gap: 10 }}>

          {/* Naturaleza del servicio */}
          <details open>
            <summary>NATURALEZA DE LA WEB Y DEL SERVICIO</summary>
            <p>
              Este sitio web tiene como finalidad la <strong>captación de clientes para
              servicios de parking prestados por terceros</strong>. El servicio de parking es
              prestado por <strong>Parking Plus</strong>, titular del recinto y responsable del
              servicio.
            </p>
            <p style={{ marginTop: 12 }}>
              Esta web actúa únicamente como <strong>canal de captación y gestión
              comercial de clientes</strong>, sin prestar directamente el servicio de
              estacionamiento.
            </p>
          </details>

          {/* Responsabilidad del servicio */}
          <details>
            <summary>RESPONSABILIDAD DEL SERVICIO</summary>
            <p>
              La responsabilidad del servicio, la <strong>custodia de los vehículos</strong> y
              las condiciones del parking recaen <strong>exclusivamente en el titular
              del parking</strong> (Parking Plus).
            </p>
            <p style={{ marginTop: 12 }}>
              Esta web no asume responsabilidad alguna por los daños, pérdidas o
              incidencias que pudieran producirse en relación con el servicio de
              estacionamiento, que es gestionado y ejecutado íntegramente por
              Parking Plus.
            </p>
          </details>

          {/* Pago y facturación */}
          <details>
            <summary>PAGO Y FACTURACIÓN</summary>
            <p>
              El pago del servicio se realiza <strong>directamente al titular del
              parking</strong> (Parking Plus), quien emite la correspondiente factura al
              cliente.
            </p>
            <p style={{ marginTop: 12 }}>
              Este sitio web <strong>no gestiona ni procesa pagos</strong> en su nombre ni
              actúa como intermediario financiero en la operación.
            </p>
          </details>

          {/* Gestión de reservas */}
          <details>
            <summary>GESTIÓN DE RESERVAS</summary>
            <p>
              Las reservas realizadas a través de esta web son gestionadas por
              <strong> Parking Plus</strong>, quien presta el servicio de
              <strong> estacionamiento, custodia y entrega de vehículos</strong>.
            </p>
            <p style={{ marginTop: 12 }}>
              Una vez confirmada la reserva, el cliente estará sujeto a las
              condiciones propias del servicio establecidas por Parking Plus como
              titular y responsable del recinto.
            </p>
          </details>

          {/* Propiedad intelectual */}
          <details>
            <summary>PROPIEDAD INTELECTUAL</summary>
            <p>
              Los contenidos de este sitio web (textos, imágenes, diseño y código)
              son propiedad de sus titulares y están protegidos por la legislación
              vigente en materia de propiedad intelectual e industrial.
            </p>
            <p style={{ marginTop: 12 }}>
              Queda prohibida su reproducción total o parcial sin autorización
              expresa y por escrito.
            </p>
          </details>

          {/* Contacto */}
          <details>
            <summary>CONTACTO</summary>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
              {[
                ["Web:", NEGOCIO.nombre],
                ["Email:", NEGOCIO.emailContacto],
                ["Teléfono:", NEGOCIO.telefono],
                ["Dirección:", NEGOCIO.direccion],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 14, margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          </details>

        </div>

        {/* Pie */}
        <p style={{ marginTop: 40, fontSize: 13, color: "rgba(255,255,255,.5)", textAlign: "center" }}>
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
