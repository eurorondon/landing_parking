import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parking Aéreo Madrid | Reserva en Barajas sin estrés",
  description:
    "Reserva tu parking en Madrid-Barajas en menos de 1 minuto. Entrega y recogida en terminal, servicio 24 horas y sin pago anticipado.",
  openGraph: {
    title: "Parking Aéreo Madrid",
    description:
      "Deja tu coche en la terminal y viaja sin estrés. Reserva online sin pago anticipado.",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        {/* Manrope: landing · Inter: panel de administración */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
