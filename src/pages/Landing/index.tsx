import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../../components/landing/Hero";
import TrustedBy from "../../components/landing/TrustedBy";
import Features from "../../components/landing/Features";
import HowItWorks from "../../components/landing/HowItWorks";
import AlbumPreview from "../../components/landing/AlbumPreview";
import PricingPreview from "../../components/landing/PricingPreview";
import FAQ from "../../components/landing/FAQ";
import CTA from "../../components/landing/CTA";

export default function Landing() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.startsWith("#") ? hash.substring(1) : hash;
      const element = document.getElementById(targetId);
      if (element) {
        // Subtle delay to ensure page rendering completes before smooth scroll
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [hash]);

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

