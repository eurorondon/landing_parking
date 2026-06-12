import Link from "next/link";
import { NEGOCIO } from "@/lib/config";

export const metadata = { title: `Aviso legal | ${NEGOCIO.nombre}` };

/**
 * ⚠️ CAMBIAR: plantilla orientativa. Completar con los datos
 * fiscales reales del negocio y revisar con un asesor legal.
 */
export default function AvisoLegal() {
  return (
    <main className="container" style={{ maxWidth: 760, padding: "80px 0" }}>
      <Link href="/" style={{ color: "var(--orange-dark)", fontWeight: 600, fontSize: 14 }}>
        ← Volver al inicio
      </Link>
      <h1 className="section-title" style={{ marginTop: 24 }}>
        Aviso legal
      </h1>
      <div className="section-text" style={{ fontSize: 16, display: "grid", gap: 16 }}>
        <p>
          Titular del sitio web: {NEGOCIO.nombre}.
          {/* ⚠️ CAMBIAR: razón social, NIF y domicilio fiscal reales */}
        </p>
        <p>Dirección: {NEGOCIO.direccion}</p>
        <p>
          Contacto: {NEGOCIO.emailContacto} · {NEGOCIO.telefono}
        </p>
        <p>
          El uso de este sitio web implica la aceptación de las condiciones de
          uso. Los contenidos de esta web (textos, diseño y código) son
          propiedad de su titular.
        </p>
      </div>
    </main>
  );
}
