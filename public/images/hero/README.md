# Hero Images

This directory contains the static brand images for the landing page hero carousel.

## Required Files

The following image files are required for the hero carousel to function properly:

- `hero-1.jpg` - Primary hero image (loaded with priority for LCP optimization)
- `hero-2.jpg` - Second carousel image
- `hero-3.jpg` - Third carousel image
- `hero-4.jpg` - Fourth carousel image

## Image Specifications

- **Format**: JPG (optimized for web)
- **Dimensions**: Minimum 1920x1080px (Full HD), recommended 2560x1440px or higher
- **Aspect Ratio**: 16:9 or wider
- **Quality**: High quality (85-90%)
- **Subject**: Premium vacation rental properties, coastal destinations, resort views
- **Style**: Cinematic, luxury aesthetic matching the REMAL brand

## Usage

These images are used by `components/public/hero/HeroCarousel.tsx` and cycle automatically every 7 seconds with a 1200ms crossfade transition.

The first image (`hero-1.jpg`) is loaded with `priority` flag for optimal Largest Contentful Paint (LCP) performance.

## Note for Development

Until actual brand images are provided by the design team, you can use temporary placeholder images. However, ensure they:

- Match the required dimensions
- Are properly optimized for web
- Are stored directly in this directory (NOT fetched from external URLs)
