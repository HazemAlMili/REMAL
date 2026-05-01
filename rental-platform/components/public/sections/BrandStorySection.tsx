// ═══════════════════════════════════════════════════════════
// components/public/sections/BrandStorySection.tsx
// Split-layout brand story — text + animated image
// ═══════════════════════════════════════════════════════════

"use client";
import Link from "next/link";
import Image from "next/image";
import {
  useTextReveal,
  useFadeUp,
  useImageReveal,
  useParallax,
} from "@/lib/hooks/animations";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants/routes";

export function BrandStorySection() {
  // Animation hooks — each returns a ref to attach to the target element
  const headingRef = useTextReveal<HTMLHeadingElement>({
    type: "words",
    stagger: 0.06,
  });
  const paragraphRef = useFadeUp<HTMLParagraphElement>({ delay: 0.3 });
  const ctaRef = useFadeUp<HTMLDivElement>({ delay: 0.5, y: 20 });
  const imageRevealRef = useImageReveal<HTMLDivElement>({
    duration: 1.4,
    ease: "power3.inOut",
  });
  const parallaxRef = useParallax<HTMLDivElement>(0.2);

  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="mx-auto max-w-container px-6">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Left — Text Content */}
          <div className="order-2 lg:order-1">
            <span className="font-body text-sm font-medium uppercase tracking-wider text-primary-500">
              Our Story
            </span>

            <h2
              ref={headingRef}
              className="mt-4 font-display text-3xl font-bold leading-tight text-neutral-900 motion-safe:opacity-0 md:text-4xl lg:text-5xl"
            >
              Experience Curated Coastal Living
            </h2>

            <p
              ref={paragraphRef}
              className="mt-6 max-w-lg text-base leading-relaxed text-neutral-600 motion-safe:opacity-0 lg:text-lg"
            >
              REMAL connects discerning travelers with handpicked vacation
              properties across Egypt&apos;s most sought-after coastal and
              resort destinations. Every villa, chalet, and studio in our
              collection is personally vetted for quality, comfort, and that
              unmistakable sense of escape. Our dedicated team handles every
              detail — from your first inquiry to check-in — so you can focus on
              making memories.
            </p>

            <div ref={ctaRef} className="mt-8 motion-safe:opacity-0">
              <Link href={ROUTES.unitsList}>
                <Button variant="primary" size="lg">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — Image with reveal + parallax */}
          <div className="order-1 lg:order-2">
            <div
              ref={imageRevealRef}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl motion-safe:opacity-0 lg:aspect-[3/4]"
            >
              <div ref={parallaxRef} className="absolute inset-0">
                <Image
                  src="/images/brand/brand-story.jpg"
                  alt="Luxury coastal property with sea view"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={85}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
