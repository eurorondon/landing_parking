import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BookingForm from "@/components/BookingForm";
import TrustBar from "@/components/TrustBar";
import Benefits from "@/components/Benefits";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import StickyButtons from "@/components/StickyButtons";

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
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <StickyButtons />
    </>
  );
}
