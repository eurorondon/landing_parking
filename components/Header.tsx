import { NEGOCIO } from "@/lib/config";

export default function Header() {
  return (
    <header>
      <a href="#" className="brand">
        <div className="logo-mark">✈</div>
        <div>
          <strong>{NEGOCIO.nombre}</strong>
          <span>Barajas · Reserva rápida</span>
        </div>
      </a>
      <nav>
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#ventajas">Ventajas</a>
        <a href="#faq">FAQ</a>
        <a href="#contacto">Contacto</a>
      </nav>
      <a className="btn btn-primary" href="#reserva">
        Reservar
      </a>
    </header>
  );
}
