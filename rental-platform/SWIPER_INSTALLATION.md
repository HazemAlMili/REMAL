# Swiper Installation Required

## Overview

The Featured Units carousel (FE-7-LP-06) requires the Swiper library to be installed.

## Installation Command

```bash
npm install swiper
```

Or with legacy peer deps if needed:

```bash
npm install swiper --legacy-peer-deps
```

## Why Swiper?

Swiper is used for the Featured Units carousel on the landing page because:

1. **Peek Layout**: Supports partial slide visibility (`slidesPerView: 1.2, 2.5, 3.5`)
2. **Free Mode**: Natural momentum-based swiping
3. **Responsive**: Different slide counts per breakpoint
4. **Touch Support**: Native mobile swipe gestures
5. **Navigation**: Custom arrow buttons for desktop
6. **Performance**: GPU-accelerated transforms

## Dynamic Loading

Swiper is loaded via `next/dynamic` with `ssr: false` to:

- Avoid SSR hydration mismatches (Swiper is client-only)
- Reduce initial bundle size (Swiper loads only when needed)
- Show skeleton loading state while Swiper loads

## Files Using Swiper

- `components/public/sections/FeaturedUnitsSection.tsx` - Dynamic import wrapper
- `components/public/sections/FeaturedUnitsCarousel.tsx` - Swiper instance

## CSS Imports

Swiper CSS is imported only in `FeaturedUnitsCarousel.tsx` (not globally):

```typescript
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
```

This keeps the CSS scoped to components that actually use Swiper.

## Verification

After installation, verify with:

```bash
npm list swiper
```

Expected output:
```
swiper@11.x.x
```

## Build

The application will not build successfully until Swiper is installed. You'll see import errors like:

```
Module not found: Can't resolve 'swiper/react'
Module not found: Can't resolve 'swiper/modules'
```

Install Swiper to resolve these errors.
