import type { Metadata } from "next";
import LandingPageSEO from "@/components/LandingPageSEO";

export const metadata: Metadata = {
  title: "Parking Aeropuerto Madrid Barato | Reserva y Ahorra en Barajas",
  description:
    "Reserva parking barato cerca del Aeropuerto Madrid-Barajas con entrega y recogida en terminal, vigilancia 24 horas y tarifas competitivas.",
  alternates: { canonical: "https://parkingaeromadrid.es/parking-aeropuerto-madrid-barato/" },
  openGraph: {
    title: "Parking Aeropuerto Madrid Barato | Reserva y Ahorra en Barajas",
    description:
      "Parking económico en Barajas con entrega en terminal. Tarifas competitivas y sin pago anticipado.",
    locale: "es_ES",
    type: "website",
  },
};

export default function ParkingBaratoPage() {
  return (
    <LandingPageSEO
      canonicalPath="/parking-aeropuerto-madrid-barato/"
      h1="Parking Aeropuerto Madrid Barato con Entrega y Recogida en Terminal"
      cta="Reserva tu parking barato en Barajas y ahorra en tu próximo viaje."
      breadcrumb={[
        { name: "Inicio", item: "/" },
        { name: "Parking Barajas", item: "/parking-barajas/" },
        { name: "Parking Barato Barajas", item: "/parking-aeropuerto-madrid-barato/" },
      ]}
      secciones={[
        {
          id: "parking-barato",
          title: "Parking barato cerca del Aeropuerto Madrid-Barajas",
          content: (
            <>
              <p>
                Encontrar un <strong>parking barato en Barajas</strong> sin
                renunciar a la calidad y la comodidad es posible con
                Parkingaeromadrid.es. Ofrecemos tarifas competitivas con entrega y
                recogida directamente en la terminal del aeropuerto.
              </p>
              <p>
                Nuestro servicio incluye vigilancia 24 horas, seguro del vehículo y
                confirmación inmediata por WhatsApp, todo a un precio ajustado para
                que el viaje no se encarezca más de lo necesario.
              </p>
            </>
          ),
        },
        {
          id: "como-ahorrar",
          title: "Cómo ahorrar en tu reserva de parking",
          content: (
            <>
              <p>
                Estos son los consejos clave para conseguir el mejor precio en tu{" "}
                <strong>parking económico en el aeropuerto de Madrid</strong>:
              </p>
              <ul>
                <li>
                  <strong>Reserva con antelación:</strong> cuanto antes reserves,
                  mejores tarifas disponibles encontrarás.
                </li>
                <li>
                  <strong>Compara fechas:</strong> los días de salida y llegada
                  pueden influir en el precio final.
                </li>
                <li>
                  <strong>Opta por el servicio valet:</strong> incluye entrega en
                  terminal y ahorro de tiempo, lo que compensa el coste adicional.
                </li>
                <li>
                  <strong>Evita el parking del aeropuerto:</strong> los aparcamientos
                  oficiales de AENA son los más caros. Los parkings privados cercanos
                  ofrecen precios mucho mejores.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "ventajas-antelacion",
          title: "Ventajas de reservar con antelación",
          content: (
            <div className="seo-cards">
              {[
                {
                  icon: "💰",
                  title: "Mejor precio garantizado",
                  text: "Las reservas anticipadas siempre obtienen las mejores tarifas disponibles.",
                },
                {
                  icon: "✅",
                  title: "Disponibilidad asegurada",
                  text: "En temporada alta, las plazas se agotan. Reservar antes garantiza tu sitio.",
                },
                {
                  icon: "🧘",
                  title: "Menos estrés el día del vuelo",
                  text: "Con la reserva hecha, el día del viaje ya tienes todo resuelto.",
                },
                {
                  icon: "💬",
                  title: "Confirmación inmediata",
                  text: "Recibirás la confirmación por WhatsApp nada más completar la reserva.",
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
          id: "entrega-recogida",
          title: "Entrega y recogida en terminal sin coste de tiempo",
          content: (
            <>
              <p>
                Nuestro <strong>parking barato en Barajas</strong> no significa
                renunciar al servicio valet. La entrega y recogida en terminal están
                incluidas, lo que supone un gran ahorro de tiempo real frente a los
                parkings con bus lanzadera.
              </p>
              <ul>
                <li>Entrega directa en T1, T2 o T4</li>
                <li>Recogida en la terminal de llegada</li>
                <li>Sin desplazamientos adicionales ni esperas</li>
                <li>Ahorra hasta 45 minutos por trayecto</li>
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
                Un precio ajustado no significa sacrificar la seguridad. Tu vehículo
                está en un recinto privado con vigilancia las 24 horas y seguro
                incluido, independientemente de la tarifa contratada.
              </p>
              <ul>
                <li>Recinto privado de acceso controlado</li>
                <li>Cámaras de seguridad 24/7</li>
                <li>Seguro del vehículo incluido</li>
                <li>Personal de atención disponible siempre</li>
              </ul>
            </>
          ),
        },
        {
          id: "viajeros-frecuentes",
          title: "Calidad y precio para viajeros frecuentes",
          content: (
            <>
              <p>
                Si viajas con frecuencia desde el Aeropuerto Madrid-Barajas, nuestro
                servicio de <strong>parking low cost en Madrid</strong> es la opción
                más inteligente. Calidad de servicio premium a un precio que se
                adapta a tu ritmo de viaje.
              </p>
              <p>
                Más de 8.000 clientes ya confían en Parkingaeromadrid.es para
                aparcar en Barajas. Reserva online en menos de 1 minuto y empieza a
                ahorrar desde tu próxima reserva.
              </p>
            </>
          ),
        },
        {
          id: "faq",
          title: "Preguntas frecuentes sobre parking barato",
          content: null,
        },
      ]}
      faqs={[
        {
          pregunta: "¿Es seguro un parking barato en el Aeropuerto Madrid-Barajas?",
          respuesta:
            "Sí. Nuestro servicio ofrece tarifas competitivas sin sacrificar la seguridad. El vehículo permanece en un recinto privado con vigilancia 24h y seguro incluido.",
        },
        {
          pregunta: "¿Cómo consigo el mejor precio para aparcar en Barajas?",
          respuesta:
            "Reservando con antelación obtienes siempre las mejores tarifas. Usa nuestro calculador online para ver el precio exacto al instante sin compromiso.",
        },
        {
          pregunta: "¿El parking barato incluye entrega en terminal?",
          respuesta:
            "Sí. Nuestro servicio incluye entrega y recogida directamente en la terminal del Aeropuerto Madrid-Barajas (T1, T2 o T4), sin coste adicional.",
        },
        {
          pregunta: "¿Cuánto cuesta aparcar en Barajas con vuestro servicio?",
          respuesta:
            "El precio depende del número de días de estancia. Usa el calculador online para obtener una tarifa exacta y personalizada al instante.",
        },
        {
          pregunta: "¿Es más barato que el parking oficial del aeropuerto?",
          respuesta:
            "Sí. Los parkings privados cercanos al aeropuerto como el nuestro ofrecen tarifas significativamente más bajas que los aparcamientos oficiales de AENA, con servicios equivalentes o superiores.",
        },
        {
          pregunta: "¿Puedo pagar al entregar el coche en lugar de por adelantado?",
          respuesta:
            "Sí. Puedes reservar ahora sin pago anticipado y abonar el importe al entregar el vehículo en la terminal.",
        },
      ]}
      internalLinks={[
        { href: "/parking-barajas/", text: "Parking Barajas" },
        { href: "/parking-terminal-1-barajas/", text: "Parking Terminal 1 Barajas" },
        { href: "/parking-terminal-2-barajas/", text: "Parking Terminal 2 Barajas" },
        { href: "/parking-terminal-4-barajas/", text: "Parking Terminal 4 Barajas" },
        { href: "/parking-valet-aeropuerto-madrid/", text: "Parking Valet Aeropuerto Madrid" },
        { href: "/parking-larga-estancia-aeropuerto-madrid/", text: "Parking Larga Estancia" },
      ]}
    />
  );
}
