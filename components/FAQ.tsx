const preguntas = [
  {
    p: "¿Tengo que pagar por adelantado?",
    r: "No. Puedes dejar tu reserva preparada y pagar al entregar el vehículo, según las condiciones finales del parking.",
    abierta: true,
  },
  {
    p: "¿Dónde entrego el coche?",
    r: "La entrega se coordina en la terminal seleccionada: T1, T2, T3 o T4. Recibirás los detalles tras confirmar.",
  },
  {
    p: "¿Funciona de madrugada?",
    r: "Sí, el servicio está pensado para viajeros con vuelos en distintos horarios. Confirma tu hora exacta en la reserva.",
  },
  {
    p: "¿Puedo modificar mi reserva?",
    r: "Sí. Puedes solicitar cambios antes del viaje contactando al parking con los datos de tu reserva.",
  },
  {
    p: "¿Qué pasa si mi vuelo se retrasa?",
    r: "Comunica el cambio lo antes posible para ajustar la recogida de tu vehículo.",
  },
];

export default function FAQ() {
  return (
    <section id="faq">
      <div className="container faq">
        <div className="section-head">
          <div className="section-kicker">Preguntas frecuentes</div>
          <h2 className="section-title">Antes de reservar</h2>
          <p className="section-text">
            Respuestas rápidas para que reserves con confianza.
          </p>
        </div>
        <div>
          {preguntas.map((item) => (
            <details key={item.p} open={item.abierta}>
              <summary>{item.p}</summary>
              <p>{item.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
