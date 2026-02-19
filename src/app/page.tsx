import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhyCredential from "@/components/WhyCredential";
import Membership from "@/components/Membership";
import Disciplines from "@/components/Disciplines";
import About from "@/components/About";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <WhyCredential />
      <Disciplines />
      <Membership />
      <About />
      <CTA />
      <Footer />
    </main>
  );
}
