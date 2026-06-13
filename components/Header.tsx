export default function Header() {
  return (
    <header>
      <a href="#" className="brand">
        <div className="logo-mark">✈</div>
        <span className="brand-name">{"parking"}<span style={{ color: "#FF9500" }}>{"aero"}</span>{"madrid.es"}</span>
      </a>

      {/* Navegación — visible solo en escritorio (CSS) */}
      <nav>
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#ventajas">Ventajas</a>
        <a href="#faq">FAQ</a>
        <a href="#contacto">Contacto</a>
      </nav>

      <div className="header-right">
        {/* Botón Reservar: oculto en móvil, visible en escritorio */}
        <a className="btn btn-primary header-btn-reservar" href="#calcular">
          Reservar
        </a>
        {/* Hamburguesa: visible en móvil, oculta en escritorio */}
        <button className="hamburger" aria-label="Abrir menú">
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
