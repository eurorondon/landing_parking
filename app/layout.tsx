import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Manrope, Inter } from "next/font/google";
import { SITE_URL, OG_IMAGE } from "@/lib/seo";

// Autoalojadas con next/font (antes <link> a fonts.googleapis.com): evita los
// dos saltos de red a fonts.googleapis.com + fonts.gstatic.com antes de
// poder pintar el texto, y el posible salto de layout (CLS) al cambiar de la
// fuente de reserva a la definitiva. Manrope la usa la landing, Inter el
// panel de administración (ver app/(site)/landing.css y app/admin/admin.css).
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",   // expone env(safe-area-inset-*) en CSS
};

export const metadata: Metadata = {
  // Base para que og:image, canonical, etc. salgan como URL absoluta
  // (sin esto Next usaba http://localhost:3000)
  metadataBase: new URL(SITE_URL),
  title: "Parking Aero Madrid | Reserva en Barajas sin estrés",
  description:
    "Reserva tu parking en Madrid-Barajas en menos de 1 minuto. Entrega y recogida en terminal, servicio 24 horas y sin pago anticipado.",
  icons: {
    icon:  "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "Parking Aero Madrid",
    description:
      "Deja tu coche en la terminal y viaja sin estrés. Reserva online sin pago anticipado.",
    images: [OG_IMAGE],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        {/* GTM Consent Mode v2 — estado DENEGADO por defecto antes de que el usuario elija */}
        <Script
          id="gtm-consent-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                functionality_storage: 'granted',
                security_storage: 'granted',
                wait_for_update: 500
              });
            `,
          }}
        />
      {/* Google Tag Manager — script */}
      <Script
        id="google-tag-manager"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          // GTM se carga en la primera interaccion (scroll, toque, clic, tecla) o,
          // como tope, a los 8 s. Los eventos del dataLayer (p. ej. reserva_confirmada)
          // se encolan y GTM los procesa al cargar, asi que no se pierde ninguno.
          __html: `(function(w,d,s,l,i){
var started=false;
function load(){
if(started)return;started=true;
w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
}
['scroll','pointerdown','touchstart','keydown','mousemove'].forEach(function(e){w.addEventListener(e,load,{once:true,passive:true});});
setTimeout(load,8000);
})(window,document,'script','dataLayer','GTM-T7Q228H4');`,
        }}
      />
      </head>
      <body style={{ margin: 0 }}>
        {/* Google Tag Manager — noscript fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T7Q228H4"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
