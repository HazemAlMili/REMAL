# JIRA / LINEAR TRACKING TICKET

## Title

**DESIGN-SYSTEM**: Synchronize Portal Color Architecture with Public Storefront Base Theme and Update Impeccable Token Layer

## Priority

High

## Type

Design System Harmonization & Token Refactor

## Scope

* **Target Configuration Layers**: `rental-platform/tailwind.config.ts` and `rental-platform/app/globals.css`.
* **Component Surface Area**: Shared UI primitives folder (`components/ui/*` covering Buttons, Inputs, StatusBadges, Table components) and Layout Shell headers/sidebars across the three operational portals: Admin, Owner, and Client.
* **Cross-Project Context**: Extraction of absolute hex values from the marketing website storefront (`demo` folder on port 3000) into the core system platform (`rental-platform` folder on port 3001).

---

## Objective

Harmonize the entire visual interface of the **Kaza booking** platform portals with the public storefront's precise branding palette. This refactor extracts the exact color system tokens from the `demo` folder configuration and embeds them into a centralized, semantic variable architecture in the `rental-platform` application.

This work officially updates the **Impeccable Design System** constraints so that the corporate terracotta accent acts as a clean, high-contrast operational spotlight across all authenticated internal workspaces, eliminating unmapped design rules, messy styling tokens, and layout inconsistencies.

---

## Current Problem

The application portals currently utilize a fragmented color setup consisting of undefined default tokens and raw, unmapped color overrides. This styling layer acts as a visual anti-reference: it replicates a generic, unstructured copy of the storefront's warm colors, washing out entire panels and interface backgrounds instead of utilizing the accent as a deliberate focus mechanism.

This lack of strict token mapping across the `rental-platform` directory lowers data scannability in high-density admin dashboards, causes visual fatigue during long operational use, and breaks corporate brand continuity when users cross the origin threshold from the landing page to their private dashboards.

---

## Expected Behavior & Updated Impeccable Styling Principles

### 1. Zentralized Semantic Variables Matrix

Every color mapping in the platform portals must be tied directly to a central CSS custom property defined inside the global stylesheet (`globals.css`), cascading seamlessly into the Tailwind utility engine. Hardcoded raw hex declarations within component files are strictly banned from repository checks.

### 2. The Spotlight Rule: Terracotta is a Spotlight, Not a Wash

The updated Impeccable style guidelines establish strict usage thresholds for the imported portfolio colors across the portals:

* **The Baseline Background System**: Core canvas, large dashboard containers, internal table cards, and structural layouts use a calm, neutral gray/slate system extracted from the brand palette to minimize visual clutter.
* **The Spotlight Anchor**: The active terracotta brand color (e.g., `#E87651` or exact portfolio match) is strictly prohibited as a broad fill color for major panels. It must be applied exclusively to guide user focus toward active layout segments:
* Primary calls-to-action (e.g., "Confirm Booking", "Save Settings").
* Active navigation sidebar anchor rows and current tab selectors.
* Input focus halos and active check state borders.
* Data highlight anchors inside the two Recharts graph components.



### 3. Per-Portal Tonal Shifts & Density

While color primitives remain unified across the repository, the tone shifts cleanly based on portal use cases:

* **Admin Dashboard**: Compact, information-dense, high-contrast, sharp geometry, gray-heavy baseline with strict operational highlighting.
* **Owner Workspace**: Structured, calm, balanced whitespace margins designed to reinforce financial security and trust.
* **Client Dashboard**: Spacious layout configurations with touch-accessible interactive elements ($\ge 40\text{px}$).

---

## Required Investigation

### Storefront Archetype Audit (Port 3000)

* Open the `demo` folder configuration models. Audit the primary styling files to extract the exact hexadecimal definitions for the brand architecture: Core Terracotta, corporate neutrals, background canvas tones, and high-contrast text shades.

### Platform Primitive Audit (Port 3001)

* Scan `rental-platform/tailwind.config.ts` and `app/globals.css`. Isolate and target all unmapped color tokens or trailing styling variables that require migration to the unified color scale layer.

---

## Required Implementation Plan

### Phase 1: Global CSS Variable Registration (`globals.css`)

1. Define the extracted storefront theme color values within the root CSS pseudo-class layer (`:root`).
2. Map them into explicit, human-readable semantic naming variables:
```css
:root {
  --brand-terracotta: #E87651; /* Exact portfolio color matching */
  --portal-bg-canvas: #F9FAFB;
  --portal-bg-surface: #FFFFFF;
  --portal-border-hairline: #E5E7EB;
  --portal-text-primary: #111827;
  --portal-text-muted: #4B5563;
}

```



### Phase 2: Tailwind Configuration Integration (`tailwind.config.ts`)

1. Open `tailwind.config.ts` and extend the base colors object framework.
2. Bind the keys cleanly to the new CSS properties, making them accessible via standard Tailwind design prefixes (e.g., `bg-brand-terracotta`, `border-portal-hairline`, `text-portal-primary`):
```typescript
colors: {
  brand: {
    terracotta: 'var(--brand-terracotta)',
  },
  portal: {
    canvas: 'var(--portal-bg-canvas)',
    surface: 'var(--portal-bg-surface)',
    border: 'var(--portal-border-hairline)',
    primary: 'var(--portal-text-primary)',
    muted: 'var(--portal-text-muted)',
  }
}

```



### Phase 3: Primitives & Layout Shell Restyling (`components/ui/*`)

1. **Refactor Core Components**: Update shared components (`Button.tsx`, `Input.tsx`, `StatusBadge.tsx`) to utilize the updated semantic classes dynamically. Replace all unmapped fallback tokens.
2. **Enforce Spotlight Layout across Portal Layouts**:
* *Admin Sidebar / Dashboard*: Set background containers to flat surface tones bounded by fine hairline borders (`border-portal-border`). Ensure terracotta is only active on the selected option row indicator.
* *Owner Portal*: Restyle stats containers, transaction listings, and table layouts onto the clean gray system.
* *Client Account Pages*: Ensure all primary action containers use the brand accent spotlight cleanly.



---

## Edge Cases to Handle

* **WCAG 2.1 AA Contrast Compliance**: The specific terracotta color value extracted from the storefront must satisfy a minimum contrast ratio of **$4.5:1$** for normal text or **$3:1$** for large graphical components/buttons when laid over white or gray neutral surfaces to remain accessible. If contrast checking fails, utilize a high-contrast dark variant for small text labels.
* **Chart Element Color Inversions**: Ensure that the two Recharts graph items on the Admin dashboard do not experience lines or label washouts when their layout strokes migrate onto the new neutral semantic colors matrix.

---

## Acceptance Criteria

1. **Universal Brand Parity**: Color scales across ports 3000 and 3001 are fully unified. Moving between the marketing site and account portals maintains absolute brand coordination.
2. **Absolute Eradication of Loose Hex Keys**: No raw, unmapped hex codes or loose styling definitions exist inside any file under the `components/ui/*` or layout hierarchies.
3. **Spotlight Principle Verified**: Terracotta (**#E87651**) is applied exclusively as an active indicator anchor, input focus boundary, or high-priority call-to-action. Background workspaces use the calm neutral gray system.
4. **API Data Integrity Intact**: Presentational refactoring layer contains zero modifications to underlying core data repositories, query arrays, or live API endpoints.
5. **Clean Compilation Pass**: Executing the frontend build compilation sequence (`npm run build`) runs seamlessly with zero CSS compilation errors or parsing failure warnings.

---

## QA Manual Smoke Testing & Verification Playbook

### Design System and Interface Mapping Inspection

* [ ] Initialize your staging workspace application. Access your browser's Developer Tools options, enter the local storage configuration fields, and completely flush all saved cache layers, keys, and tracking cookies.
* [ ] Open the marketing landing page on `http://localhost:3000` alongside the portal environment on `http://localhost:3001` in adjacent browser tabs.
* [ ] Use a color eyedropper tool to verify that the color values used for primary components on the storefront match the values rendered inside the internal dashboards.
* [ ] Log into the Admin panel workspace, navigate to the main dashboard screen, and check the Stat Cards and the two Recharts graph components.
* [ ] Confirm that all main widget panels use a gray background system, and verify that the terracotta accent color is applied exclusively as an intentional focal highlight (e.g., active chart spikes or focus outline markers).
* [ ] Inspect financial numbers across tables and analytics layouts; verify all indicators preserve thousands separators and exactly two trailing decimal positions (`.00`) formatted in tabular typography (`tabular-nums`).
* [ ] Open the Client account dashboard and the public Auth views. Confirm that interactive elements maintain clean, finger-friendly touch targets ($\ge 40\text{px}$).

### Regression Framework Check

* [ ] Trigger a hard layout reload (`Ctrl + F5`) with several data modals open. Verify that the updated color variables hydrate correctly without displaying unstyled flashes.
* [ ] Confirm that interactive form validation flags, error state overlays, and lookup controls clear and save data reliably without interface locks.

---

## Production Safety Notes & Rollout Guardrails

* **Zero Database Footprint Modification**: This refactor task is strictly confined to presentation styles and layout design tokens. It carries zero risk of database table modifications or model data drops.
* **Staging Isolation Enforcement**: All manual testing checks, build procedures, and interface verification routines must be executed within an isolated UAT or Staging environment. Never inject experimental UI code variants directly into live production assets.
* **Release Gate Code Constraint**: The deployment pipeline remains locked. Do not push visual theme changes to production until all static type checking paths clear successfully and the regression pass is signed off as safe.