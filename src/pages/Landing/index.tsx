import Hero from "../../components/landing/Hero";
import TrustedBy from "../../components/landing/TrustedBy";
import Features from "../../components/landing/Features";
import HowItWorks from "../../components/landing/HowItWorks";
import AlbumPreview from "../../components/landing/AlbumPreview";
import PricingPreview from "../../components/landing/PricingPreview";
import FAQ from "../../components/landing/FAQ";
import CTA from "../../components/landing/CTA";

export default function Landing() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <AlbumPreview />
      <PricingPreview />
      <FAQ />
      <CTA />
    </>
  );
}

