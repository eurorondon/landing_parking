import BookingForm from "./BookingForm";

export default function Hero() {
  return (
    <section className="hero" id="reserva">
      <div className="container hero-grid">
        <div>
          <div className="eyebrow">✦ Parking para viajeros desde Madrid-Barajas</div>
          <h1>
            Tu viaje empieza <span>sin estrés</span> desde el parking.
          </h1>
          <p>
            Reserva en menos de un minuto, entrega tu coche en la terminal y
            viaja con la tranquilidad de dejarlo en buenas manos.
          </p>
          <div className="chips">
            <span className="chip">✓ Entrega en terminal</span>
            <span className="chip">✓ Servicio 24 horas</span>
            <span className="chip">✓ Parking vigilado</span>
            <span className="chip">✓ Sin pago anticipado</span>
            <span className="chip">✓ Confirmación rápida</span>
          </div>
          <div className="hero-actions">
            <a href="#reserva" className="btn btn-primary">
              Calcular mi precio
            </a>
            <a href="#como-funciona" className="btn btn-ghost">
              Ver cómo funciona
            </a>
          </div>
        </div>

        <BookingForm />
      </div>
    </section>
  );
}
