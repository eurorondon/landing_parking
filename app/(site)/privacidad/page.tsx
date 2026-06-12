import Link from "next/link";
import { NEGOCIO } from "@/lib/config";

export const metadata = { title: `Política de privacidad | ${NEGOCIO.nombre}` };

/**
 * ⚠️ CAMBIAR: esta es una plantilla orientativa. El texto legal
 * definitivo debe redactarlo/revisarlo un asesor legal con los
 * datos fiscales reales del negocio (razón social, NIF, etc.).
 */
export default function Privacidad() {
  return (
    <main className="container" style={{ maxWidth: 760, padding: "80px 0" }}>
      <Link href="/" style={{ color: "var(--orange-dark)", fontWeight: 600, fontSize: 14 }}>
        ← Volver al inicio
      </Link>
      <h1 className="section-title" style={{ marginTop: 24 }}>
        Política de privacidad
      </h1>
      <div className="section-text" style={{ fontSize: 16, display: "grid", gap: 16 }}>
        <p>
          En {NEGOCIO.nombre} tratamos los datos personales que nos facilitas al
          realizar una reserva (nombre, correo electrónico, teléfono, matrícula
          y modelo del vehículo) con la única finalidad de gestionar el servicio
          de aparcamiento solicitado.
        </p>
        <p>
          Responsable del tratamiento: {NEGOCIO.nombre} — {NEGOCIO.direccion}.
          {/* ⚠️ CAMBIAR: añadir razón social y NIF reales */}
        </p>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación y supresión
          escribiendo a {NEGOCIO.emailContacto}.
        </p>
        <p>
          No cedemos tus datos a terceros ni los utilizamos con fines
          publicitarios.
        </p>
      </div>
    </main>
  );
}
