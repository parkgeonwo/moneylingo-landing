import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import StoreBar from "@/components/StoreBar";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <StoreBar />
    </>
  );
}
