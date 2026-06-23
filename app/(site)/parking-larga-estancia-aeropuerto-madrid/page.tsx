import type { Metadata } from "next";
import LandingPageSEO from "@/components/LandingPageSEO";

export const metadata: Metadata = {
  title: "Parking Larga Estancia Aeropuerto Madrid | Reserva al Mejor Precio",
  description:
    "Reserva parking de larga estancia cerca del Aeropuerto Madrid-Barajas con vigilancia 24 horas, entrega y recogida en terminal y tarifas competitivas para viajes de varios días.",
  alternates: { canonical: "https://parkingaeromadrid.es/parking-larga-estancia-aeropuerto-madrid/" },
  openGraph: {
    title: "Parking Larga Estancia Aeropuerto Madrid | Reserva al Mejor Precio",
    description:
      "Deja tu coche varios días con total seguridad. Parking larga estancia en Barajas con entrega en terminal y vigilancia 24h.",
    locale: "es_ES",
    type: "website",
  },
};

export default function ParkingLargaEstanciaPage() {
  return (
    <LandingPageSEO
      canonicalPath="/parking-larga-estancia-aeropuerto-madrid/"
      h1="Parking Larga Estancia Aeropuerto Madrid con Entrega y Recogida en Terminal"
      cta="Reserva tu parking de larga estancia y viaja con tranquilidad."
      breadcrumb={[
        { name: "Inicio", item: "/" },
        { name: "Parking Barajas", item: "/parking-barajas/" },
        { name: "Parking Larga Estancia", item: "/parking-larga-estancia-aeropuerto-madrid/" },
      ]}
      secciones={[
        {
          id: "larga-estancia",
          title: "Parking de larga estancia cerca del Aeropuerto Madrid-Barajas",
          content: (
            <>
              <p>
                Si vas a viajar durante varios días y necesitas{" "}
                <strong>dejar tu coche varios días en el aeropuerto de Madrid</strong>,
                Parkingaeromadrid.es es tu solución. Nuestro servicio de{" "}
                <strong>parking larga estancia en Barajas</strong> ofrece tarifas
                competitivas por día, vigilancia permanente y entrega directa en la
                terminal.
              </p>
              <p>
                Ya sea una semana de vacaciones, un viaje de negocios largo o
                cualquier ausencia de varios días, tu vehículo estará seguro y listo
                cuando regreses.
              </p>
            </>
          ),
        },
        {
          id: "ventajas-viajes-largos",
          title: "Ventajas de reservar parking para viajes largos",
          content: (
            <div className="seo-cards">
              {[
                {
                  icon: "📅",
                  title: "Tarifa por día",
                  text: "Cuanto más días estés, mejor precio por jornada. Tarifas progresivas pensadas para viajes largos.",
                },
                {
                  icon: "🛡️",
                  title: "Vigilancia 24/7",
                  text: "Tu coche permanece protegido durante toda tu estancia, sea de 3 días o 3 semanas.",
                },
                {
                  icon: "✈️",
                  title: "Entrega en terminal",
                  text: "Entrega y recogida directa en T1, T2 o T4, sin desplazamientos adicionales.",
                },
                {
                  icon: "💰",
                  title: "Ahorro real",
                  text: "Mucho más económico que los aparcamientos oficiales del aeropuerto para estancias largas.",
                },
                {
                  icon: "🔐",
                  title: "Seguro incluido",
                  text: "Cobertura de seguro para tu vehículo durante toda la estancia.",
                },
                {
                  icon: "💬",
                  title: "Gestión por WhatsApp",
                  text: "Coordina cualquier cambio o novedad directamente por WhatsApp.",
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
                Reservar tu{" "}
                <strong>parking semanal en el aeropuerto de Madrid</strong> es tan
                sencillo como seguir tres pasos:
              </p>
              <div className="seo-steps">
                {[
                  {
                    n: 1,
                    title: "Selecciona tus fechas y días de estancia",
                    text: "Indica la fecha y hora de entrada y salida. El calculador te muestra el precio total al instante.",
                  },
                  {
                    n: 2,
                    title: "Confirma tu reserva",
                    text: "Completa tus datos y queda registrada la reserva. Recibirás confirmación por WhatsApp.",
                  },
                  {
                    n: 3,
                    title: "Entrega, viaja y regresa tranquilo",
                    text: "Deja el coche en la terminal el día de salida. A la vuelta, lo tienes listo en tu terminal de llegada.",
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
                Para viajes largos, el servicio de entrega y recogida en terminal
                es especialmente valioso. No tendrás que preocuparte de llegar al
                aeropuerto con mucha antelación solo para encontrar aparcamiento.
              </p>
              <ul>
                <li>Entrega directa en la terminal de salida (T1, T2 o T4)</li>
                <li>Recogida en la terminal de llegada a tu regreso</li>
                <li>Sin buses lanzadera ni largas caminatas</li>
                <li>Coordinación precisa de horarios por WhatsApp</li>
              </ul>
            </>
          ),
        },
        {
          id: "seguridad",
          title: "Seguridad y vigilancia 24 horas durante toda tu estancia",
          content: (
            <>
              <p>
                Para viajes de varios días, la seguridad de tu vehículo es lo más
                importante. Nuestro{" "}
                <strong>aparcamiento larga estancia Barajas</strong> ofrece las
                máximas garantías de protección.
              </p>
              <ul>
                <li>Recinto privado de acceso controlado</li>
                <li>Cámaras de seguridad activas 24 horas los 365 días</li>
                <li>Seguro del vehículo incluido en el servicio</li>
                <li>Personal de atención disponible siempre</li>
                <li>Sin riesgo de multas ni robos en vía pública</li>
              </ul>
            </>
          ),
        },
        {
          id: "como-ahorrar",
          title: "Cómo ahorrar en reservas de varios días",
          content: (
            <>
              <p>
                Estas son las claves para obtener la mejor tarifa de{" "}
                <strong>parking vacaciones en Madrid Barajas</strong>:
              </p>
              <ul>
                <li>
                  <strong>Reserva con antelación:</strong> obtienes siempre las
                  mejores tarifas disponibles para estancias largas.
                </li>
                <li>
                  <strong>Compara el coste total:</strong> nuestras tarifas son
                  significativamente más bajas que los parkings oficiales de AENA
                  para estancias de más de 3 días.
                </li>
                <li>
                  <strong>Suma el ahorro de tiempo:</strong> con el servicio valet
                  incluido, también ahorras tiempo real en cada viaje.
                </li>
                <li>
                  <strong>Evita dejar el coche en casa:</strong> con precios
                  ajustados para larga estancia, es más cómodo y seguro que
                  alternativas como el taxi o el transporte público.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "faq",
          title: "Preguntas frecuentes sobre parking larga estancia",
          content: null,
        },
      ]}
      faqs={[
        {
          pregunta: "¿Cuántos días máximo puedo dejar el coche en el parking de larga estancia?",
          respuesta:
            "No hay un límite máximo de días. Puedes dejar tu vehículo desde 2 días hasta varias semanas. El precio se ajusta por día de estancia.",
        },
        {
          pregunta: "¿Es seguro dejar el coche varios días en el aeropuerto de Madrid?",
          respuesta:
            "Sí. Nuestro parking larga estancia en Barajas cuenta con vigilancia 24 horas, recinto privado de acceso controlado y seguro del vehículo incluido.",
        },
        {
          pregunta: "¿El precio incluye entrega y recogida en terminal?",
          respuesta:
            "Sí. El servicio de entrega y recogida en la terminal (T1, T2 o T4) está incluido en el precio, sin costes adicionales.",
        },
        {
          pregunta: "¿Cómo se calcula el precio del parking larga estancia?",
          respuesta:
            "El precio se calcula en función del número de días de estancia. Usa nuestro calculador online para obtener el precio exacto al instante sin compromiso.",
        },
        {
          pregunta: "¿Qué pasa si mi vuelo de regreso se retrasa?",
          respuesta:
            "Si tu vuelo llega con retraso, comunícalo por WhatsApp para coordinar la recogida del vehículo a la hora correcta sin problema.",
        },
        {
          pregunta: "¿Puedo cancelar o modificar una reserva de larga estancia?",
          respuesta:
            "Sí. Puedes solicitar cambios o cancelaciones antes del viaje contactando al equipo por WhatsApp o teléfono con los datos de tu reserva.",
        },
      ]}
      internalLinks={[
        { href: "/parking-barajas/", text: "Parking Barajas" },
        { href: "/parking-terminal-1-barajas/", text: "Parking Terminal 1 Barajas" },
        { href: "/parking-terminal-2-barajas/", text: "Parking Terminal 2 Barajas" },
        { href: "/parking-terminal-4-barajas/", text: "Parking Terminal 4 Barajas" },
        { href: "/parking-valet-aeropuerto-madrid/", text: "Parking Valet Aeropuerto Madrid" },
        { href: "/parking-aeropuerto-madrid-barato/", text: "Parking Barato Barajas" },
      ]}
    />
  );
}
