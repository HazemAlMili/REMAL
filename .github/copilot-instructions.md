# Copilot Instructions — Remal

Remal is a commission-based vacation-rental brokerage platform for Egyptian North-Coast resorts. The frontend is in [`rental-platform/`](../rental-platform/): **Next.js 14 App Router, TypeScript (strict), Tailwind CSS 3.4**, TanStack Query/Table, Zustand, React Hook Form + Zod, Recharts, lucide-react, sonner. Fonts are deliberately **offline-safe** (no `next/font/google`).

When doing any design or frontend work on the operational portals, follow the Design Context below. The canonical sources are [`PRODUCT.md`](../PRODUCT.md) (strategic) and [`DESIGN.md`](../DESIGN.md) (visual system) at the repo root — keep this summary in sync with them.

## Design Context

### Scope

Applies to the **three operational portals**: **Admin** (`app/(admin)/`), **Owner** (`app/(owner)/owner/`), and **Client** (`app/account/` + `app/(auth)/`).

The **public marketing/booking storefront** (`app/(public)/`, `app/page.tsx`, `app/units/`) is **out of scope** — it keeps its warm-terracotta hospitality theme. Do not apply portal tokens to it, and do not copy storefront marketing patterns (Georgia serif headings, heavy warm shadows, GSAP scroll choreography) into the portals.

**Start fresh.** The current portal styling is a throwaway mock that uses undefined shadcn tokens (`bg-card`, `text-muted-foreground`, `text-card-foreground`) and the storefront's warm palette/loose spacing. Treat it as an anti-reference, not a base.

### Users

- **Operators (Admin)** — Super Admin, Sales (lives in the CRM pipeline; wants speed + density), Finance (transaction logs, payouts, invoices; wants precise, tabular, trustworthy numbers), Tech (units + settings). Desktop, long focused sessions, high data volume.
- **Owners** — non-technical property owners; **view-only** units, availability, confirmed bookings, earnings, payouts, reviews. Occasional, often mobile; motivated by "how much did I earn and when do I get paid?"
- **Clients** — consumers managing their own bookings, reviews, notifications, profile. Occasional, mobile-first.

### Brand Personality

**Trustworthy · Efficient · Quietly warm.** A precise, financial-grade operating tool that still carries a thread of hospitality warmth. Competence first, personality second. Goals: confidence/control (operators), transparency/trust (owners), clarity/reassurance (clients). Never flashy, never sterile.

### Aesthetic Direction

- **Direction:** Neutral-pro + terracotta accent (Linear / Stripe feel). Calm near-neutral gray workspace; brand terracotta only on primary actions, active nav, and key focus.
- **Theme:** Light only (build with semantic tokens so dark mode could be layered later; don't build it now).
- **Language / direction:** English UI now, **RTL-ready**. Use CSS logical properties (`ps/pe`, `ms/me`, `start/end`, `text-start`), never hard-coded `left/right`; keep layouts mirror-safe. Arabic/RTL must be a later switch, not a rebuild.
- **Consistency:** One unified design system with **tonal shifts per portal** — Admin densest/utilitarian, Owner calmer/more spacious with clear money summaries, Client warmest and most spacious (bridge toward the storefront).
- **References:** Linear, Stripe, Mercury, Notion. **Anti-references:** the current mock, the storefront's warm serif look, gradient/glassmorphism dashboard templates, cramped grids with no whitespace, playful/toy UI.

### Design Principles

1. **Data legibility over decoration** — strong hierarchy, tabular numerals for money/dates, hairline borders over heavy shadows; remove anything that doesn't aid comprehension or action.
2. **Terracotta is a spotlight, not a wash** — gray system carries the UI; `primary` (terracotta `#E87651`) marks the primary action, active nav, and focus only. Status meaning never comes from the brand accent.
3. **Status is always unambiguous** — encode booking-pipeline and finance states with **color + icon + label** together (never color alone), consistently everywhere.
4. **Fit the portal to its user** — one system, three tempos: Admin earns density/speed; Owner and Client earn space, plain-language summaries, reassurance.
5. **RTL-ready, accessible, calm by default** — logical-property layout, **WCAG 2.1 AA** contrast + focus-visible, ≥40px targets, functional motion only (120–200ms; respect `prefers-reduced-motion`). No scroll theatrics in portals.

### Foundations (starting tokens)

Define a **portal token layer** distinct from the storefront's warm tokens:

- **Neutral scale:** `50 #F7F8FA` (canvas) · `100 #EEF0F3` · `200 #E4E7EB` (borders) · `300 #CDD2D9` · `400 #9BA2AD` · `500 #6B7280` (muted text) · `600 #4B5563` · `700 #353A42` (body) · `800 #22262C` · `900 #14171A` (ink). Cards `#FFFFFF`.
- **Primary:** reuse terracotta — `500 #E87651`, `600 #C75D3E` (hover), `700 #A54832` (active). Sparingly.
- **Status (AA on white):** success `#15803D`/`#DCFCE7`, warning `#B45309`/`#FEF3C7`, error `#B91C1C`/`#FEE2E2`, info `#1D4ED8`/`#DBEAFE`. Single source-of-truth map: status → {color, bg, icon, label}.
- **Typography:** offline-safe system sans for all portal UI; **drop the serif display** (storefront only); `tabular-nums` for money/counts/dates; ~13–14px base in Admin, ~14–15px in Owner/Client.
- **Shape & elevation:** ~8px card radius, ~6px controls; 1px `neutral-200` borders + subtle cool shadow (not warm storefront shadows); 8px spacing grid.
- **Reuse:** restyle existing `components/ui/*` (`Button`, `DataTable`, `StatusBadge`, `Drawer`, `Modal`, `Skeleton*`), TanStack, Recharts, lucide-react, sonner onto the new token layer — keep their API contracts.
