# Design

Visual system for the **Kaza Booking operational portals** (Admin, Owner, Client). The portals share the **public Kaza storefront's brand** (the `demo` app on :3000 — coastal navy + sand). The legacy rental-platform public pages (`app/(public)`) keep their own warm-terracotta theme and are out of scope here. See [PRODUCT.md](PRODUCT.md) for the strategic context. Frontend: Next.js 14 App Router, TypeScript strict, **Tailwind CSS 3.4**, fonts deliberately offline-safe (no `next/font/google`).

## Theme

Light only. **Neutral-pro + coastal-navy accent** (Linear / Stripe register): a calm, near-neutral gray workspace where the brand navy appears only on the things you act on. The accent is the public storefront's brand navy (sea-glass → deep navy), matched 1:1, so the portals and the marketing site read as one brand. Build with semantic tokens so dark mode *could* be layered later, but it is not built or QA'd now. Direction-agnostic (RTL-ready) from day one.

## Color

Defaults to **Restrained** (product floor): one accent, neutral system, semantic status colors. Define a **portal token layer** in `app/globals.css` distinct from the storefront's warm tokens.

**Neutral scale (portal canvas → ink):**
`50 #F7F8FA` (app canvas) · `100 #EEF0F3` · `200 #E4E7EB` (borders/dividers) · `300 #CDD2D9` · `400 #9BA2AD` (placeholder/disabled) · `500 #6B7280` (muted/secondary text) · `600 #4B5563` · `700 #353A42` (body) · `800 #22262C` · `900 #14171A` (headings/ink). Cards/panels `#FFFFFF`. A second neutral layer (sidebar/toolbar) sits a step cooler/darker than the content surface.

**Primary (brand accent) — coastal navy, matched 1:1 to the public storefront:**
`primary-500 #5A82A2` (brand marks, icons, focus ring) · `600 #466785` (primary-action fill, active selection) · `700 #39536D` (hover) · `800 #32465B` (active) · `900 #1B2A3A` · `50/100/200` tints. Used only for the primary action, active nav / current selection, and focus rings — never a large background fill in the portals. **AA:** white text on `600 #466785` = 5.9:1 (use for filled CTAs / pills / selected days); brand marks may sit on `500 #5A82A2` (4.08:1 — large/bold/graphical only). Scoped to `.portal-*` in `globals.css`; the rental-platform `app/(public)` storefront keeps terracotta at `:root`.

**Secondary brand accent — sand/gold `#C9A162`** (the storefront's second brand color). Registered as `--brand-accent` / `brand-sand-*`; reserved for rare premium/marketing-adjacent moments — never status, never a panel wash.

**Semantic token bridge.** `globals.css` exposes `--brand-primary` / `--brand-primary-strong` / `--brand-accent` and `--portal-canvas` / `--portal-surface` / `--portal-surface-muted` / `--portal-border` / `--portal-text-primary|body|muted`, surfaced in Tailwind as `bg-brand-primary`, `border-portal-border`, `text-portal-primary`, etc. They are **re-bound inside `.portal-*`** so they resolve to the navy brand + cool surfaces — a `:root`-only bridge would freeze to the warm values, since custom properties inherit their already-substituted value.

**Status (semantic, AA on white):** success `#15803D` / bg `#DCFCE7` · warning `#B45309` / bg `#FEF3C7` · error `#B91C1C` / bg `#FEE2E2` · info `#1D4ED8` / bg `#DBEAFE`. These replace the current low-contrast `/15` washes in `Badge`. The status *semantics* (which state → which variant + label) already live in `lib/utils/status.ts` and `lib/constants/*` — keep that layer; only harden the visual mapping. Standardize the full interactive state vocabulary: default, hover, focus, active, disabled, selected, loading, error.

## Typography

- **One family.** System sans for everything (current offline-safe stack: `Segoe UI`, Arial). **Drop the Georgia serif display** in the portals — it belongs to the storefront. Optional `ui-monospace` for IDs/codes only.
- **Fixed rem scale, not fluid clamp.** Tight ratio (~1.125–1.2). Compact base (~13–14px Admin, ~14–15px Owner/Client).
- **`tabular-nums`** on all money, counts, dates, and table numeric cells for vertical alignment.
- Prose capped 65–75ch; data/tables may run denser. No all-caps body; uppercase only for short table-header / badge labels.

## Spacing & Shape

- **8px spacing grid.**
- **Baseline radius:** ~8px cards, ~6px controls — crisper than the storefront's 12px. *(Per-portal tuning below: Admin trends sharper.)*
- Hairline structure: **1px `neutral-200` borders** group and separate, in preference to heavy shadows.

## Elevation & Motion

- **Flat by default.** Lean on 1px borders + at most a subtle cool shadow; avoid the warm, heavy storefront shadows. Build a semantic z-index scale (dropdown → sticky → modal-backdrop → modal → toast → tooltip).
- **Motion is functional only:** 150–250ms, ease-out (quart/quint/expo), conveys state/feedback/loading/reveal — no orchestrated page-load sequences, no decorative motion. Every animation has a `prefers-reduced-motion` fallback (already wired in `globals.css`).

## Components

Restyle the existing primitives in `components/ui/*` onto the new token layer — **keep their API contracts** (`Button` variants/sizes, `DataTable`, `Badge`/`StatusBadge`, `Drawer`, `Modal`, `Skeleton*`, `Input`, `Select`, etc.). Every interactive component ships all states (default/hover/focus/active/disabled/loading/error). Skeletons for loading (not center spinners); empty states that teach the interface. Consistent affordances screen to screen. Reuse TanStack Query/Table, Recharts, lucide-react icons, sonner toasts.

## Layout

- Standard app shell: persistent **side nav + top bar**, breadcrumbs, tabs. Responsive behavior is **structural** (collapse sidebar, responsive tables, breakpoint columns), not fluid typography.
- Cards only when they're the right affordance; never nested cards. Flexbox for 1D, Grid for 2D; `repeat(auto-fit, minmax(...))` for breakpoint-free grids.

## Per-portal tuning (one system, three tempos)

- **Admin** — densest, most utilitarian: sharpest geometry, compact 32–36px control/row heights, hairline-grouped data, navy strictly as a focus/active spotlight. *(The exact Admin "Shape" layer — radii, heights, elevation — is being finalized via an `/impeccable shape` brief.)*
- **Owner** — calmer and more spacious; lead with clear money/availability summaries and reassurance.
- **Client** — warmest and most spacious; the bridge toward the storefront's friendliness while still part of the system.

## RTL-readiness

Use CSS logical properties (`padding-inline`, `margin-inline`, `border-inline-start/end`, `inset-inline`, `text-align: start/end`); never hard-coded `left/right`. Keep layouts mirror-safe; avoid directionally-locked icons. Arabic/RTL is a later switch, not a rebuild.
