# Brand Images

This directory contains static brand images for the landing page sections.

## Required Files

The following image files are required for the brand story section:

- `brand-story.jpg` - Brand story section image (split-layout right column)

## Image Specifications

### brand-story.jpg

- **Format**: JPG (optimized for web)
- **Dimensions**: Minimum 1200×1600px (portrait orientation)
- **Aspect Ratio**: 3:4 (desktop) or 4:5 (mobile)
- **Quality**: High quality (85-90%)
- **Subject**: Luxury coastal property, villa exterior, or resort view that represents the REMAL brand
- **Style**: Premium, aspirational, coastal/resort aesthetic

## Usage

These images are used by:

- `components/public/sections/BrandStorySection.tsx` - Uses `brand-story.jpg` with parallax and clip-path reveal animations

The brand story image is loaded with:

- `next/image` with `fill` + `object-cover`
- `sizes="(max-width: 1024px) 100vw, 50vw"` for responsive loading
- `quality={85}` for optimal file size vs quality balance
- Parallax effect via `useParallax(0.2)` hook
- Clip-path reveal animation via `useImageReveal()` hook

## Note for Development

Until actual brand images are provided by the design team, you can use temporary placeholder images. However, ensure they:

- Match the required dimensions and aspect ratio
- Are properly optimized for web
- Are stored directly in this directory (NOT fetched from external URLs)
- Represent the luxury coastal/resort aesthetic of the REMAL brand
