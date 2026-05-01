// ═══════════════════════════════════════════════════════════
// components/public/sections/NewsletterCtaSection.tsx
// Full-width CTA — parallax bg + newsletter form + Browse CTA
// ═══════════════════════════════════════════════════════════

"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTextReveal, useFadeUp, useParallax } from "@/lib/hooks/animations";
import { ROUTES } from "@/lib/constants/routes";
import { CheckCircle, ArrowRight } from "lucide-react";

// Simple email regex — sufficient for client-side validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterCtaSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Animation hooks
  const headingRef = useTextReveal<HTMLHeadingElement>({
    type: "words",
    stagger: 0.06,
  });
  const subtitleRef = useFadeUp<HTMLParagraphElement>({ delay: 0.3 });
  const formRef = useFadeUp<HTMLDivElement>({ delay: 0.4, y: 20 });
  const ctaRef = useFadeUp<HTMLDivElement>({ delay: 0.5, y: 20 });
  const parallaxRef = useParallax<HTMLDivElement>(0.3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    // No backend call — newsletter is Phase 2
    // Just show success message
    setSubmitted(true);
  };

  return (
    <section className="relative overflow-hidden py-24 lg:py-36">
      {/* Parallax Background Image */}
      <div className="absolute inset-0">
        <div ref={parallaxRef} className="absolute inset-0 -inset-y-20">
          <Image
            src="/images/brand/cta-bg.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            quality={85}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 to-black/80" />

      {/* Content */}
      <div className="relative z-20 mx-auto max-w-container px-6 text-center">
        {/* Heading */}
        <h2
          ref={headingRef}
          className="mx-auto max-w-3xl font-display text-3xl font-bold leading-tight text-white motion-safe:opacity-0 md:text-4xl lg:text-6xl"
        >
          Start Your Journey
        </h2>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/70 motion-safe:opacity-0 lg:mt-6 lg:text-lg"
        >
          Subscribe to receive exclusive deals, new property listings, and
          travel inspiration
        </p>

        {/* Newsletter Form / Success State */}
        <div ref={formRef} className="mt-8 motion-safe:opacity-0 lg:mt-10">
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-md flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
              noValidate
            >
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter your email"
                  className={`
                    w-full rounded-xl border bg-white/10
                    px-4 py-3
                    backdrop-blur-sm ${error ? "border-red-400" : "border-white/20"}
                    text-sm text-white
                    outline-none
                    transition-colors
                    duration-200 [color-scheme:dark] placeholder:text-white/40
                    focus:border-primary-500 focus:ring-1
                    focus:ring-primary-500
                  `}
                  aria-label="Email address"
                  aria-invalid={!!error}
                  aria-describedby={error ? "email-error" : undefined}
                />
                {error && (
                  <p
                    id="email-error"
                    className="mt-1.5 text-left text-xs text-red-400"
                  >
                    {error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="
                  whitespace-nowrap rounded-xl bg-primary-500
                  px-6 py-3
                  text-sm font-medium text-white
                  transition-colors duration-200
                  hover:bg-primary-600
                  active:scale-[0.98]
                "
              >
                Subscribe
              </button>
            </form>
          ) : (
            <div className="motion-safe:animate-fade-in flex items-center justify-center gap-2 text-white">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-base font-medium">
                Thank you! We&apos;ll be in touch.
              </span>
            </div>
          )}
        </div>

        {/* Browse CTA */}
        <div ref={ctaRef} className="mt-8 motion-safe:opacity-0">
          <Link
            href={ROUTES.unitsList}
            className="
              inline-flex h-12 items-center justify-center
              gap-2 rounded-lg border
              border-white/30 px-6
              text-base font-medium text-white
              transition-colors duration-150
              hover:border-white/50 hover:bg-white/10
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
            "
          >
            Browse Properties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
