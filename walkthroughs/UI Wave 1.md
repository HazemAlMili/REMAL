# FE-0-INFRA-01: Initialize Next.js Project — Walkthrough

## Summary

Initialized a fully configured Next.js 14 project at `rental-platform/` with TypeScript strict mode, App Router, Tailwind CSS, and **all 37 dependencies** required by the 117-ticket Frontend Plan.

## What Was Done

### 1. Project Scaffolding
- Ran `pnpm create next-app@14 rental-platform` with TypeScript, Tailwind, App Router, no src-dir
- Installed pnpm globally (was not available on system)

### 2. Dependencies Installed (37 total)

**Production (23 packages):**
| Package | Purpose |
|---|---|
| `next@14.2.35`, `react@18.3.1`, `react-dom@18.3.1` | Core framework |
| `axios@1.15.2` | HTTP client for .NET 8 API |
| `@tanstack/react-query@5.100.5`, `@tanstack/react-query-devtools@5.100.5` | Server state management |
| `@tanstack/react-table@8.21.3` | Admin data tables |
| `zustand@5.0.12` | Client state management |
| `react-hook-form@7.74.0`, `@hookform/resolvers@3.10.0`, `zod@3.25.76` | Forms + validation |
| `react-day-picker@9.14.0`, `date-fns@3.6.0` | Date selection |
| `clsx@2.1.1`, `tailwind-merge@2.6.1` | Class utilities |
| `lucide-react@0.400.0` | Icons |
| `react-hot-toast@2.6.0` | Toast notifications |
| `recharts@2.15.4` | Admin charts |
| `swiper@11.2.10` | Image carousels |
| `mapbox-gl@3.22.0` | Map integration |
| `gsap@3.15.0`, `@gsap/react@2.1.2` | Animation engine |
| `lenis@1.3.23` | Smooth scrolling |
| `framer-motion@11.18.2` | Page transitions |
| `split-type@0.3.4` | Text animations |
| `next-view-transitions@0.3.5` | View transitions API |

**Dev (14 packages):**
| Package | Purpose |
|---|---|
| `typescript@5.9.3` | Type system |
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/mapbox-gl` | Type definitions |
| `tailwindcss@3.4.19`, `@tailwindcss/forms@0.5.11`, `@tailwindcss/typography@0.5.19` | Styling |
| `postcss@8.5.12`, `autoprefixer@10.5.0` | CSS processing |
| `eslint@8.57.1`, `eslint-config-next@14.2.35` | Linting |
| `prettier@3.8.3`, `prettier-plugin-tailwindcss@0.5.14` | Code formatting |

### 3. Configuration Files Created/Modified

| File | Status | Notes |
|---|---|---|
| `package.json` | Modified | Full dep list + `type-check` and `format` scripts |
| `tsconfig.json` | Modified | Strict mode + `noUncheckedIndexedAccess` + `noImplicitReturns` + `noFallthroughCasesInSwitch` |
| `next.config.mjs` | Modified | Image domains for API at localhost:8080 |
| `tailwind.config.ts` | Modified | Added `@tailwindcss/forms` + `@tailwindcss/typography` plugins |
| `postcss.config.mjs` | Modified | Added `autoprefixer` |
| `.env.example` | Created | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_MAPBOX_TOKEN` |
| `.env.local` | Created | Local env with placeholder values (gitignored) |
| `.prettierrc` | Created | Prettier config with Tailwind plugin |
| `.prettierignore` | Created | Ignore patterns for generated files |
| `.gitignore` | Modified | Added `.env.local` and all env variants |
| `app/layout.tsx` | Modified | Minimal root layout placeholder |
| `app/page.tsx` | Modified | Minimal homepage placeholder |
| `app/globals.css` | Modified | Tailwind directives only |
| `README.md` | Modified | Setup instructions + env docs |

> [!NOTE]
> The ticket spec called for `next.config.ts` but Next.js 14 doesn't support TypeScript config files. Used `next.config.mjs` instead. The config content is identical.

## Verification Results

| Check | Result |
|---|---|
| `pnpm install` | ✅ Zero errors |
| `pnpm type-check` | ✅ Zero TypeScript errors |
| `pnpm build` | ✅ Clean production build |
| `pnpm lint` | ✅ No ESLint warnings or errors |
| `pnpm dev` | ✅ Dev server on port 3000 |
| Homepage renders | ✅ See screenshot below |

### Homepage Screenshot

![Rental Platform homepage placeholder rendering on localhost:3000](C:\Users\User\.gemini\antigravity\brain\9400eb07-0b8c-4d67-8da7-7c2dd1b5ce8e\homepage_screenshot.png)

## Out of Scope (Deferred)

| Item | Ticket |
|---|---|
| Folder structure | FE-0-INFRA-02 |
| Axios instance config | FE-0-INFRA-03 |
| Zustand stores | FE-0-INFRA-05 |
| TanStack Query config | FE-0-INFRA-06 |
| Design System tokens in Tailwind | FE-0-INFRA-08 |
| Custom fonts in layout | FE-0-INFRA-08 |
| Lenis Smooth Scroll Provider | FE-0-INFRA-09 |
| Page transition template | FE-0-INFRA-09 |

---

# FE-0-INFRA-02: Create Complete Folder Structure Scaffold — Walkthrough

## Summary

Successfully generated the complete folder scaffold for the 117-ticket Frontend Plan in the `rental-platform/` Next.js App Router project. All designated directories for UI components, libs, contexts, API services, and pages have been created with `.gitkeep` placeholders to ensure proper Git tracking. This allows parallel UI components and feature branches to snap into place smoothly without structural conflicts.

## What Was Done

### 1. Route Groups Initialized
Created placeholder directories for all application facets inside `app/`:
- `(admin)`
- `(owner)`
- `(public)`
- `(auth)`
- `api`

### 2. Component Domain Structure
Scaffolded deep component folder tree for clear domain separation:
- **`components/ui/`**: Base UI elements with `index.ts` barrel file
- **`components/admin/`**: `layout`, `crm`, `bookings`, `units`, `finance`, `owners`, `clients`, `reviews`, `notifications`, `dashboard`, `settings`
- **`components/owner/`**: `layout`, `units`, `bookings`, `finance`, `dashboard`, `notifications`, `reviews`
- **`components/public/`**: `layout`, `hero`, `sections`, `cards`, `search`, `unit`, `account`, `booking`, `animations`
- **`components/auth/`**: Shared auth UI components

### 3. Utility & Library Structure
Set up robust context for stores, types, and hooks inside `lib/`:
- `api/` & `api/services/`
- `hooks/`
- `stores/`
- `providers/`
- `types/` with `index.ts` barrel file
- `utils/` with `index.ts` barrel file
- `constants/` with `index.ts` barrel file

### 4. Styles & Assets
- `styles/`
- `public/images/`, `public/videos/`, `public/fonts/`

### 5. Next.js App Placeholders
Configured required App Router fallbacks to prevent runtime crashes:
- `app/not-found.tsx`: Exported simple React string rendering placeholder.
- `app/error.tsx`: Set up as `'use client'` component, satisfying Next.js strict mode unused variable rules for `error` and `reset` by consuming them effectively.

## Verification Results

| Check | Result | Description |
|---|---|---|
| `pnpm type-check` | ✅ Passed | Zero TS errors. All barrel `index.ts` validly `export {}`. |
| `pnpm build` | ✅ Passed | Zero build errors. `error.tsx` / `not-found.tsx` build cleanly without strict lint issues. |
| `.gitkeep` presence | ✅ Verified | All empty folders contain `.gitkeep` for version control. |

## Out of Scope (Deferred)

- Actual implementations for components inside `components/` (Wave 1+)
- Implementation of the `axios` instance (`lib/api`) or API endpoints (FE-0-INFRA-03)
- Stores logic like `Zustand` (`lib/stores`) (FE-0-INFRA-05)
- Actual pages (`page.tsx`) or layout (`layout.tsx`) bindings per domain (Wave 1+)

---

# FE-0-INFRA-03: Create Axios Instance — Walkthrough

## Summary

Created the single, globally configured `Axios` instance in `lib/api/axios.ts` to power all data fetching operations. The implementation establishes robust error handling, token attachment with a queued automatic-refresh strategy for 401s, and a clean mechanism to directly unwrap typed API responses.

## What Was Done

### 1. Typings & Architecture (`lib/api/types.ts` & `lib/api/api-error.ts`)
- Configured a generic `ApiResponse<T>` interface that strictly aligns with the backend’s standard response envelope format.
- Implemented `PaginationMeta` matching the API spec.
- Crafted a custom `ApiError` class extending native JavaScript `Error`, which propagates `status` codes and field-level validation `errors` transparently to caller hooks and forms. Included `hasFieldErrors()` utility.

### 2. Base Axios Instance (`lib/api/axios.ts`)
- Defined base configuration utilizing `NEXT_PUBLIC_API_URL` environment variables.
- Standardized `timeout` (30s), default headers, and enabled `withCredentials: true` globally for HTTPOnly cookie exchanges.

### 3. Global Interceptors
- **Request Interceptor**: Implemented scaffold framework to pull tokens from the Zustand auth store (`TODO` marker bound to FE-1-AUTH-05).
- **Response Interceptor**:
  - Validates response format and unwraps the nested `.data` cleanly, so consuming code receives generic objects unboxed.
  - Intercepts 401s uniquely: Leveraged a singleton `refreshQueue` with an `isRefreshing` lock flag. When hit with simultaneous 401s, it issues a single refresh request, queues subsequent pending requests, and re-dispatches them once a fresh token is confirmed.
  - Implemented `catch` flows on failed refresh indicating `clearAuth()` steps (`TODO` marker bound to FE-1-AUTH-05).
  - Wired `TODO` blocks bound to FE-1-UI-09 for global 403 and 500 Toast error notifications.

## Verification Results

| Check | Result | Description |
|---|---|---|
| `pnpm type-check` | ✅ Passed | Zero TS errors. The explicitly coerced Axios typings resolve successfully without explicit `any` overrides. |
| `pnpm lint` | ✅ Passed | Zero ESLint issues. |

## Out of Scope (Deferred)

- **Toast Notifications**: Wiring to `react-hot-toast` (FE-1-UI-09)
- **Auth Store Connectivity**: Resolving Zustand integration (FE-1-AUTH-05)
- **Endpoint Definitions**: Creation of `lib/api/endpoints.ts` (FE-0-INFRA-04)

---

# FE-0-INFRA-04: Create Endpoints Constants File — Walkthrough

## Summary

Successfully extracted all 139 backend endpoints outlined in the technical requirements into a robust, strongly-typed constants file (`lib/api/endpoints.ts`). This completely eliminates hardcoded `/api/` strings globally in the application, making route tracking and autocomplete flawless.

## What Was Done

### 1. Unified Endpoint Registry (`lib/api/endpoints.ts`)
- Handcrafted the entirety of the application's endpoints according to the Swagger spec definitions.
- Segmented the registry into 30 specific domain trees (e.g., `auth`, `adminUsers`, `internalBookings`, `publicReviews`, `ownerPortal`).
- Utilized dynamic helper functions strictly typing URL string permutations that enforce `(id: string)` or multiple parameter passing requirements.
- Strictly pinned the resulting nested object definition using `as const` trailing inference, ensuring exhaustive typed IntelliSense properties for service files executing in future tickets.

## Verification Results

| Check | Result | Description |
|---|---|---|
| `pnpm type-check` | ✅ Passed | The nested object effectively casts all permutations correctly. |
| `pnpm lint` | ✅ Passed | Zero ESLint failures inside the generated endpoints file. |

---

# FE-0-INFRA-05: Create Zustand Stores — Walkthrough

## Summary

Implemented two robust, globally accessible state stores using `zustand` v5: **Auth Store** and **UI Store**. These stores cleanly decouple client UI state and active user session data without risking SSR hydration mismatches or state synchronization errors.

## What Was Done

### 1. Core Auth Store (`lib/stores/auth.store.ts`)
- Built `useAuthStore` to securely hold the `AuthenticatedUserResponse`, `AuthRole`, and the `accessToken` entirely in memory.
- Added strict atomic actions (`setAuth`, `setAccessToken`, `clearAuth`).
- Omitted all persistence layers intentionally, strictly prohibiting the leakage of tokens or private roles into LocalStorage to guarantee optimal security.

### 2. UI State Store (`lib/stores/ui.store.ts`)
- Configured `useUIStore` to power cross-component structural states (e.g. `isSidebarOpen`, `activeModal`).
- Applied Zustand's `persist` middleware selectively using the `partialize` filter, persisting exclusively the `isSidebarOpen` state down to `localStorage`.
- Safely wrapped the `createJSONStorage` execution with a `typeof window !== 'undefined'` environment check to entirely eliminate Server-Side Rendering (SSR) crashes in Next.js App Router context.

### 3. Barrel Exports (`lib/stores/index.ts`)
- Created a robust barrel module providing single-point entry exports for all Zustand stores and typed signatures.

## Verification Results

| Check | Result | Description |
|---|---|---|
| `pnpm type-check` | ✅ Passed | Types evaluate successfully. All v5 generic schemas matched up optimally. |
| `pnpm lint` | ✅ Passed | Standard validation rules passed without issues. |

---

# FE-0-INFRA-06: Setup TanStack Query — Walkthrough

## Summary

Configured the foundational data fetching layer using `@tanstack/react-query`. Created a centralized `QueryProvider` to mount a fully optimized `QueryClient` and wrapped the entire root layout to ensure global hook accessibility.

## What Was Done

### 1. Configuration & Instantiation (`lib/providers/query-provider.tsx`)
- Constructed a `QueryClient` using `useState` lazy initialization, which is critical for SSR safety in the Next.js App Router paradigm.
- Applied conservative caching heuristics to limit spurious refetches across all endpoints:
  - `staleTime`: 1 minute
  - `gcTime`: 5 minutes
  - `retry`: Limited to 1 attempt globally (disabling auto-retries entirely for mutations).
  - `refetchOnWindowFocus`: Explicitly set to `false` to avoid annoying bandwidth surges upon tab switching.
- Incorporated `ReactQueryDevtools`, scoped solely to run when `process.env.NODE_ENV === 'development'`.

### 2. Application Wrap (`app/layout.tsx`)
- Injected `<QueryProvider>` safely inside `<body>`, resolving dependencies for all nested layout groupings globally.

## Verification Results

| Check | Result | Description |
|---|---|---|
| `pnpm type-check` | ✅ Passed | No TS errors upon the layout update. |
| `pnpm lint` | ✅ Passed | Provider properly formats and respects 'use client' parameters natively. |

---

# FE-0-INFRA-07: Create Shared Utilities, Types, and Constants — Walkthrough

## Summary

Successfully scaffolded the entire suite of utility, constants, and global type architectures required globally across all domains in the project (encompassing units, formatting, routing, and UI schemas). This isolates repetitive business logic away from presentation components and strongly types them.

## What Was Done

### 1. Utility Functions (`lib/utils/`)
- Created `cn.ts` to seamlessly merge Tailwind CSS properties using `clsx` and `twMerge` conflict resolution.
- Designed comprehensive formatting tools inside `format.ts` to correctly handle `EGP` currying (via `toLocaleString`) and standard Date operations cleanly via `date-fns`.
- Strengthened safety across the formatters handling cases where date inputs are invalid (via `date-fns` `isValid`) or quantities fall back to `NaN` ensuring applications never crash throwing `"Garbage Date"`. Any invalid or omitted payloads gracefully return `"—"`.

### 2. Global Type Schema (`lib/types/common.types.ts`)
- Defined high-level abstractions like `ListFilters`, `Maybe<T>`, and `SelectOption<T>` for cross-component and query data consistency.
- Correctly integrated generic implementations to prevent restrictive `any` casting.

### 3. Constant Maps (`lib/constants/`)
- Mapped explicit union type definitions parsing `as const` trailing inference to eliminate any string-comparison typos moving forward across modules (ex. `roles.ts`, `booking-statuses.ts`, `routes.ts`, `payment-statuses.ts`, etc).
- Provided explicit `Record<EnumType, string>` mapped `_LABELS` to bind translation interfaces consistently per-ticket constraints.

## Verification Results

| Check | Result | Description |
|---|---|---|
| `pnpm type-check` | ✅ Passed | Generic mapping implementations and strict `Record<K,V>` enums evaluate natively perfectly. |
| `pnpm lint` | ✅ Passed | Formatting and rules evaluated. |

---

# FE-0-INFRA-08: Configure Design System — Walkthrough

## Summary

Configured the foundational UI architecture across `tailwind.config.ts` and Next.js global styling. This ticket centralized the semantic color tokens, typography scales, spacing properties, and layout resets so all future components adopt consistent UI branding natively.

## What Was Done

### 1. Tailwind Extension (`tailwind.config.ts`)
- Configured global system palettes mapping `primary`, `success`, `error`, `warning`, `muted`, `background`, and `foreground` ensuring developers can drop hardcoded hex tokens.
- Created shadow presets (`shadow-card`, `shadow-modal`) and extended the border radius configurations.
- Fixed the `content` path parser correctly traversing `'./lib/**/*.{ts,tsx}'`, guaranteeing dynamically rendered styles generated in library hooks/functions do not fall victim to Tailwind's purge checks.

### 2. Font Loading (`app/layout.tsx`)
- Shifted away from legacy CSS imports by leveraging `next/font/google`. 
- Configured the `'Inter'` typeface globally via the `subsets: ['latin']` option.
- Injected font CSS variables to seamlessly bind into the layout configuration, avoiding layout shifting across navigation boundaries cleanly.

### 3. Base Styles (`app/globals.css`)
- Extended the minimal reset footprint. Added explicit `height: 100%` overrides on HTML/Body boundaries and constructed custom webkit scrollbar UI definitions aligned with the platform design specifications.

## Verification Results

| Check | Result | Description |
|---|---|---|
| `pnpm type-check` | ✅ Passed | App Layout correctly binds children mappings and NextJS components without errors. |
| `pnpm lint` | ✅ Passed | File formatting clears. |

---

# FE-0-INFRA-09: Build Smooth Scroll Provider & Page Transitions — Walkthrough

## Summary

Implemented the foundational animation ecosystem integrating `lenis`, `framer-motion`, and `next-view-transitions`. This ensures native-feeling layout transitions across route shifts and fluid momentum scrolling globally without breaking Next.js hydration lifecycles.

## What Was Done

### 1. Smooth Scroll Layer (`lib/providers/smooth-scroll-provider.tsx`)
- Scaffolded `Lenis` initializing strictly inside a `'use client'` context within `useEffect()`.
- Constructed an explicit `requestAnimationFrame` loop continuously evaluating the scroll matrix properties, terminating cleanly upon component unmount `lenis.destroy()` avoiding memory leaks.

### 2. Layout & Template Scaffolding
- Added the `<SmoothScrollProvider>` alongside `<ViewTransitions>` (from `next-view-transitions`) inside `app/layout.tsx` to mount both engines around the entire document.
- Injected `app/template.tsx` using `<motion.div>` encapsulating pages within a strict initial/animate/exit schema establishing default vertical slide and fade choreographies for all route navigation hooks securely.

## Verification Results

| Check | Result | Description |
|---|---|---|
| `pnpm type-check` | ✅ Passed | Next.js correctly validates the providers and transition wraps securely. |
| `pnpm lint` | ✅ Passed | Zero lint errors affecting `'use client'` directives. |
