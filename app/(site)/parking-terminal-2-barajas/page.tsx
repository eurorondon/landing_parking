import type { Metadata } from "next";
import LandingPageSEO from "@/components/LandingPageSEO";

export const metadata: Metadata = {
  title: "Parking Terminal 2 Barajas | Reserva Parking Seguro Cerca de la T2",
  description:
    "Reserva tu parking para la Terminal 2 del Aeropuerto Madrid-Barajas con entrega y recogida en terminal, vigilancia 24 horas y reserva online rápida y segura.",
  alternates: { canonical: "https://parkingaeromadrid.es/parking-terminal-2-barajas/" },
  openGraph: {
    title: "Parking Terminal 2 Barajas | Reserva Parking Seguro Cerca de la T2",
    description:
      "Entrega tu coche en la T2 y viaja sin esperas. Vigilancia 24h y reserva online sin pago anticipado.",
    locale: "es_ES",
    type: "website",
  },
};

export default function ParkingTerminal2Page() {
  return (
    <LandingPageSEO
      canonicalPath="/parking-terminal-2-barajas/"
      h1="Parking Terminal 2 con Entrega y Recogida en Terminal"
      cta="Reserva tu parking para la Terminal 2 y viaja con tranquilidad."
      breadcrumb={[
        { name: "Inicio", item: "/" },
        { name: "Parking Barajas", item: "/parking-barajas/" },
        { name: "Parking Terminal 2", item: "/parking-terminal-2-barajas/" },
      ]}
      secciones={[
        {
          id: "tranquilidad",
          title: "Parking cerca de la Terminal 2 para viajar sin preocupaciones",
          content: (
            <>
              <p>
                La Terminal 2 del Aeropuerto Madrid-Barajas opera vuelos nacionales
                y europeos, incluyendo aerolíneas de bajo coste y vuelos regionales.
                Si tu vuelo sale o llega por la <strong>T2</strong>,
                Parkingaeromadrid.es te ofrece el servicio de{" "}
                <strong>parking Terminal 2</strong> más cómodo del aeropuerto.
              </p>
              <p>
                Nuestro servicio valet te permite llegar directamente a la T2 sin
                preocuparte por el aparcamiento. Entrega el coche, factura tu
                equipaje y embarca tranquilo.
              </p>
            </>
          ),
        },
        {
          id: "ventajas",
          title: "Ventajas de reservar parking para la T2",
          content: (
            <div className="seo-cards">
              {[
                {
                  icon: "2️⃣",
                  title: "Entrega en la T2",
                  text: "Entregamos y recogemos tu vehículo en el punto acordado de la Terminal 2.",
                },
                {
                  icon: "🛡️",
                  title: "Vigilancia 24 horas",
                  text: "Parking privado y vigilado durante toda tu estancia.",
                },
                {
                  icon: "💳",
                  title: "Sin pago anticipado",
                  text: "Reserva ahora y paga al entregar el vehículo en la T2.",
                },
                {
                  icon: "💬",
                  title: "Confirmación inmediata",
                  text: "Recibe la confirmación de tu reserva al instante por WhatsApp.",
                },
                {
                  icon: "🧳",
                  title: "Ideal con equipaje",
                  text: "Evita desplazamientos con maletas hasta el parking.",
                },
                {
                  icon: "⏱️",
                  title: "Reserva en 1 minuto",
                  text: "Proceso online rápido desde cualquier dispositivo.",
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
          id: "como-funciona",
          title: "Cómo funciona Parkingaeromadrid.es",
          content: (
            <>
              <p>
                Reservar tu <strong>parking T2 Barajas</strong> con nosotros es un
                proceso de tres pasos sencillos.
              </p>
              <div className="seo-steps">
                {[
                  {
                    n: 1,
                    title: "Elige tus fechas y la Terminal 2",
                    text: "Selecciona la fecha de entrada, salida, hora y la T2 como terminal desde el calculador.",
                  },
                  {
                    n: 2,
                    title: "Confirma tu reserva online",
                    text: "Verás el precio estimado al instante. Completa tus datos y la reserva queda registrada.",
                  },
                  {
                    n: 3,
                    title: "Entrega en T2, vuela y recoge",
                    text: "Deja tu coche en la Terminal 2 el día del vuelo. A tu vuelta, lo tienes listo.",
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
          id: "entrega-t2",
          title: "Entrega y recogida en la Terminal 2 sin esperas",
          content: (
            <>
              <p>
                Con nuestro servicio valet para la T2, un profesional recoge tu
                vehículo en la Terminal 2 y lo devuelve cuando aterrizas. Sin
                shuttles ni caminatas largas con maletas.
              </p>
              <ul>
                <li>Punto de entrega coordinado en la T2</li>
                <li>Recogida en la terminal de llegada</li>
                <li>Sin colas ni esperas innecesarias</li>
                <li>Seguimiento en tiempo real por WhatsApp</li>
              </ul>
            </>
          ),
        },
        {
          id: "seguridad",
          title: "Seguridad y vigilancia 24 horas",
          content: (
            <>
              <p>
                Tu vehículo permanece en un aparcamiento privado con vigilancia
                permanente durante toda la estancia. Incluye cobertura de seguro.
              </p>
              <ul>
                <li>Cámaras de seguridad y vigilancia continua</li>
                <li>Acceso controlado al aparcamiento</li>
                <li>Seguro incluido en el servicio</li>
                <li>Personal disponible 24/7</li>
              </ul>
            </>
          ),
        },
        {
          id: "acceso-t2",
          title: "Acceso rápido a la Terminal 2 de Barajas",
          content: (
            <>
              <p>
                La Terminal 2 se encuentra conectada con la T1 y T3 mediante
                pasarelas peatonales. Es la terminal más utilizada para vuelos de
                bajo coste europeos y destinos nacionales.
              </p>
              <p>
                Al reservar el{" "}
                <strong>parking para la Terminal 2 de Barajas</strong>, recibirás
                instrucciones precisas del punto de entrega para que el día de tu
                vuelo todo sea rápido y sin estrés.
              </p>
            </>
          ),
        },
        {
          id: "faq",
          title: "Preguntas frecuentes sobre parking Terminal 2",
          content: null,
        },
      ]}
      faqs={[
        {
          pregunta: "¿Qué aerolíneas operan en la Terminal 2 de Barajas?",
          respuesta:
            "La T2 concentra vuelos de aerolíneas de bajo coste, vuelos nacionales e internacionales europeos. Entre las más comunes: Vueling, Air Nostrum y aerolíneas regionales. Confirma siempre la terminal con tu aerolínea.",
        },
        {
          pregunta: "¿Dónde entrego el coche en la Terminal 2?",
          respuesta:
            "Al confirmar tu reserva recibirás las instrucciones exactas del punto de entrega en la T2 por WhatsApp. El proceso es rápido y coordinado.",
        },
        {
          pregunta: "¿El parking T2 funciona a cualquier hora?",
          respuesta:
            "Sí. El servicio está disponible las 24 horas, los 365 días del año para adaptarse a cualquier horario de vuelo.",
        },
        {
          pregunta: "¿Puedo recoger el coche en una terminal diferente a la T2?",
          respuesta:
            "Sí, si tu vuelo de regreso llega por otra terminal, indícalo al reservar o comunícalo antes del viaje para coordinar la entrega en la terminal correcta.",
        },
        {
          pregunta: "¿Cuánto cuesta el parking para la Terminal 2?",
          respuesta:
            "El precio depende del número de días de estancia. Usa nuestro calculador online para obtener el precio exacto al instante y sin compromiso.",
        },
        {
          pregunta: "¿El servicio incluye seguro para mi vehículo?",
          respuesta:
            "Sí, el parking para la Terminal 2 incluye cobertura de seguro durante toda la estancia.",
        },
      ]}
      internalLinks={[
        { href: "/parking-barajas/", text: "Parking Barajas" },
        { href: "/parking-terminal-1-barajas/", text: "Parking Terminal 1 Barajas" },
        { href: "/parking-terminal-4-barajas/", text: "Parking Terminal 4 Barajas" },
        { href: "/parking-valet-aeropuerto-madrid/", text: "Parking Valet Aeropuerto Madrid" },
        { href: "/parking-aeropuerto-madrid-barato/", text: "Parking Aeropuerto Madrid Barato" },
        { href: "/parking-larga-estancia-aeropuerto-madrid/", text: "Parking Larga Estancia" },
      ]}
    />
  );
}
