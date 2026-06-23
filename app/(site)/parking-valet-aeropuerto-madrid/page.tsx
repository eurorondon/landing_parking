import type { Metadata } from "next";
import LandingPageSEO from "@/components/LandingPageSEO";

export const metadata: Metadata = {
  title: "Parking Valet Aeropuerto Madrid | Entrega tu Coche en Terminal",
  description:
    "Reserva tu parking valet en el Aeropuerto Madrid-Barajas. Entrega y recogida de tu vehículo directamente en terminal, sin esperas y con vigilancia 24 horas.",
  alternates: { canonical: "https://parkingaeromadrid.es/parking-valet-aeropuerto-madrid/" },
  openGraph: {
    title: "Parking Valet Aeropuerto Madrid | Entrega tu Coche en Terminal",
    description:
      "Servicio valet premium en Barajas. Entregamos y recogemos tu coche en la terminal. Reserva online sin pago anticipado.",
    locale: "es_ES",
    type: "website",
  },
};

export default function ParkingValetPage() {
  return (
    <LandingPageSEO
      canonicalPath="/parking-valet-aeropuerto-madrid/"
      h1="Parking Valet Aeropuerto Madrid con Entrega y Recogida en Terminal"
      cta="Reserva tu parking valet y entrega tu coche directamente en la terminal."
      breadcrumb={[
        { name: "Inicio", item: "/" },
        { name: "Parking Barajas", item: "/parking-barajas/" },
        { name: "Parking Valet Aeropuerto Madrid", item: "/parking-valet-aeropuerto-madrid/" },
      ]}
      secciones={[
        {
          id: "que-es-valet",
          title: "Qué es el servicio valet en el Aeropuerto Madrid-Barajas",
          content: (
            <>
              <p>
                El <strong>parking valet en el Aeropuerto Madrid-Barajas</strong> es
                un servicio premium en el que un conductor profesional recoge tu
                vehículo directamente en la terminal de salida y lo devuelve en la
                terminal de llegada cuando regresas.
              </p>
              <p>
                A diferencia de un parking convencional, con el valet no tienes que
                buscar plaza, caminar hasta el aparcamiento ni esperar el bus
                lanzadera. Simplemente llegas, entregas tu coche y subes a tu vuelo.
              </p>
            </>
          ),
        },
        {
          id: "entrega-recogida",
          title: "Cómo funciona la entrega y recogida en terminal",
          content: (
            <>
              <p>
                El proceso de nuestro servicio{" "}
                <strong>valet en Madrid Barajas</strong> es sencillo:
              </p>
              <div className="seo-steps">
                {[
                  {
                    n: 1,
                    title: "Reserva online",
                    text: "Indica tus fechas, horarios y la terminal (T1, T2 o T4). Recibirás confirmación inmediata por WhatsApp.",
                  },
                  {
                    n: 2,
                    title: "Entrega en la terminal",
                    text: "El día del vuelo, un conductor te espera en el punto acordado de la terminal. Entregas las llaves y continúas hacia el check-in.",
                  },
                  {
                    n: 3,
                    title: "Recogida a tu vuelta",
                    text: "Cuando aterrizas, tu vehículo te espera en la terminal de llegada, listo para partir.",
                  },
                ].map((s) => (
                  <div className="seo-step" key={s.n}>
                    <div className="seo-step-num">{s.n}</div>
                    <div className="seo-step-body">
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ),
        },
        {
          id: "ventajas-valet",
          title: "Ventajas del parking valet frente a otras opciones",
          content: (
            <div className="seo-cards">
              {[
                {
                  icon: "🚗",
                  title: "Sin buscar aparcamiento",
                  text: "Llegas, entregas y te vas. Sin vueltas ni estrés buscando plaza.",
                },
                {
                  icon: "🧳",
                  title: "Ideal con equipaje",
                  text: "Evita largas caminatas con maletas. La comodidad empieza desde que llegas.",
                },
                {
                  icon: "⏱️",
                  title: "Ahorro de tiempo real",
                  text: "Comparado con parkings tradicionales, ahorras entre 20 y 45 minutos en cada viaje.",
                },
                {
                  icon: "🛡️",
                  title: "Más seguro que la vía pública",
                  text: "Tu coche no queda en la calle sino en un recinto privado y vigilado.",
                },
                {
                  icon: "💬",
                  title: "Coordinación por WhatsApp",
                  text: "Comunicación directa con el equipo para cualquier cambio o novedad.",
                },
                {
                  icon: "💳",
                  title: "Sin pago anticipado",
                  text: "Reservas ahora y pagas al entregar el vehículo en la terminal.",
                },
              ].map((c) => (
                <div className="seo-card" key={c.title}>
                  <div className="seo-card-icon">{c.icon}</div>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: "terminales",
          title: "Servicio disponible para T1, T2 y T4",
          content: (
            <>
              <p>
                Nuestro servicio de <strong>valet aeropuerto Madrid Barajas</strong>{" "}
                cubre las tres terminales principales:
              </p>
              <div className="seo-cards">
                {[
                  {
                    icon: "1️⃣",
                    title: "Terminal 1",
                    text: "Vuelos internacionales SkyTeam y aerolíneas de largo radio.",
                  },
                  {
                    icon: "2️⃣",
                    title: "Terminal 2",
                    text: "Vuelos nacionales, europeos y aerolíneas de bajo coste.",
                  },
                  {
                    icon: "4️⃣",
                    title: "Terminal 4 y T4S",
                    text: "Terminal principal de Iberia, British Airways y Vueling.",
                  },
                ].map((c) => (
                  <div className="seo-card" key={c.title}>
                    <div className="seo-card-icon">{c.icon}</div>
                    <h3>{c.title}</h3>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
            </>
          ),
        },
        {
          id: "seguridad",
          title: "Seguridad y vigilancia 24 horas",
          content: (
            <>
              <p>
                Tu vehículo permanece en un aparcamiento privado con vigilancia las
                24 horas y seguro incluido. No tendrás que preocuparte por tu coche
                mientras estás de viaje.
              </p>
              <ul>
                <li>Recinto privado de acceso controlado</li>
                <li>Cámaras de seguridad activas 24/7</li>
                <li>Seguro del vehículo incluido</li>
                <li>Personal disponible para cualquier consulta</li>
              </ul>
            </>
          ),
        },
        {
          id: "por-que-elegirnos",
          title: "Por qué elegir Parkingaeromadrid.es",
          content: (
            <>
              <p>
                Somos especialistas en <strong>parking valet en Madrid Barajas</strong>{" "}
                con miles de reservas realizadas y una valoración media de 4,9 sobre 5.
              </p>
              <ul>
                <li>Más de 8.000 reservas realizadas</li>
                <li>Valoración media de 4,9 estrellas</li>
                <li>Atención al cliente 24/7 por WhatsApp</li>
                <li>Cobertura en T1, T2 y T4</li>
                <li>Sin pago anticipado ni sorpresas</li>
                <li>Seguro incluido en el servicio</li>
              </ul>
            </>
          ),
        },
        {
          id: "faq",
          title: "Preguntas frecuentes sobre parking valet",
          content: null,
        },
      ]}
      faqs={[
        {
          pregunta: "¿Qué es el servicio valet en el aeropuerto?",
          respuesta:
            "El parking valet es un servicio en el que un conductor profesional recoge tu vehículo directamente en la terminal de salida y lo devuelve en la terminal de llegada. No necesitas desplazarte hasta el parking.",
        },
        {
          pregunta: "¿El servicio valet está disponible las 24 horas?",
          respuesta:
            "Sí. Nuestro servicio de parking valet en Madrid Barajas está disponible las 24 horas del día, los 365 días del año, para cualquier horario de vuelo.",
        },
        {
          pregunta: "¿El valet parking incluye seguro?",
          respuesta:
            "Sí. El servicio incluye cobertura de seguro para tu vehículo durante toda la estancia en nuestras instalaciones.",
        },
        {
          pregunta: "¿Puedo reservar el valet parking de última hora?",
          respuesta:
            "Recomendamos reservar con al menos 24 horas de antelación para garantizar disponibilidad. Para reservas urgentes, contacta directamente por WhatsApp.",
        },
        {
          pregunta: "¿Cuánto tiempo me ahorro con el servicio valet?",
          respuesta:
            "Comparado con un parking convencional que requiere desplazamiento en bus, con el valet ahorras entre 20 y 45 minutos en cada trayecto, lo que supone casi 1 hora en el viaje completo.",
        },
        {
          pregunta: "¿Necesito dejar las llaves del coche?",
          respuesta:
            "Sí, al tratarse de un servicio valet, necesitarás entregar las llaves del vehículo al conductor. El coche quedará en un recinto privado y seguro hasta tu regreso.",
        },
      ]}
      internalLinks={[
        { href: "/parking-barajas/", text: "Parking Barajas" },
        { href: "/parking-terminal-1-barajas/", text: "Parking Terminal 1 Barajas" },
        { href: "/parking-terminal-2-barajas/", text: "Parking Terminal 2 Barajas" },
        { href: "/parking-terminal-4-barajas/", text: "Parking Terminal 4 Barajas" },
        { href: "/parking-aeropuerto-madrid-barato/", text: "Parking Aeropuerto Madrid Barato" },
        { href: "/parking-larga-estancia-aeropuerto-madrid/", text: "Parking Larga Estancia" },
      ]}
    />
  );
}
