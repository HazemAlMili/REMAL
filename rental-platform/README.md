# Rental Platform — Frontend

A Next.js 14 web application for the Rental Property Management Platform.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 3.4
- **Data Layer:** Axios, TanStack Query, Zustand
- **Forms:** React Hook Form, Zod
- **Animations:** GSAP, Framer Motion, Lenis, split-type
- **UI:** Lucide React icons, Recharts, Swiper, Mapbox GL

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type check
pnpm type-check

# Lint
pnpm lint

# Format
pnpm format

# Production build
pnpm build

# Start production server
pnpm start
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:8080`) |
| `NEXT_PUBLIC_APP_ENV` | App environment (`development` / `production`) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL access token |
