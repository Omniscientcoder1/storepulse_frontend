import { CategoryTeaser } from "@/components/sections/category-teaser";
import { ContactBand } from "@/components/sections/contact-band";
import { FeatureShowcase } from "@/components/sections/feature-showcase";
import { FinalCta } from "@/components/sections/final-cta";
import { Hero } from "@/components/sections/hero";
import { PricingSummary } from "@/components/sections/pricing-summary";
import { TestimonialShowcase } from "@/components/sections/testimonial-showcase";
import { TrustBand } from "@/components/sections/trust-band";

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustBand />
      <FeatureShowcase />
      <CategoryTeaser />
      <TestimonialShowcase />
      <PricingSummary />
      <FinalCta />
      <ContactBand />
    </main>
  );
}
