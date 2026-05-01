━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WAVE QA REVIEW PROMPT
Wave: 7 (Part 1) — Guest App: Infrastructure + Landing Page
Tickets: FE-7-INFRA-01..03, FE-7-LP-01..10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are a senior QA engineer reviewing Wave 7 Part 1.

## MOCK DATA AUDIT — HARD GATE

```bash
# Unit data on landing page:
grep -rn "const units = \\[\\|const mockUnits\\|sampleUnits\\|fakeName\\|fakePrice" \\
  --include="*.ts" --include="*.tsx" components/public/

# Area data:
grep -rn "Palm Hills\\|Abraj Al Alamein\\|North Coast\\|mockArea\\|fakeArea" \\
  --include="*.ts" --include="*.tsx" components/public/sections/ components/public/cards/
# ↑ Area names must ONLY come from GET /api/areas — never hardcoded in components

# Review data in testimonials:
grep -rn "mockReview\\|fakeReview\\|sampleReview\\|Amazing stay\\|Beautiful villa" \\
  --include="*.ts" --include="*.tsx" components/public/sections/TestimonialsSection.tsx \\
  components/public/cards/TestimonialCard.tsx

# Hero images from external URLs:
grep -rn "unsplash.com\\|picsum.photos\\|placeholder.com\\|cloudinary.com" \\
  --include="*.ts" --include="*.tsx" components/public/hero/

# Hardcoded user/auth states:
grep -rn "mockUser\\|fakeToken\\|isLoggedIn.*true\\|isLoggedIn.*false" \\
  --include="*.ts" --include="*.tsx" components/public/layout/

# Enum case violations:
grep -rn "'villa'\\|'chalet'\\|'studio'" \\
  --include="*.ts" --include="*.tsx" lib/types/public.types.ts
# ↑ unitType IS lowercase — this is CORRECT (only exception)

grep -rn "'website'\\|'app'\\|'whatsapp'" \\
  --include="*.ts" --include="*.tsx" lib/types/public.types.ts lib/api/services/public.service.ts
# ↑ source must be PascalCase: 'Website', 'App', 'WhatsApp'

# Wrong field names (P01–P06):
grep -rn "unitName\\|unitId.*public\\|capacity\\|numberOfGuests\\|imageUrl\\|checkInDate.*lead\\|checkOutDate.*lead\\|totalAmount.*pricing\\|totalReviews\\|ratingBreakdown\\|clientName.*review" \\
  --include="*.ts" --include="*.tsx" lib/types/public.types.ts lib/api/services/public.service.ts lib/hooks/usePublic.ts
# ↑ All of these are WRONG for public endpoints. Zero matches expected.
```

## API CONTRACT VERIFICATION

### Public Unit Types (P01, P30):

- [ ]  `PublicUnitListItem.id` used (NOT `unitId` — that's owner portal P30)
- [ ]  `PublicUnitListItem.name` used (NOT `unitName` — that's owner portal P30)
- [ ]  `PublicUnitListItem.maxGuests` used (NOT `capacity` or `numberOfGuests` — P01)
- [ ]  `PublicUnitListItem.isActive` is `boolean` (NOT `status: UnitStatus` — P01)
- [ ]  `PublicUnitListItem.bedrooms` and `bathrooms` present (P01)
- [ ]  `PublicUnitDetail` extends list item with `description`, `address`, `updatedAt`
- [ ]  `unitType` values are lowercase: `'villa'` | `'chalet'` | `'studio'`

### Unit Images (P02):

- [ ]  `UnitImageResponse.fileKey` used (NOT `imageUrl`)
- [ ]  Image URL built from `${NEXT_PUBLIC_STORAGE_URL}/${fileKey}`
- [ ]  `getCoverImageUrl()` finds `isCover: true`, falls back to first by `displayOrder`
- [ ]  Placeholder image when no images: `/images/placeholder-unit.jpg`

### Availability & Pricing (P04, P05):

- [ ]  `checkAvailability()` sends `{ startDate, endDate }` (NOT `checkInDate`/`checkOutDate` — P04)
- [ ]  `calculatePricing()` sends `{ startDate, endDate }` (NOT `checkInDate`/`checkOutDate` — P05)
- [ ]  Availability response: `blockedDates` is flat `string[]` (NOT objects — P04)
- [ ]  Pricing response: `totalPrice` used (NOT `totalAmount` — P05)
- [ ]  Pricing response: `nights[{ date, pricePerNight, priceSource }]` (P05)

### CRM Lead / Booking Form (P06):

- [ ]  `PublicCreateCrmLeadRequest.targetUnitId` used (NOT `unitId` — P06)
- [ ]  `PublicCreateCrmLeadRequest.guestCount` used (NOT `numberOfGuests` — P06)
- [ ]  `PublicCreateCrmLeadRequest.desiredCheckInDate` used (NOT `checkInDate` — P06)
- [ ]  `PublicCreateCrmLeadRequest.desiredCheckOutDate` used (NOT `checkOutDate` — P06)
- [ ]  `PublicCreateCrmLeadRequest.source` is PascalCase: `'Website'` | `'App'`
- [ ]  `PublicCreateCrmLeadResponse.id` used (NOT `leadId` — P06)
- [ ]  `PublicCreateCrmLeadResponse.leadStatus` used (NOT `status` — P06)
- [ ]  Endpoint: `POST /api/crm/leads` (public, no auth)

### Public Reviews (P22, P23):

- [ ]  `PublishedReviewListItem.reviewId` used (NOT `id` — §23)
- [ ]  `PublishedReviewListItem` has NO `clientName` field (P23)
- [ ]  `PublicReviewSummary.publishedReviewCount` used (NOT `totalReviews` — P22)
- [ ]  `PublicReviewSummary.averageRating` present (P22)
- [ ]  `PublicReviewSummary.lastReviewPublishedAt` present (P22)
- [ ]  NO `ratingBreakdown` field in summary (P22)
- [ ]  Testimonial cards use "Verified Guest" attribution (no client names)

### Public Unit Filters (P34):

- [ ]  `PublicUnitFilters` only has `page` + `pageSize` (no undocumented params)
- [ ]  URL params `areaId`, `checkIn`, `checkOut`, `guests` are router-level only
- [ ]  ⚠️ Backend confirmation needed if server-side filtering is desired

### Pagination:

- [ ]  `PaginationMeta` uses `totalCount` and `totalPages` (NOT `total`, `count`, `pages`)
- [ ]  `usePublicUnits` uses `placeholderData: keepPreviousData` (TanStack v5 syntax)

## PER-TICKET CHECKS

### FE-7-INFRA-01 — Service Layer + Public Types

- [ ]  `PublicUnitListItem` has all 11 fields matching API §5
- [ ]  `PublicUnitDetail` has all 13 fields matching API §5
- [ ]  `PublishedReviewListItem` has all 8 fields matching API §23
- [ ]  `PublicReviewSummary` has all 4 fields matching API §23
- [ ]  `PublicCreateCrmLeadRequest` has all 10 fields matching API §13
- [ ]  `PublicCreateCrmLeadResponse` has all 16 fields matching API §13
- [ ]  `publicService` has 11 methods covering all public endpoints
- [ ]  `usePublic.ts` has 8 query hooks + 3 mutation hooks
- [ ]  All hooks use `enabled: !!id` where appropriate
- [ ]  Barrel export in `lib/types/index.ts` updated
- [ ]  Zero `any` types

### FE-7-INFRA-02 — GSAP + Animation Hooks

- [ ]  `GsapProvider` registers `ScrollTrigger` + `useGSAP` plugins
- [ ]  `GsapProvider` syncs with `window.__lenis` via `ScrollTrigger.scrollerProxy`
- [ ]  Lenis scroll listener cleaned up on unmount
- [ ]  6 hooks created: `useFadeUp`, `useImageReveal`, `useParallax`, `useTextReveal`, `useStaggerCards`, `useHeroTimeline`
- [ ]  ALL 6 hooks use `useGSAP()` (NOT raw `useEffect` + `gsap`)
- [ ]  ALL 6 hooks check `prefers-reduced-motion` and skip if true
- [ ]  `useTextReveal` calls `split.revert()` in cleanup
- [ ]  `useParallax` skips on touch devices
- [ ]  `useHeroTimeline` fires on mount (NOT scroll-triggered)
- [ ]  `useStaggerCards` animates direct children of ref container
- [ ]  `GsapProvider` in `app/(public)/layout.tsx` only (NOT root layout)
- [ ]  Barrel export from `lib/hooks/animations/index.ts`

### FE-7-INFRA-03 — Public Layout (Nav + Footer)

- [ ]  `PublicNav` fixed at top with `z-50`
- [ ]  Nav transitions: transparent → solid at `scrollY > 80`
- [ ]  Transition: `duration-300` with `ease-out-quart`
- [ ]  Scroll reads from `window.__lenis?.scroll` with native fallback
- [ ]  Both scroll listeners cleaned up on unmount
- [ ]  Auth state from `useAuthStore()` — not context, not props
- [ ]  Not logged in: "Login" + "Register" visible
- [ ]  Logged in: "My Account" visible
- [ ]  Mobile hamburger toggles `MobileMenu`
- [ ]  `MobileMenu` closes on route change
- [ ]  `GsapProvider` wraps public layout
- [ ]  No `<SmoothScrollProvider>` duplication
- [ ]  No `<QueryClientProvider>` duplication
- [ ]  Footer: `bg-neutral-900`, platform name, links, copyright with dynamic year
- [ ]  Route strings from `ROUTES` constants (no hardcoded paths)

### FE-7-LP-01 — Hero Section

- [ ]  Full viewport `h-screen` with `overflow-hidden`
- [ ]  `HeroCarousel`: 7s interval, 1200ms crossfade, CSS opacity transition
- [ ]  First image: `priority` flag on `next/image` (LCP)
- [ ]  Gradient overlay: `rgba(13,11,10,0.15)` top → `rgba(13,11,10,0.65)` bottom
- [ ]  `useHeroTimeline` fires 6-element sequence on mount
- [ ]  `useTextReveal` on heading (word-by-word)
- [ ]  `ScrollIndicator` with `animate-hero-bounce`
- [ ]  `prefers-reduced-motion`: no carousel, no GSAP, all content visible
- [ ]  `motion-safe:opacity-0` pattern used (NOT bare `opacity-0`)
- [ ]  Static images from `/public/images/hero/` (NOT API)

### FE-7-LP-02 — Hero Search Bar

- [ ]  Glass morphism: `bg-white/10 backdrop-blur-md border-white/20 rounded-2xl`
- [ ]  Areas from `usePublicAreas()` (real API, not hardcoded)
- [ ]  Only active areas in dropdown
- [ ]  "All Areas" default option
- [ ]  Check-in min: today
- [ ]  Check-out min: check-in + 1 day
- [ ]  Check-out disabled until check-in selected
- [ ]  Check-out resets when check-in changes past it
- [ ]  `GuestSelector`: min 1, max 20, default 2
- [ ]  Submit: `router.push('/units?areaId=...&checkIn=...&checkOut=...&guests=...')`
- [ ]  Only non-empty, non-default params in URL
- [ ]  `[color-scheme:dark]` on date inputs
- [ ]  No API call on submit (navigation only)

### FE-7-LP-03 — Marquee Banner

- [ ]  Pure CSS animation (`@keyframes marquee`, `translateX(-50%)`)
- [ ]  Two copies of content for seamless loop
- [ ]  Pauses on hover
- [ ]  `motion-reduce:[animation-play-state:paused]`
- [ ]  `overflow-hidden` on container
- [ ]  `select-none` prevents text selection
- [ ]  `sr-only` text for screen readers
- [ ]  `aria-hidden="true"` on scrolling strips
- [ ]  No JavaScript animation
- [ ]  `bg-neutral-900`, white text, uppercase

### FE-7-LP-04 — Brand Story

- [ ]  Two-column grid: text left, image right (desktop)
- [ ]  Mobile: image first, text below (order swap)
- [ ]  `useTextReveal()` on heading
- [ ]  `useFadeUp({ delay: 0.3 })` on paragraph
- [ ]  `useImageReveal()` on image container
- [ ]  `useParallax(0.2)` on image inner wrapper
- [ ]  Correct nesting: `imageRevealRef` → outer, `parallaxRef` → inner
- [ ]  Static image from `/public/images/brand/`
- [ ]  CTA: "Browse Properties" → `/units`
- [ ]  `motion-safe:opacity-0` on all animated elements

### FE-7-LP-05 — Areas Section

- [ ]  Areas from `usePublicAreas()` (real API)
- [ ]  Only active areas rendered
- [ ]  Section hidden if 0 active areas or API error
- [ ]  Skeleton loading: 6 skeleton cards
- [ ]  `useStaggerCards({ stagger: 0.15 })` on grid
- [ ]  `AreaCard`: background image, gradient overlay, name, description
- [ ]  Image from `/public/images/areas/{area.id}.jpg` with fallback
- [ ]  `onError` fallback to default area image
- [ ]  Hover: image zoom, overlay darken, content shift up
- [ ]  Click → `/units?areaId={area.id}`
- [ ]  ⚠️ No `unitCount` field — backend gap documented
- [ ]  Grid: `cols-1 sm:cols-2 lg:cols-3`

### FE-7-LP-06 — Featured Units Carousel

- [ ]  Units from `GET /api/units?page=1&pageSize=8` via `usePublicUnits`
- [ ]  Section hidden if 0 units or API error
- [ ]  Swiper loaded via `dynamic({ ssr: false })`
- [ ]  Swiper CSS imported only in carousel component
- [ ]  `slidesPerView`: 1.2 → 1.8 (640) → 2.5 (768) → 3.5 (1024)
- [ ]  `freeMode: true`, `loop: false`
- [ ]  Navigation arrows: desktop only, show on carousel hover
- [ ]  No autoplay
- [ ]  `UnitCard` uses `unit.id` (NOT `unitId`) and `unit.name` (NOT `unitName`)
- [ ]  `UnitCard` fetches images via `useUnitImages(unit.id)`
- [ ]  Image URL from `fileKey` (NOT `imageUrl` — P02)
- [ ]  `UnitCard` hover: lift, image zoom, CTA appear
- [ ]  Price: `formatCurrency(unit.basePricePerNight)` + "/ night"
- [ ]  `maxGuests` displayed (NOT `capacity`)
- [ ]  Unit type badge: lowercase → PascalCase label

### FE-7-LP-07 — Map Section

- [ ]  Mapbox loaded via `dynamic({ ssr: false })`
- [ ]  `NEXT_PUBLIC_MAPBOX_TOKEN` from env (never hardcoded)
- [ ]  Map style: `light-v11` (not satellite, not dark)
- [ ]  Centered on Egypt: `[30.8025, 26.8206]`, zoom ~5.5
- [ ]  `scrollZoom: false` (no scroll hijack)
- [ ]  Areas from `usePublicAreas()` (shared cache)
- [ ]  Coordinate mapping from `lib/constants/area-coordinates.ts`
- [ ]  Areas without coordinates gracefully skipped
- [ ]  Custom terracotta markers with `animate-ping` pulse
- [ ]  `motion-reduce:animate-none` on pulse animation
- [ ]  Popup: area name + description + "Browse {name}" link
- [ ]  Popup link → `/units?areaId={area.id}`
- [ ]  Map cleanup: `map.remove()` on unmount
- [ ]  Markers cleanup on areas change
- [ ]  Mapbox CSS imported only in `UnitsMap.tsx`

### FE-7-LP-08 — How It Works

- [ ]  4 steps: Browse, Inquire, Confirm, Check In
- [ ]  Each step: numbered badge, lucide icon, heading, description
- [ ]  `useStaggerCards({ stagger: 0.15 })` on grid
- [ ]  `useFadeUp()` on section heading
- [ ]  Grid: `cols-1 sm:cols-2 lg:cols-4`
- [ ]  Static content (no API)
- [ ]  No click handlers on steps
- [ ]  `motion-safe:opacity-0` on animated elements

### FE-7-LP-09 — Testimonials Carousel

- [ ]  Reviews from `GET /api/public/units/{unitId}/reviews` per curated unit
- [ ]  Curated unit IDs in `lib/constants/curated-units.ts`
- [ ]  `MAX_REVIEWS_PER_UNIT` limits reviews per unit (2)
- [ ]  `review.reviewId` used as key (NOT `id` — §23)
- [ ]  NO `clientName` — "Verified Guest" attribution (P23)
- [ ]  `review.title` shown (reviews have titles)
- [ ]  Comment truncated ~120 chars
- [ ]  `StarRating` component with `aria-label`
- [ ]  Swiper: `autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }`
- [ ]  `loop` only when `reviews.length >= 3`
- [ ]  Pagination dots, NO navigation arrows
- [ ]  Swiper loaded via `dynamic({ ssr: false })`
- [ ]  Empty state: "Be the first to experience our properties"
- [ ]  Section hidden if `TESTIMONIAL_UNIT_IDS` is empty

### FE-7-LP-10 — Newsletter CTA

- [ ]  Full-width dark section with parallax background
- [ ]  `useParallax(0.3)` on background wrapper
- [ ]  Parallax wrapper extends `−inset-y-20` (edge prevention)
- [ ]  Dark gradient overlay: `from-black/60 to-black/80`
- [ ]  `useTextReveal()` on heading
- [ ]  Email input: glass morphism, `[color-scheme:dark]`
- [ ]  Validation: required + valid email (regex)
- [ ]  Error display: red text, red border, clears on type
- [ ]  Submit: NO API call (Phase 2), shows success message
- [ ]  Success: green checkmark + "Thank you! We'll be in touch."
- [ ]  "Browse Properties" ghost button → `/units`
- [ ]  `motion-safe:opacity-0` on animated elements
- [ ]  Background image `aria-hidden="true"`
- [ ]  `aria-label`, `aria-invalid`, `aria-describedby` on email input

## ARCHITECTURE CHECKS

```bash
# Heavy libs must be dynamic():
grep -rn "import.*Swiper\\|import.*mapboxgl\\|import.*Recharts\\|import.*gsap" \\
  --include="*.tsx" components/public/sections/ components/public/map/
# ↑ Direct imports in section components = FAIL. Only dynamic() wrappers allowed.
# Exception: gsap imported in hooks (not sections), GsapProvider handles registration.

# Swiper CSS not global:
grep -rn "swiper/css" --include="*.tsx" --include="*.ts" \\
  app/ lib/
# ↑ Should ONLY appear in FeaturedUnitsCarousel.tsx and TestimonialsCarousel.tsx

# Mapbox CSS not global:
grep -rn "mapbox-gl/dist" --include="*.tsx" --include="*.ts" \\
  app/ lib/
# ↑ Should ONLY appear in UnitsMap.tsx

# No inline endpoint strings:
grep -rn "'/api/\\|\\"\\/api\\/" \\
  --include="*.ts" --include="*.tsx" components/public/ lib/hooks/usePublic.ts
# ↑ Zero matches expected — all endpoints from endpoints.ts

# No localStorage for auth:
grep -rn "localStorage\\|sessionStorage" \\
  --include="*.ts" --include="*.tsx" components/public/ lib/stores/
# ↑ Zero matches expected — tokens in Zustand memory only

# useGSAP used (not raw useEffect + gsap):
grep -rn "useEffect.*gsap\\.\\|useEffect.*ScrollTrigger" \\
  --include="*.ts" --include="*.tsx" lib/hooks/animations/
# ↑ Zero matches expected — all hooks use useGSAP()
# Exception: GsapProvider uses useEffect for Lenis sync (this is correct)

# motion-safe pattern:
grep -rn "className.*opacity-0" \\
  --include="*.tsx" components/public/
# ↑ Every match should be "motion-safe:opacity-0", NOT bare "opacity-0"

# prefers-reduced-motion checked:
grep -rn "prefers-reduced-motion" \\
  --include="*.ts" lib/hooks/animations/
# ↑ Should appear in ALL 6 hook files
```

- [ ]  Swiper never imported at module level in sections — `dynamic()` only
- [ ]  Mapbox never imported at module level — `dynamic()` only
- [ ]  Swiper CSS imported only in carousel components (2 files)
- [ ]  Mapbox CSS imported only in `UnitsMap.tsx` (1 file)
- [ ]  No inline `/api/...` strings in components or hooks
- [ ]  No `localStorage`/`sessionStorage` usage for auth
- [ ]  All animation hooks use `useGSAP()` (not `useEffect` + `gsap`)
- [ ]  All animated elements use `motion-safe:opacity-0` (not bare `opacity-0`)
- [ ]  All 6 animation hooks check `prefers-reduced-motion`
- [ ]  `pnpm type-check` → zero errors
- [ ]  `pnpm build` → zero errors
- [ ]  No mock data anywhere

## PERFORMANCE CHECKS

- [ ]  First hero image has `priority` flag (LCP optimization)
- [ ]  Subsequent hero images lazy-loaded
- [ ]  `next/image` with `fill` + `object-cover` + appropriate `sizes` everywhere
- [ ]  `image.quality` set (80–85) — not default 75
- [ ]  Marquee uses `transform: translateX` (GPU-composited, not layout-triggering)
- [ ]  Parallax uses `transform: translateY` (GPU-composited)
- [ ]  No `will-change` added unnecessarily
- [ ]  `setInterval` in HeroCarousel cleaned up on unmount
- [ ]  Mapbox `map.remove()` on unmount
- [ ]  TanStack Query shared cache: areas fetched once (used by 3+ components)
- [ ]  `usePublicUnits` uses `placeholderData: keepPreviousData` for smooth pagination

## ACCESSIBILITY CHECKS

- [ ]  `prefers-reduced-motion` respected in ALL 6 animation hooks
- [ ]  `prefers-reduced-motion` stops HeroCarousel cycling
- [ ]  `prefers-reduced-motion` stops marquee scrolling
- [ ]  `prefers-reduced-motion` stops marker pulse animation
- [ ]  Marquee: `sr-only` text + `aria-hidden` on scrolling strips + `aria-label` on section
- [ ]  Map: `aria-label` on container
- [ ]  Background/decorative images: `aria-hidden="true"`
- [ ]  Email input: `aria-label`, `aria-invalid`, `aria-describedby`
- [ ]  `StarRating`: `aria-label` (e.g., "4 out of 5 stars")
- [ ]  `GuestSelector` buttons: `aria-label` ("Decrease guests" / "Increase guests")
- [ ]  Mobile menu toggle: `aria-label` ("Open menu" / "Close menu")
- [ ]  All `<Link>` elements use Next.js `<Link>` (not `<a>`)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━