# Product

## Register

product

## Users

Kaza Booking is a commission-based vacation-rental brokerage for Egyptian North-Coast resorts (Palm Hills, Abraj Al Alamein). Three audiences use the operational portals this document governs:

- **Operators (Admin portal)** — four scoped roles:
  - *Super Admin* — full control over the platform.
  - *Sales* — lives in the **CRM pipeline** all day, moving leads through 7 stages (prospecting → relevant → no_answer → not_relevant → booked → confirmed → check_in → completed, plus cancelled / left_early), taking notes, recording deposits. Wants speed, density, and at-a-glance scanning.
  - *Finance* — works transaction logs, owner payouts, refunds, and invoices. Needs precise, vertically aligned numbers and trustworthy summaries.
  - *Tech* — manages units and system settings.
  Context: desktop, long focused sessions, high data volume, repeated daily workflows. The job is to run the business without errors.
- **Owners (Owner portal)** — non-technical property owners. **View-only**: their units, availability, confirmed bookings, earnings, payout history, reviews. Context: occasional check-ins, often mobile. The job is confidence that their money and bookings are tracked honestly. Motivated by "how much did I earn and when do I get paid?"
- **Clients (Client account)** — consumers managing their own bookings, reviews, notifications, and profile after booking on the public storefront. Context: occasional, mobile-first, low patience. The job is to see my trips, track payment, and leave a review.

## Product Purpose

Kaza Booking turns a previously informal brokerage into an organized operating system. The platform connects property owners with clients and runs the entire booking lifecycle — discovery, CRM pipeline, manual payment recording, auto-invoicing, commission accounting, owner payouts, and reviews — taking a per-owner commission. The portals are the back-office and self-service surfaces where operators, owners, and clients interact with that system. Success: operators move leads and money through the pipeline quickly and without mistakes; owners trust what they see; clients self-serve without contacting support.

> **Scope note.** This document governs the three **operational portals** — Admin (`app/(admin)/`), Owner (`app/(owner)/owner/`), Client (`app/account/` + `app/(auth)/`). The **public marketing/booking storefront** (`app/(public)/`, `app/page.tsx`, `app/units/`) is a separate surface that keeps its warm-terracotta hospitality theme and is out of scope here.

## Brand Personality

**Trustworthy · Efficient · Quietly warm.** Kaza Booking is the calm, organized system behind the brokerage. The portals should feel like a precise, financial-grade tool that still carries a thread of the brand's hospitality warmth — competence first, personality second. Emotional goals: **confidence and control** for operators; **transparency and trust** for owners; **clarity and reassurance** for clients. Never flashy, never sterile.

## Anti-references

- **The current portal mock** — borrows undefined shadcn tokens (`bg-card`, `text-muted-foreground`, `text-card-foreground`) that resolve to nothing, and inherits the storefront's warm palette and loose marketing spacing. This is what the redesign replaces, not a base to build on.
- **The public storefront's look inside the portals** — Georgia serif headings, heavy warm shadows, GSAP scroll choreography, fluid clamp typography. Right for marketing, wrong for dense operational tools.
- Gradient-heavy / glassmorphism "dashboard template" aesthetics.
- Cramped enterprise grids with no whitespace, and playful or toy-like UI.

## Design Principles

1. **Data legibility over decoration.** Every screen is mostly numbers, statuses, and lists. Optimize for scannability and remove anything that doesn't aid comprehension or action.
2. **Terracotta is a spotlight, not a wash.** A calm neutral system carries the UI; the brand accent (terracotta) marks only the primary action, the current selection/active nav, and key focus. Status meaning never comes from the brand accent.
3. **Status is always unambiguous.** The booking pipeline and finance states drive the whole app; encode them with color + icon + label together (never color alone), consistently everywhere they appear. Reuse the existing semantic layer in `lib/utils/status.ts`.
4. **Fit the portal to its user.** One unified system, three tempos: Admin earns density and speed; Owner and Client earn space, plain-language summaries, and reassurance.
5. **Earned familiarity.** These are tools, not showpieces. Use standard affordances (top bar + side nav, tables, tabs, breadcrumbs), consistent component vocabulary screen to screen, and reserve delight for moments. The tool should disappear into the task.

## Accessibility & Inclusion

- Target **WCAG 2.1 AA**: body text ≥4.5:1 contrast (including placeholders), large/bold text ≥3:1, visible focus states on every interactive element.
- **RTL-ready.** UI ships in English now but is built direction-agnostic (CSS logical properties, no hard-coded left/right) so Arabic/RTL is a later switch, not a rebuild. The business is Egyptian; requirement docs are in Arabic.
- Respect `prefers-reduced-motion` (already wired in `app/globals.css`); motion is functional only.
- Don't encode meaning in color alone; ≥40px interactive targets for primary controls.
