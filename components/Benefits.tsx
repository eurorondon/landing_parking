export default function Benefits() {
  return (
    <section id="ventajas">
      <div className="container">
        <div className="section-head center">
          <div className="section-kicker">Parking pensado para viajar</div>
          <h2 className="section-title">Más comodidad. Menos preocupaciones.</h2>
          <p className="section-text">
            No vienes a perder tiempo buscando aparcamiento. Vienes a dejar tu
            coche, llegar a tu vuelo y seguir con tu viaje.
          </p>
        </div>
        <div className="cards">
          <div className="card">
            <div className="icon">🚗</div>
            <h3>Entrega en terminal</h3>
            <p>
              Llegas al punto acordado, entregas tu vehículo y continúas hacia
              tu vuelo sin vueltas innecesarias.
            </p>
          </div>
          <div className="card">
            <div className="icon">🧳</div>
            <h3>Ideal con equipaje</h3>
            <p>
              Evita caminar largas distancias con maletas, niños o prisa.
              Hacemos que el inicio sea más fácil.
            </p>
          </div>
          <div className="card">
            <div className="icon">🔒</div>
            <h3>Tu coche protegido</h3>
            <p>
              Servicio pensado para que viajes con la tranquilidad de que tu
              vehículo está cuidado mientras estás fuera.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
