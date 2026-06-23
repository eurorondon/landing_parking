import type { Metadata } from "next";
import LandingPageSEO from "@/components/LandingPageSEO";

export const metadata: Metadata = {
  title: "Parking Barajas | Reserva Parking Seguro Cerca del Aeropuerto",
  description:
    "Reserva tu parking en Barajas con entrega y recogida en terminal, vigilancia 24 horas y acceso rápido al Aeropuerto Madrid-Barajas. Reserva online.",
  alternates: { canonical: "https://parkingaeromadrid.es/parking-barajas/" },
  openGraph: {
    title: "Parking Barajas | Reserva Parking Seguro Cerca del Aeropuerto",
    description:
      "Entrega tu coche en la terminal y viaja sin esperas. Vigilancia 24h y reserva online sin pago anticipado.",
    locale: "es_ES",
    type: "website",
  },
};

export default function ParkingBarajasPage() {
  return (
    <LandingPageSEO
      canonicalPath="/parking-barajas/"
      h1="Parking Barajas con Entrega y Recogida en Terminal"
      cta="Reserva tu parking en Barajas y viaja con tranquilidad."
      breadcrumb={[
        { name: "Inicio", item: "/" },
        { name: "Parking Barajas", item: "/parking-barajas/" },
      ]}
      secciones={[
        {
          id: "tranquilidad",
          title: "Parking en Barajas para viajar con tranquilidad",
          content: (
            <>
              <p>
                Si buscas aparcar cerca del Aeropuerto Madrid-Barajas sin
                complicaciones, Parkingaeromadrid.es es tu mejor opción. Nuestro
                servicio de <strong>parking en Barajas</strong> está diseñado para
                que no pierdas tiempo buscando plaza ni cargando maletas hasta la
                terminal.
              </p>
              <p>
                Llega al aeropuerto relajado, entrega tu vehículo directamente en la
                terminal de salida y recógelo en la terminal de llegada. Así de
                sencillo. Sin buses, sin caminatas largas, sin sorpresas.
              </p>
            </>
          ),
        },
        {
          id: "ventajas",
          title: "Ventajas de reservar parking cerca de Barajas",
          content: (
            <div className="seo-cards">
              {[
                {
                  icon: "✈️",
                  title: "Entrega en tu terminal",
                  text: "Dejamos tu coche en la terminal que necesitas: T1, T2 o T4.",
                },
                {
                  icon: "🛡️",
                  title: "Vigilancia 24 horas",
                  text: "Parking privado y vigilado las 24h, los 365 días del año.",
                },
                {
                  icon: "💳",
                  title: "Sin pago anticipado",
                  text: "Reserva ahora y paga al entregar tu vehículo.",
                },
                {
                  icon: "💬",
                  title: "Confirmación por WhatsApp",
                  text: "Recibe la confirmación al instante en tu móvil.",
                },
                {
                  icon: "🚌",
                  title: "Sin buses ni traslados",
                  text: "Olvídate de los parkings lejanos y los shuttles de espera.",
                },
                {
                  icon: "⏱️",
                  title: "Reserva en menos de 1 minuto",
                  text: "Proceso online rápido y sencillo desde cualquier dispositivo.",
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
                Reservar tu <strong>parking cerca de Barajas</strong> con nosotros
                es un proceso de tres pasos diseñado para ahorrarte tiempo y
                preocupaciones.
              </p>
              <div className="seo-steps">
                {[
                  {
                    n: 1,
                    title: "Elige tus fechas y terminal",
                    text: "Selecciona entrada, salida, hora y la terminal de Barajas (T1, T2 o T4) desde el calculador.",
                  },
                  {
                    n: 2,
                    title: "Confirma tu reserva online",
                    text: "Verás el precio estimado al instante. Completa tus datos y la reserva queda registrada.",
                  },
                  {
                    n: 3,
                    title: "Entrega, vuela y recoge",
                    text: "Deja tu coche en la terminal el día del vuelo. A tu vuelta, lo tienes listo en la terminal de llegada.",
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
          id: "entrega-recogida",
          title: "Entrega y recogida en terminal sin esperas",
          content: (
            <>
              <p>
                Nuestro servicio valet es la gran ventaja frente a los parkings
                convencionales de Barajas. Un profesional recoge tu vehículo
                directamente en el punto de entrega de la terminal y lo devuelve en
                la terminal de llegada, exactamente cuando lo necesitas.
              </p>
              <ul>
                <li>Sin largas caminatas con equipaje</li>
                <li>Sin esperas al autobús lanzadera</li>
                <li>Sin llegar tarde al check-in por culpa del parking</li>
                <li>Con confirmación y seguimiento por WhatsApp</li>
              </ul>
            </>
          ),
        },
        {
          id: "terminales",
          title: "Parking cerca de las terminales T1, T2 y T4 de Barajas",
          content: (
            <>
              <p>
                El Aeropuerto Madrid-Barajas cuenta con cuatro terminales. Nuestro
                servicio cubre las terminales <strong>T1</strong>,{" "}
                <strong>T2</strong> y <strong>T4</strong>, que concentran la mayoría
                de los vuelos nacionales e internacionales.
              </p>
              <div className="seo-cards">
                {[
                  {
                    icon: "1️⃣",
                    title: "Terminal 1",
                    text: "Vuelos internacionales de la alianza SkyTeam y otras aerolíneas.",
                  },
                  {
                    icon: "2️⃣",
                    title: "Terminal 2",
                    text: "Vuelos nacionales y europeos de bajo coste y aerolíneas regionales.",
                  },
                  {
                    icon: "4️⃣",
                    title: "Terminal 4",
                    text: "La terminal principal de Iberia y British Airways, con T4S satélite.",
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
                Tu vehículo permanece en un aparcamiento privado con sistema de
                vigilancia activo las 24 horas, los 7 días de la semana, durante
                toda tu estancia. Incluye cobertura de seguro para que disfrutes de
                tu viaje con la tranquilidad de que tu coche está protegido.
              </p>
              <ul>
                <li>Cámaras de seguridad y vigilancia permanente</li>
                <li>Aparcamiento privado de acceso controlado</li>
                <li>Seguro incluido en el servicio</li>
                <li>Personal de atención disponible 24/7</li>
              </ul>
            </>
          ),
        },
        {
          id: "faq",
          title: "Preguntas frecuentes sobre parking en Barajas",
          content: null,
        },
      ]}
      faqs={[
        {
          pregunta: "¿Dónde entrego el coche en el Aeropuerto Madrid-Barajas?",
          respuesta:
            "La entrega se coordina directamente en la terminal que elijas: T1, T2 o T4. Al confirmar la reserva recibirás instrucciones detalladas del punto de encuentro por WhatsApp.",
        },
        {
          pregunta: "¿Tengo que pagar el parking en Barajas por adelantado?",
          respuesta:
            "No. Puedes dejar tu reserva registrada y pagar al entregar el vehículo en la terminal, según las condiciones del servicio.",
        },
        {
          pregunta: "¿El parking en Barajas funciona de madrugada?",
          respuesta:
            "Sí. El servicio está disponible las 24 horas, los 365 días del año, para adaptarse a cualquier horario de vuelo.",
        },
        {
          pregunta: "¿Puedo reservar parking en Barajas con poca antelación?",
          respuesta:
            "Recomendamos reservar con al menos 24 horas de antelación para garantizar disponibilidad, aunque puedes consultar disponibilidad de última hora contactando directamente.",
        },
        {
          pregunta: "¿Qué pasa si mi vuelo llega tarde?",
          respuesta:
            "Si tu vuelo se retrasa, comunícalo lo antes posible por WhatsApp para coordinar la recogida del vehículo sin problema.",
        },
        {
          pregunta: "¿El parking de Barajas incluye seguro?",
          respuesta:
            "Sí, el servicio incluye cobertura de seguro para tu vehículo durante toda la estancia en nuestras instalaciones.",
        },
      ]}
      internalLinks={[
        { href: "/parking-terminal-1-barajas/", text: "Parking Terminal 1 Barajas" },
        { href: "/parking-terminal-2-barajas/", text: "Parking Terminal 2 Barajas" },
        { href: "/parking-terminal-4-barajas/", text: "Parking Terminal 4 Barajas" },
        { href: "/parking-valet-aeropuerto-madrid/", text: "Parking Valet Aeropuerto Madrid" },
        { href: "/parking-aeropuerto-madrid-barato/", text: "Parking Aeropuerto Madrid Barato" },
        { href: "/parking-larga-estancia-aeropuerto-madrid/", text: "Parking Larga Estancia" },
      ]}
    />
  );
}
