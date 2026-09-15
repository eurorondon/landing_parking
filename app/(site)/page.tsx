import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BookingForm from "@/components/BookingForm";
import TrustBar from "@/components/TrustBar";
import Benefits from "@/components/Benefits";
import HowItWorks from "@/components/HowItWorks";
import ServiciosLimpieza from "@/components/ServiciosLimpieza";
import FAQ from "@/components/FAQ";
import SeoHubSection from "@/components/SeoHubSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import StickyButtons from "@/components/StickyButtons";

// El precio "desde" del Hero sale de la BD (registro_precios + seguro); sin
// esto la home queda estática en build y ese precio no se actualiza hasta
// el próximo deploy aunque se cambie en el panel admin.
export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        {/* ── Calculadora de precio (inline, debajo del hero) ── */}
        <section className="bform-section" id="calcular">
          <div className="bform-container">
            <BookingForm />
          </div>
        </section>

        <TrustBar />
        <Benefits />
        <HowItWorks />
        <ServiciosLimpieza />
        <FAQ />

        {/* ── Hub de enlaces internos: landing SEO + blog ── */}
        <SeoHubSection />

        <FinalCTA />
      </main>
      <Footer />
      <StickyButtons />
    </>
  );
}
