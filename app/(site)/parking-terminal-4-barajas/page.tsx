import type { Metadata } from "next";
import LandingPageSEO from "@/components/LandingPageSEO";

export const metadata: Metadata = {
  title: "Parking Terminal 4 Barajas | Reserva Parking Seguro Cerca de la T4",
  description:
    "Reserva tu parking para la Terminal 4 del Aeropuerto Madrid-Barajas con entrega y recogida en terminal, vigilancia 24 horas y reserva online rápida y segura.",
  alternates: { canonical: "https://parkingaeromadrid.es/parking-terminal-4-barajas/" },
  openGraph: {
    title: "Parking Terminal 4 Barajas | Reserva Parking Seguro Cerca de la T4",
    description:
      "Entrega tu coche en la T4 y viaja sin esperas. Vigilancia 24h y reserva online sin pago anticipado.",
    locale: "es_ES",
    type: "website",
  },
};

export default function ParkingTerminal4Page() {
  return (
    <LandingPageSEO
      canonicalPath="/parking-terminal-4-barajas/"
      h1="Parking Terminal 4 con Entrega y Recogida en Terminal"
      cta="Reserva tu parking para la Terminal 4 y viaja con tranquilidad."
      breadcrumb={[
        { name: "Inicio", item: "/" },
        { name: "Parking Barajas", item: "/parking-barajas/" },
        { name: "Parking Terminal 4", item: "/parking-terminal-4-barajas/" },
      ]}
      secciones={[
        {
          id: "tranquilidad",
          title: "Parking cerca de la Terminal 4 para viajar sin preocupaciones",
          content: (
            <>
              <p>
                La Terminal 4 es la más grande del Aeropuerto Madrid-Barajas y la
                principal de Iberia, British Airways y Vueling. Si tu vuelo sale o
                llega por la <strong>T4</strong>, Parkingaeromadrid.es te ofrece el
                servicio de <strong>parking Terminal 4</strong> más cómodo y
                eficiente.
              </p>
              <p>
                Tanto si vuelas desde la T4 principal como desde la T4S satélite,
                nuestro equipo coordina la entrega y recogida del vehículo en el
                punto que necesitas.
              </p>
            </>
          ),
        },
        {
          id: "ventajas",
          title: "Ventajas de reservar parking para la T4",
          content: (
            <div className="seo-cards">
              {[
                {
                  icon: "4️⃣",
                  title: "Entrega en la T4",
                  text: "Entregamos y recogemos tu vehículo en el punto acordado de la Terminal 4 o T4S.",
                },
                {
                  icon: "🛡️",
                  title: "Vigilancia 24 horas",
                  text: "Parking privado y vigilado durante toda tu estancia.",
                },
                {
                  icon: "💳",
                  title: "Sin pago anticipado",
                  text: "Reserva ahora y paga al entregar el vehículo en la T4.",
                },
                {
                  icon: "💬",
                  title: "Confirmación inmediata",
                  text: "Recibe la confirmación de tu reserva al instante por WhatsApp.",
                },
                {
                  icon: "✈️",
                  title: "T4 y T4S cubiertos",
                  text: "Servicio disponible tanto para la T4 principal como la T4 Satélite.",
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
                Reservar tu <strong>parking T4 Barajas</strong> con nosotros es un
                proceso de tres pasos sencillos.
              </p>
              <div className="seo-steps">
                {[
                  {
                    n: 1,
                    title: "Elige tus fechas y la Terminal 4",
                    text: "Selecciona la fecha de entrada, salida, hora y la T4 como terminal desde el calculador.",
                  },
                  {
                    n: 2,
                    title: "Confirma tu reserva online",
                    text: "Verás el precio estimado al instante. Completa tus datos y la reserva queda registrada.",
                  },
                  {
                    n: 3,
                    title: "Entrega en T4, vuela y recoge",
                    text: "Deja tu coche en la Terminal 4 el día del vuelo. A tu vuelta, lo tienes listo.",
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
          id: "entrega-t4",
          title: "Entrega y recogida en la Terminal 4 sin esperas",
          content: (
            <>
              <p>
                La T4 tiene una gran afluencia de viajeros. Por eso nuestro servicio
                valet es especialmente valioso: un profesional recoge tu vehículo
                directamente en la puerta de la T4 y lo devuelve cuando aterrizas,
                sin que tengas que esperar nada.
              </p>
              <ul>
                <li>Punto de entrega en la puerta de la T4 o T4S</li>
                <li>Recogida en la terminal de llegada</li>
                <li>Sin largas caminatas ni transporte adicional</li>
                <li>Seguimiento y confirmación por WhatsApp</li>
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
                Tu vehículo está protegido en un aparcamiento privado con vigilancia
                las 24 horas y seguro incluido en el servicio.
              </p>
              <ul>
                <li>Cámaras de seguridad y control permanente</li>
                <li>Acceso controlado al recinto</li>
                <li>Seguro incluido durante toda la estancia</li>
                <li>Atención al cliente 24/7</li>
              </ul>
            </>
          ),
        },
        {
          id: "acceso-t4",
          title: "Acceso rápido a la Terminal 4 de Barajas",
          content: (
            <>
              <p>
                La Terminal 4 es la más grande del aeropuerto de Madrid y cuenta con
                la T4S (Terminal 4 Satélite) para vuelos de largo radio de Iberia.
                Es la terminal más transitada y donde sale la mayoría de vuelos
                intercontinentales.
              </p>
              <p>
                Al reservar el{" "}
                <strong>parking para la Terminal 4 de Barajas</strong>, recibirás
                instrucciones precisas del punto de entrega para que el día de tu
                vuelo todo sea fluido y sin demoras.
              </p>
            </>
          ),
        },
        {
          id: "faq",
          title: "Preguntas frecuentes sobre parking Terminal 4",
          content: null,
        },
      ]}
      faqs={[
        {
          pregunta: "¿Qué aerolíneas operan en la Terminal 4 de Barajas?",
          respuesta:
            "La T4 es la terminal principal de Iberia, British Airways, Vueling y oneworld. Desde la T4S (satélite) operan los vuelos de largo radio de Iberia. Confirma siempre tu terminal con la aerolínea.",
        },
        {
          pregunta: "¿El parking cubre también la T4S (Terminal 4 Satélite)?",
          respuesta:
            "Sí. Nuestro servicio cubre tanto la T4 principal como la T4S. Indícalo en tu reserva o contacta por WhatsApp para coordinar el punto de entrega correctamente.",
        },
        {
          pregunta: "¿Dónde entrego el coche en la Terminal 4?",
          respuesta:
            "Al confirmar la reserva recibirás las instrucciones exactas del punto de entrega en la T4 o T4S por WhatsApp.",
        },
        {
          pregunta: "¿El parking T4 funciona a cualquier hora?",
          respuesta:
            "Sí. El servicio está disponible las 24 horas, los 365 días del año para cualquier horario de vuelo, incluyendo madrugadas y festivos.",
        },
        {
          pregunta: "¿Cuánto cuesta el parking para la Terminal 4?",
          respuesta:
            "El precio depende de los días de estancia. Usa nuestro calculador online para obtener el precio exacto en tiempo real, sin compromiso.",
        },
        {
          pregunta: "¿El servicio incluye seguro?",
          respuesta:
            "Sí, el parking para la Terminal 4 incluye cobertura de seguro para tu vehículo durante toda la estancia.",
        },
      ]}
      internalLinks={[
        { href: "/parking-barajas/", text: "Parking Barajas" },
        { href: "/parking-terminal-1-barajas/", text: "Parking Terminal 1 Barajas" },
        { href: "/parking-terminal-2-barajas/", text: "Parking Terminal 2 Barajas" },
        { href: "/parking-valet-aeropuerto-madrid/", text: "Parking Valet Aeropuerto Madrid" },
        { href: "/parking-aeropuerto-madrid-barato/", text: "Parking Aeropuerto Madrid Barato" },
        { href: "/parking-larga-estancia-aeropuerto-madrid/", text: "Parking Larga Estancia" },
      ]}
    />
  );
}
