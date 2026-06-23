"use client";

import { useState, useEffect } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Cierra el menú al hacer resize a escritorio
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 960px)");
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setMenuOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Bloquea el scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <header>
        <a href="#" className="brand" onClick={close}>
          <div className="logo-mark">✈</div>
          <span className="brand-name">{"parking"}<span style={{ color: "#FF9500" }}>{"aero"}</span>{"madrid.es"}</span>
        </a>

        {/* Navegación — visible solo en escritorio (CSS) */}
        <nav>
          <a href="/#como-funciona">Cómo funciona</a>
          <a href="/#ventajas">Ventajas</a>
          <a href="/parking-barajas/">Parking Barajas</a>
          <a href="/#faq">FAQ</a>
          <a href="/#contacto">Contacto</a>
        </nav>

        <div className="header-right">
          {/* Botón Reservar: oculto en móvil, visible en escritorio */}
          <a className="btn btn-primary header-btn-reservar" href="#calcular">
            Reservar
          </a>
          {/* Hamburguesa: visible en móvil, oculta en escritorio */}
          <button
            className={`hamburger${menuOpen ? " is-open" : ""}`}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* ── Menú móvil ── */}
      <div
        className={`mobile-nav-overlay${menuOpen ? " is-open" : ""}`}
        onClick={close}
        aria-hidden={!menuOpen}
      />
      <nav
        className={`mobile-nav${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <button className="mobile-nav-close" aria-label="Cerrar menú" onClick={close}>
          ✕
        </button>
        <a href="/#como-funciona" onClick={close}>Cómo funciona</a>
        <a href="/#ventajas" onClick={close}>Ventajas</a>
        <a href="/parking-barajas/" onClick={close}>Parking Barajas</a>
        <a href="/#faq" onClick={close}>FAQ</a>
        <a href="/#contacto" onClick={close}>Contacto</a>
        <a className="btn btn-primary" href="#calcular" onClick={close}>
          Reservar ahora
        </a>
      </nav>
    </>
  );
}
