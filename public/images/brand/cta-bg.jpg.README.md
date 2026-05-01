# Newsletter CTA Background Image

**File**: `cta-bg.jpg`  
**Location**: `/public/images/brand/cta-bg.jpg`  
**Used in**: `NewsletterCtaSection` component (FE-7-LP-10)

## Specifications

- **Dimensions**: 1920×1080px minimum (16:9 aspect ratio recommended)
- **Format**: JPEG (optimized for web)
- **Quality**: High quality (85-90%)
- **Subject**: Dramatic landscape or property view suitable for dark overlay
- **Style**: Premium, aspirational, matches brand aesthetic

## Usage

This image serves as the parallax background for the newsletter CTA section at the bottom of the landing page. It should:

- Work well with a dark gradient overlay (`from-black/60 to-black/80`)
- Ensure white text remains readable
- Convey luxury and aspiration
- Complement the overall landing page visual narrative

## Parallax Effect

The image uses `useParallax(0.3)` which moves it at 30% of scroll speed. The wrapper extends beyond section bounds (`-inset-y-20`) to prevent visible edges during parallax movement.

## Placeholder

Until a final image is selected, use a high-quality stock photo of:

- Egyptian coastal sunset
- Luxury villa exterior at dusk
- Resort pool with ocean view
- Desert landscape with modern architecture

Ensure the image has sufficient visual interest but doesn't compete with the white text overlay.
