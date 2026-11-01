import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { EventCategories } from "@/components/landing/EventCategories";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { ExamplePlans } from "@/components/landing/ExamplePlans";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <Hero />
      <EventCategories />
      <HowItWorks />
      <Features />
      <ExamplePlans />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
