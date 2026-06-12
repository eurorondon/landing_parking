export default function HowItWorks() {
  return (
    <section id="como-funciona">
      <div className="container dark-panel">
        <div className="dark-grid">
          <div>
            <div className="section-kicker">Cómo funciona</div>
            <h2>Reservar no debería ser complicado.</h2>
            <p>
              En tres pasos tienes tu parking organizado para llegar al
              aeropuerto sin carreras, sin estrés y sin sorpresas.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div>
                <h3>Elige tus fechas</h3>
                <p>Selecciona entrada, salida, hora y terminal desde el calculador.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div>
                <h3>Completa tus datos</h3>
                <p>Verás el precio estimado y dejarás tu reserva preparada.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div>
                <h3>Entrega y viaja</h3>
                <p>Deja tu coche en la terminal y empieza tu viaje con tranquilidad.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
