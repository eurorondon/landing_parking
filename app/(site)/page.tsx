import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Benefits from "@/components/Benefits";
import HowItWorks from "@/components/HowItWorks";
import Reassurance from "@/components/Reassurance";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Benefits />
        <HowItWorks />
        <Reassurance />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
