// ═══════════════════════════════════════════════════════════
// app/page.tsx — Landing page (root route)
// ═══════════════════════════════════════════════════════════

import { HeroSection } from "@/components/public/hero/HeroSection";
import { MarqueeBanner } from "@/components/public/sections/MarqueeBanner";
import { BrandStorySection } from "@/components/public/sections/BrandStorySection";
import { AreasSection } from "@/components/public/sections/AreasSection";
import { FeaturedUnitsSection } from "@/components/public/sections/FeaturedUnitsSection";
import { MapSection } from "@/components/public/sections/MapSection";
import { HowItWorksSection } from "@/components/public/sections/HowItWorksSection";
import { TestimonialsSection } from "@/components/public/sections/TestimonialsSection";
import { NewsletterCtaSection } from "@/components/public/sections/NewsletterCtaSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeBanner />
      <BrandStorySection />
      <AreasSection />
      <FeaturedUnitsSection />
      <MapSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <NewsletterCtaSection />
    </>
  );
}
