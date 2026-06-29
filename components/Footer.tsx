import { NEGOCIO } from "@/lib/config";
import CookieResetButton from "@/components/CookieResetButton";

export default function Footer() {
  return (
    <footer id="contacto">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>{NEGOCIO.nombre}</h4>
            <p>
              Parking para viajeros del Aeropuerto Madrid-Barajas. Reserva
              rápida, entrega en terminal y servicio pensado para que viajes
              con tranquilidad.
            </p>
          </div>
          <div>
            <h4>Servicio</h4>
            <a href="#reserva">Reservar</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#ventajas">Ventajas</a>
          </div>
          <div>
            <h4>Parkings</h4>
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
            <h4>Contacto</h4>
            <p>Tel: {NEGOCIO.telefono}</p>
            <p>Email: {NEGOCIO.emailContacto}</p>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="/aviso-legal">Aviso legal</a>
            <a href="/privacidad">Privacidad</a>
            <a href="/cookies">Política de cookies</a>
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
