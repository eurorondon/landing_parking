import { NEGOCIO } from "@/lib/config";

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
            {/* ⚠️ Los datos de contacto se cambian en lib/config.ts */}
            <h4>Contacto</h4>
            <p>Tel: {NEGOCIO.telefono}</p>
            <p>Email: {NEGOCIO.emailContacto}</p>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="/aviso-legal">Aviso legal</a>
            <a href="/privacidad">Privacidad</a>
          </div>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} {NEGOCIO.nombre}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
