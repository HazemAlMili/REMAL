// ═══════════════════════════════════════════════════════════
// components/public/unit/GalleryLightbox.tsx
// Fullscreen lightbox modal — keyboard + touch navigation
// Loaded via dynamic({ ssr: false }) by parent
// ═══════════════════════════════════════════════════════════

"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { UnitImage } from "@/lib/types/public.types";

interface GalleryLightboxProps {
  images: UnitImage[];
  initialIndex: number;
  unitName: string;
  onClose: () => void;
}

export function GalleryLightbox({
  images,
  initialIndex,
  unitName,
  onClose,
}: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Navigation helpers
  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  // Body scroll lock
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Touch swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]?.clientX ?? null);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? null);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) goNext();
    if (isRightSwipe) goPrev();
  };

  const currentImage = images[currentIndex];

  if (!currentImage) return null; // Safety check

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose} // Click backdrop to close
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close gallery"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Image Counter */}
      <div className="absolute left-4 top-4 text-sm font-medium text-white/70">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Navigation — Previous */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image Container */}
      <div
        className="relative h-[80vh] w-[90vw] max-w-5xl"
        onClick={(e) => e.stopPropagation()} // Don't close when clicking image
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={getImageUrl(currentImage.fileKey)} // P02: fileKey, NOT imageUrl
          alt={`${unitName} - Photo ${currentIndex + 1}`}
          fill
          className="object-contain"
          sizes="90vw"
          priority
        />

        {/* Cover Badge in Lightbox */}
        {currentImage.isCover && ( // P02: isCover, NOT isPrimary
          <span className="absolute left-2 top-2 rounded-full bg-white/20 px-2 py-1 text-xs text-white backdrop-blur-sm">
            Cover
          </span>
        )}
      </div>

      {/* Navigation — Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Thumbnail Strip in Lightbox */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto px-4 py-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`
                relative h-10 w-14 shrink-0 overflow-hidden rounded-md transition-all
                ${
                  index === currentIndex
                    ? "opacity-100 ring-2 ring-white"
                    : "opacity-50 hover:opacity-80"
                }
              `}
            >
              <Image
                src={getImageUrl(image.fileKey)}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
