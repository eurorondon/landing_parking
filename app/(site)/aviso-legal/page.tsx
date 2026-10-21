import Link from "next/link";
import { NEGOCIO } from "@/lib/config";

export const metadata = { title: `Aviso legal | ${NEGOCIO.nombre}` };

const TITULAR: [string, string][] = [
  ["Razón social", "GLOBAL SOLUCION MARICHAL, S.L. (Sociedad Unipersonal)"],
  ["NIF", "B19765569"],
  ["Domicilio social", "Calle Venus, 11, 1.º E, 28042 Madrid"],
  ["Datos registrales", "inscrita en el Registro Mercantil de Madrid, hoja M-825952, tomo y folio electrónicos, inscripción 1.ª. EUID: ES28065.082268635"],
  ["Email", "parkingaeromadrid@gmail.com"],
  ["Teléfono", "+34 632 868 936"],
  ["Marca comercial", "ParkingAeroMadrid"],
];

const PRESTADOR: [string, string][] = [
  ["Razón social", "MARICHAL 4 PARKING SL"],
  ["Nombre comercial", "Parking Plus"],
  ["CIF", "B88537345"],
  ["Domicilio social", "Calle Playa de Riazor, 14, 28042 Madrid"],
  ["Email", "parkingplus01@gmail.com"],
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
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", margin: 0 }}>
            Última actualización: 17 de octubre de 2026
          </p>
        </div>

        {/* Secciones */}
        <div style={{ display: "grid", gap: 10 }}>

          <details open>
            <summary>1. TITULAR DEL SITIO WEB</summary>
            <p>
              En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la
              Información y de Comercio Electrónico (LSSI), se informa de que este sitio web es
              titularidad de:
            </p>
            <DataList rows={TITULAR} />
          </details>

          <details>
            <summary>2. NATURALEZA DE LA WEB: INTERMEDIARIO</summary>
            <p>
              ParkingAeroMadrid es una plataforma de intermediación. Su actividad consiste en dar a
              conocer el servicio de aparcamiento y recogida de vehículos en el Aeropuerto Adolfo
              Suárez Madrid-Barajas y en transmitir las solicitudes de reserva al prestador del
              servicio.
            </p>
            <p style={{ marginTop: 12 }}>
              GLOBAL SOLUCION MARICHAL, S.L. no presta el servicio de aparcamiento, no custodia
              vehículos, no cobra el servicio al cliente y no emite factura al cliente.
            </p>
          </details>

          <details>
            <summary>3. PRESTADOR DEL SERVICIO</summary>
            <p>
              El servicio de aparcamiento, traslado, custodia y entrega de vehículos lo presta,
              cobra, factura y asegura:
            </p>
            <DataList rows={PRESTADOR} />
            <p style={{ marginTop: 14 }}>
              Al confirmar una reserva, el contrato de servicio se celebra directamente entre el
              cliente y MARICHAL 4 PARKING SL, que fija las condiciones del servicio.
            </p>
          </details>

          <details>
            <summary>4. PAGO Y FACTURACIÓN</summary>
            <p>
              El cliente paga el servicio directamente a MARICHAL 4 PARKING SL en el momento de la
              entrega del vehículo. MARICHAL 4 PARKING SL emite la factura a nombre del cliente.
              Esta web no procesa pagos ni solicita datos bancarios.
            </p>
          </details>

          <details>
            <summary>5. SEGURO</summary>
            <p>
              Los vehículos están cubiertos por el seguro contratado por MARICHAL 4 PARKING SL como
              prestador del servicio. Cualquier incidencia o daño relacionado con el vehículo se
              tramita a través de MARICHAL 4 PARKING SL y su aseguradora.
            </p>
          </details>

          <details>
            <summary>6. RESPONSABILIDADES</summary>
            <p>
              GLOBAL SOLUCION MARICHAL, S.L. responde de la exactitud de la información publicada en
              esta web y de transmitir correctamente al prestador las reservas recibidas.
            </p>
            <p style={{ marginTop: 12 }}>
              MARICHAL 4 PARKING SL responde de la ejecución del servicio: recogida, traslado,
              custodia, conducción y entrega del vehículo, así como de los daños, pérdidas o retrasos
              derivados de dicha ejecución.
            </p>
            <p style={{ marginTop: 12 }}>
              Los precios mostrados son orientativos y los confirma el prestador del servicio en la
              confirmación de la reserva.
            </p>
          </details>

          <details>
            <summary>7. RECLAMACIONES</summary>
            <p>
              Las reclamaciones sobre el servicio de aparcamiento deben dirigirse a MARICHAL 4
              PARKING SL (parkingplus01@gmail.com), que dispone de hojas de reclamaciones oficiales.
              Las consultas sobre el funcionamiento de esta web pueden enviarse a
              parkingaeromadrid@gmail.com.
            </p>
          </details>

          <details>
            <summary>8. PROPIEDAD INTELECTUAL E INDUSTRIAL</summary>
            <p>
              Los textos, imágenes, diseño, código y la marca ParkingAeroMadrid son titularidad de
              GLOBAL SOLUCION MARICHAL, S.L. o se usan con autorización de sus titulares. Queda
              prohibida su reproducción total o parcial sin autorización escrita.
            </p>
          </details>

          <details>
            <summary>9. LEGISLACIÓN APLICABLE</summary>
            <p>
              Este aviso legal se rige por la legislación española. Cuando el usuario sea
              consumidor, serán competentes los juzgados de su domicilio, conforme a la normativa de
              consumo.
            </p>
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
