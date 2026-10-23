import Image from "next/image";
import { NEGOCIO } from "@/lib/config";
import CookieResetButton from "@/components/CookieResetButton";

export default function Footer() {
  return (
    <footer id="contacto">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Image
              src="/logo.jpg"
              alt="Parking Aero Madrid"
              width={64}
              height={64}
              style={{ borderRadius: 12, marginBottom: 12, display: "block" }}
            />
            <h3>{NEGOCIO.nombre}</h3>
            <p>
              Parking para viajeros del Aeropuerto Madrid-Barajas. Reserva
              rápida, entrega en terminal y servicio pensado para que viajes
              con tranquilidad.
            </p>
          </div>
          <div>
            <h3>Servicio</h3>
            <a href="/#calcular">Reservar</a>
            <a href="/#como-funciona">Cómo funciona</a>
            <a href="/#ventajas">Ventajas</a>
            <a href="/#faq">Preguntas frecuentes</a>
          </div>
          <div>
            <h3>Parkings</h3>
            <a href="/parking-barajas/">Parking Barajas</a>
            <a href="/parking-terminal-1-barajas/">Terminal 1</a>
            <a href="/parking-terminal-2-barajas/">Terminal 2</a>
            <a href="/parking-terminal-4-barajas/">Terminal 4</a>
            <a href="/parking-valet-aeropuerto-madrid/">Valet Parking</a>
            <a href="/parking-aeropuerto-madrid-barato/">Parking Barato</a>
            <a href="/parking-larga-estancia-aeropuerto-madrid/">Larga Estancia</a>
          </div>
          <div>
            {/* ⚠️ Los datos de contacto se cambian en lib/config.ts */}
            <h3>Contacto</h3>
            <p>Tel: {NEGOCIO.telefono}</p>
            <p>Email: {NEGOCIO.emailContacto}</p>
          </div>
          <div>
            <h3>Legal</h3>
            <a href="/aviso-legal/">Aviso legal</a>
            <a href="/privacidad/">Privacidad</a>
            <a href="/cookies/">Política de cookies</a>
            <CookieResetButton />
          </div>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} {NEGOCIO.nombre}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
