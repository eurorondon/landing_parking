"use client";

import { useEffect, useRef } from "react";

const stats = [
  { numero: "T1 · T2 · T4", etiqueta: "Entrega en terminal" },
  { numero: "24/7", etiqueta: "Atención al cliente" },
  { numero: "<60 seg", etiqueta: "Para completar la reserva" },
  { numero: "0 €", etiqueta: "De pago anticipado" },
];

export default function TrustBar() {
  const ref = useRef<HTMLDivElement>(null);

  // Animación de aparición al hacer scroll (clases .reveal → .visible)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    ref.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div id="trust" ref={ref}>
      <div className="container trust-inner">
        {stats.map((s, i) => (
          <span key={s.numero} style={{ display: "contents" }}>
            {i > 0 && <div className="trust-divider" />}
            <div className={`trust-stat reveal${i > 0 ? ` reveal-delay-${i}` : ""}`}>
              <div className="trust-number">{s.numero}</div>
              <div className="trust-label">{s.etiqueta}</div>
            </div>
          </span>
        ))}
      </div>
    </div>
  );
}
