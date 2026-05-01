// ═══════════════════════════════════════════════════════════
// components/public/unit/UnitGallery.tsx
// Hero image + thumbnail strip — receives sorted images as prop
// ═══════════════════════════════════════════════════════════

"use client";
import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useImageReveal } from "@/lib/hooks/animations";
import { getImageUrl } from "@/lib/utils/image";
import { Camera } from "lucide-react";
import type { UnitImage } from "@/lib/types/public.types";

// Dynamic import lightbox — heavy component with keyboard/touch handlers
const GalleryLightbox = dynamic(
  () =>
    import("./GalleryLightbox").then((mod) => ({
      default: mod.GalleryLightbox,
    })),
  { ssr: false }
);

interface UnitGalleryProps {
  images: UnitImage[];
  unitName: string; // for alt text
}

export function UnitGallery({ images, unitName }: UnitGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const heroRef = useImageReveal<HTMLDivElement>();

  // Empty state — no images uploaded yet
  if (images.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-2xl bg-neutral-100 lg:h-[500px]">
        <div className="text-center text-neutral-400">
          <Camera className="mx-auto mb-2 h-12 w-12" />
          <p className="text-sm">No photos available</p>
        </div>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  if (!activeImage) return null; // Safety check

  return (
    <div className="space-y-3">
      {/* Hero Image */}
      <div
        ref={heroRef}
        className="group relative h-[400px] w-full cursor-pointer overflow-hidden rounded-2xl motion-safe:opacity-0 lg:h-[500px]"
        onClick={() => setIsLightboxOpen(true)}
      >
        <Image
          src={getImageUrl(activeImage.fileKey)} // P02: fileKey, NOT imageUrl
          alt={`${unitName} - Photo ${activeIndex + 1}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority={activeIndex === 0} // First image is above the fold
        />

        {/* Cover Badge */}
        {activeImage.isCover && ( // P02: isCover, NOT isPrimary
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-800 shadow-sm backdrop-blur-sm">
            Cover Photo
          </span>
        )}

        {/* Click to Expand Hint */}
        <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          Click to expand
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={`
                lg:h-18 relative h-16 w-20 shrink-0 overflow-hidden
                rounded-lg transition-all duration-200 lg:w-24
                ${
                  index === activeIndex
                    ? "opacity-100 ring-2 ring-primary-500 ring-offset-2"
                    : "opacity-70 hover:opacity-100"
                }
              `}
            >
              <Image
                src={getImageUrl(image.fileKey)} // P02: fileKey, NOT imageUrl
                alt={`${unitName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox — dynamically loaded */}
      {isLightboxOpen && (
        <GalleryLightbox
          images={images}
          initialIndex={activeIndex}
          unitName={unitName}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
}
