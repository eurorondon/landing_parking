import type { Metadata } from "next";
import LandingPageSEO from "@/components/LandingPageSEO";

export const metadata: Metadata = {
  title: "Parking Terminal 1 Barajas | Reserva Parking Seguro Cerca de la T1",
  description:
    "Reserva tu parking para la Terminal 1 del Aeropuerto Madrid-Barajas con entrega y recogida en terminal, vigilancia 24 horas y reserva online rápida y segura.",
  alternates: { canonical: "https://parkingaeromadrid.es/parking-terminal-1-barajas/" },
  openGraph: {
    title: "Parking Terminal 1 Barajas | Reserva Parking Seguro Cerca de la T1",
    description:
      "Entrega tu coche en la T1 y viaja sin esperas. Vigilancia 24h y reserva online sin pago anticipado.",
    locale: "es_ES",
    type: "website",
  },
};

export default function ParkingTerminal1Page() {
  return (
    <LandingPageSEO
      canonicalPath="/parking-terminal-1-barajas/"
      h1="Parking Terminal 1 con Entrega y Recogida en Terminal"
      cta="Reserva tu parking para la Terminal 1 y viaja con tranquilidad."
      breadcrumb={[
        { name: "Inicio", item: "/" },
        { name: "Parking Barajas", item: "/parking-barajas/" },
        { name: "Parking Terminal 1", item: "/parking-terminal-1-barajas/" },
      ]}
      secciones={[
        {
          id: "tranquilidad",
          title: "Parking cerca de la Terminal 1 para viajar sin preocupaciones",
          content: (
            <>
              <p>
                La Terminal 1 del Aeropuerto Madrid-Barajas concentra vuelos
                internacionales de la alianza SkyTeam y otras aerolíneas de largo
                radio. Si tu vuelo sale o llega por la <strong>T1</strong>,
                Parkingaeromadrid.es te ofrece el servicio de{" "}
                <strong>parking Terminal 1</strong> más cómodo del aeropuerto.
              </p>
              <p>
                Olvídate de parkings lejanos y buses lanzadera. Nuestro equipo
                recoge tu vehículo directamente en la T1 y lo devuelve listo cuando
                aterrizas.
              </p>
            </>
          ),
        },
        {
          id: "ventajas",
          title: "Ventajas de reservar parking para la T1",
          content: (
            <div className="seo-cards">
              {[
                {
                  icon: "1️⃣",
                  title: "Entrega en la T1",
                  text: "Entregamos y recogemos tu vehículo en el punto acordado de la Terminal 1.",
                },
                {
                  icon: "🛡️",
                  title: "Vigilancia 24 horas",
                  text: "Parking privado y vigilado durante toda tu estancia.",
                },
                {
                  icon: "💳",
                  title: "Sin pago anticipado",
                  text: "Reserva ahora y paga al entregar el vehículo en la T1.",
                },
                {
                  icon: "💬",
                  title: "Confirmación inmediata",
                  text: "Recibe la confirmación de tu reserva al instante por WhatsApp.",
                },
                {
                  icon: "🚌",
                  title: "Sin esperar el bus",
                  text: "Llegamos hasta la terminal, no al revés.",
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
                Reservar tu <strong>parking T1 Barajas</strong> con nosotros es
                un proceso de tres pasos sencillos.
              </p>
              <div className="seo-steps">
                {[
                  {
                    n: 1,
                    title: "Elige tus fechas y la Terminal 1",
                    text: "Selecciona la fecha de entrada, salida, hora y la T1 como terminal desde el calculador.",
                  },
                  {
                    n: 2,
                    title: "Confirma tu reserva online",
                    text: "Verás el precio estimado al instante. Completa tus datos y la reserva queda registrada.",
                  },
                  {
                    n: 3,
                    title: "Entrega en T1, vuela y recoge",
                    text: "Deja tu coche en la Terminal 1 el día del vuelo. A tu vuelta, lo tienes listo.",
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
          id: "entrega-t1",
          title: "Entrega y recogida en la Terminal 1 sin esperas",
          content: (
            <>
              <p>
                Con nuestro servicio valet para la T1, un profesional recoge tu
                vehículo en el punto de entrega de la Terminal 1 y lo devuelve
                cuando aterrizas. Sin largas caminatas ni buses de espera.
              </p>
              <ul>
                <li>Punto de entrega coordinado en la T1</li>
                <li>Recogida en la terminal de llegada</li>
                <li>Sin esperas ni desplazamientos adicionales</li>
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
                permanente las 24 horas, los 365 días del año. Incluye cobertura de
                seguro para que disfrutes de tu viaje con total tranquilidad.
              </p>
              <ul>
                <li>Cámaras de seguridad y vigilancia permanente</li>
                <li>Acceso controlado al aparcamiento</li>
                <li>Seguro incluido en el servicio</li>
                <li>Atención al cliente disponible 24/7</li>
              </ul>
            </>
          ),
        },
        {
          id: "acceso-t1",
          title: "Acceso rápido a la Terminal 1 de Barajas",
          content: (
            <>
              <p>
                La Terminal 1 está conectada con la T2 y T3 mediante pasarelas
                interiores. Nuestro servicio te permite llegar directamente a la
                puerta de embarque sin rodeos.
              </p>
              <p>
                Al reservar el{" "}
                <strong>parking para la Terminal 1 de Barajas</strong>, recibirás
                instrucciones precisas del punto de entrega para que el día de tu
                vuelo todo sea fluido y sin estrés.
              </p>
            </>
          ),
        },
        {
          id: "faq",
          title: "Preguntas frecuentes sobre parking Terminal 1",
          content: null,
        },
      ]}
      faqs={[
        {
          pregunta: "¿Dónde entrego el coche en la Terminal 1?",
          respuesta:
            "Al confirmar tu reserva recibirás las instrucciones exactas del punto de entrega en la T1 por WhatsApp. El proceso es sencillo y está coordinado para que llegues a tiempo a tu vuelo.",
        },
        {
          pregunta: "¿Qué aerolíneas operan en la Terminal 1 de Barajas?",
          respuesta:
            "La T1 concentra principalmente vuelos internacionales de la alianza SkyTeam (Air France, KLM, Alitalia) y otras aerolíneas intercontinentales. Consulta la web del aeropuerto para confirmar tu terminal.",
        },
        {
          pregunta: "¿El parking T1 funciona de noche?",
          respuesta:
            "Sí. El servicio está disponible las 24 horas para adaptarse a cualquier horario de vuelo, incluyendo madrugadas y festivos.",
        },
        {
          pregunta: "¿Puedo reservar parking para la T1 con menos de 24 horas?",
          respuesta:
            "Recomendamos reservar con antelación para garantizar disponibilidad. Para reservas urgentes contáctanos directamente por WhatsApp.",
        },
        {
          pregunta: "¿Qué pasa si mi vuelo llega a otra terminal diferente?",
          respuesta:
            "Si tu vuelo de regreso llega por una terminal distinta, indícalo al reservar o comunícalo antes del viaje por WhatsApp para coordinar la entrega del vehículo correctamente.",
        },
        {
          pregunta: "¿El servicio incluye seguro para mi vehículo?",
          respuesta:
            "Sí, el parking para la Terminal 1 incluye cobertura de seguro para tu vehículo durante toda la estancia.",
        },
      ]}
      internalLinks={[
        { href: "/parking-barajas/", text: "Parking Barajas" },
        { href: "/parking-terminal-2-barajas/", text: "Parking Terminal 2 Barajas" },
        { href: "/parking-terminal-4-barajas/", text: "Parking Terminal 4 Barajas" },
        { href: "/parking-valet-aeropuerto-madrid/", text: "Parking Valet Aeropuerto Madrid" },
        { href: "/parking-aeropuerto-madrid-barato/", text: "Parking Aeropuerto Madrid Barato" },
        { href: "/parking-larga-estancia-aeropuerto-madrid/", text: "Parking Larga Estancia" },
      ]}
    />
  );
}
