"use client";

import { useEffect, useRef } from "react";

const features = [
  {
    icono: "🕒",
    titulo: "Servicio 24/7",
    texto: "Para vuelos de día o madrugada.",
  },
  { icono: "🔒", titulo: "Parking vigilado", texto: "Viaja con tranquilidad." },
  {
    icono: "⚡",
    titulo: "Confirmación rápida",
    texto: "Todo listo en minutos.",
  },
];

export default function TrustFeatures() {
  const ref = useRef<HTMLDivElement>(null);

  // Animación de aparición al hacer scroll (clases .reveal → .visible)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 },
    );
    ref.current
      ?.querySelectorAll(".reveal")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="features-bar" ref={ref}>
      <div className="container features-card">
        {features.map((f, i) => (
          <div
            key={f.titulo}
            className={`feature-item reveal${i > 0 ? ` reveal-delay-${i}` : ""}`}
          >
            <div className="feature-icon">{f.icono}</div>
            <b>{f.titulo}</b>
            <p>{f.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
