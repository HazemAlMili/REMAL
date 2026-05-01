# Frontend Implementation Plan
## Rental Platform — Complete Ticket Breakdown
**Version 1.0 | 117 Tickets | 8 Waves | ~42 Days**

---

## Quick Reference

| Wave | Domain | Tickets | Est. Days | Parallel? |
|---|---|---|---|---|
| 0 | Foundation & Infrastructure | 7 | 3 | No — serial |
| 1 | Auth + UI Library | 16 | 5 | Yes (2 devs) |
| 2 | Admin Shell + Units | 14 | 5 | Partial |
| 3 | CRM + Bookings | 18 | 7 | Yes (2 devs) |
| 4 | Finance + Owners + Clients | 16 | 6 | Yes (3 devs) |
| 5 | Dashboard + Reviews + Notifications | 12 | 4 | Yes (2 devs) |
| 6 | Owner Portal | 12 | 4 | Yes (parallel with W7) |
| 7 | Guest App | 14 | 5 | Yes (parallel with W6) |
| 8 | Polish + Performance | 8 | 3 | Yes |

**Critical Path: W0 → W1 → W2 → W3 → W4 → W5 → [W6 ∥ W7] → W8**

---

## Ticket ID Convention

`FE-{WAVE}-{DOMAIN}-{NUMBER}`

Example: `FE-1-AUTH-01` = Wave 1, Auth domain, ticket 01

---

---

# WAVE 0 — Foundation & Infrastructure
**Prerequisite for everything. No feature work starts until this wave is merged.**

---

### FE-0-INFRA-01 — Initialize Next.js project with TypeScript

**Objective:** Create the Next.js 14 project with App Router, TypeScript strict mode, and base config.

**In Scope:**
- `npx create-next-app@latest` with TypeScript + App Router + Tailwind
- `tsconfig.json`: enable `strict: true`, `baseUrl: "."`, `paths: { "@/*": ["./*"] }`
- `next.config.ts`: configure image domains for API server
- `.env.local` with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_ENV`
- `.env.example` template
- `tailwind.config.ts`: extend with project font if needed

**Out of Scope:** No pages, no components, no routes.

**Verification:** `npm run dev` runs without errors. `npm run build` succeeds.

**Acceptance Criteria:**
- TypeScript strict mode on
- Tailwind working (test with one className in root layout)
- Path alias `@/` resolves correctly
- `.env.example` committed, `.env.local` gitignored

---

### FE-0-INFRA-02 — Create complete folder structure scaffold

**Objective:** Create all empty folders and index/barrel files per the TRD folder structure.

**In Scope:**
- Create all directories from TRD Section 3
- Add `.gitkeep` or empty barrel `index.ts` in each folder
- No actual code yet — just the structure

**Verification:** Folder tree matches TRD Section 3 exactly.

---

### FE-0-INFRA-03 — Create Axios instance with interceptors

**Objective:** Build `lib/api/axios.ts` — the single HTTP client for the entire app.

**In Scope:**
- Axios instance with `baseURL: process.env.NEXT_PUBLIC_API_URL`
- `withCredentials: true` on every request
- Request interceptor: attach `Authorization: Bearer {token}` from auth store
- Response interceptor:
  - On 401 → call `/api/auth/refresh` once → retry original request
  - If refresh fails → call `clearAuth()` on store → redirect to appropriate login
  - On 403 → show toast "You don't have permission"
  - On 500 → show toast "Something went wrong"
- Response transformer: unwrap `response.data.data` so callers receive typed payload directly

**Out of Scope:** No token refresh logic implementation yet (store doesn't exist). Add a TODO comment for the interceptor that reads from store — will be wired in FE-1-AUTH-05.

**Verification:**
- Instance created with correct base URL
- `withCredentials` set
- Interceptor structure in place (store integration TODO marked)

---

### FE-0-INFRA-04 — Create endpoints constants file

**Objective:** Build `lib/api/endpoints.ts` — all API endpoint strings as typed constants.

**In Scope:**
- All endpoints from TRD Section 11 (Admin) + 10 (Owner) + 11 (Guest)
- Organize as nested object matching the API groups from the swagger
- Dynamic endpoints as functions: `byId: (id: string) => /api/areas/${id}`
- Cover all groups: auth, areas, units, unitImages, unitAmenities, seasonalPricing, dateBlocks, bookings, bookingLifecycle, crm, crmNotes, crmAssignments, clients, owners, payments, invoices, finance, reviews, reviewModeration, notifications, ownerPortal, adminUsers, amenities, reports

**Out of Scope:** No service files yet.

**Verification:** TypeScript compiles with no errors. Every endpoint from the API reference exists in this file.

---

### FE-0-INFRA-05 — Create Zustand stores

**Objective:** Build `lib/stores/auth.store.ts` and `lib/stores/ui.store.ts`.

**In Scope:**
Auth store:
```typescript
{ accessToken, user, role, setAuth, clearAuth }
```
- `accessToken`: string | null — stored in memory ONLY, never localStorage
- `user`: AuthenticatedUserResponse | null
- `role`: AdminRole | 'owner' | 'client' | null

UI store:
```typescript
{ isSidebarOpen, toggleSidebar, activeModal, openModal, closeModal }
```

**Out of Scope:** No persistence (no `persist` middleware on auth store — tokens are memory-only by design).

**Verification:** Stores importable and usable in a test component.

---

### FE-0-INFRA-06 — Create TanStack Query setup and query keys factory

**Objective:** Configure TanStack Query globally and build `lib/utils/query-keys.ts`.

**In Scope:**
- `QueryClient` configured with defaults from TRD Section 7.5:
  - `staleTime: 120000` (2 min)
  - `gcTime: 600000` (10 min)
  - `retry: 1`
  - `refetchOnWindowFocus: false`
- `QueryClientProvider` wrapped in root layout
- `lib/utils/query-keys.ts`: full key factory for all entities (areas, units, bookings, crm, owners, clients, finance, reviews, notifications, reports)

**Verification:** `useQuery` works in a test component. Query keys typed correctly.

---

### FE-0-INFRA-07 — Create shared utilities and types scaffold

**Objective:** Create `lib/utils/format.ts`, `lib/utils/cn.ts`, `lib/types/common.types.ts`, and `lib/constants/`.

**In Scope:**
- `cn.ts`: Tailwind class merger using `clsx` + `tailwind-merge`
- `format.ts`:
  - `formatCurrency(amount: number): string` → Egyptian Pound format
  - `formatDate(date: string): string` → readable date
  - `formatDateRange(start: string, end: string): string`
  - `getNights(checkIn: string, checkOut: string): number`
- `common.types.ts`: `ApiResponse<T>`, `PaginationMeta`, base enums
- `lib/constants/booking-statuses.ts`: status → label + color mapping
- `lib/constants/roles.ts`: role → label mapping
- `lib/constants/routes.ts`: all route strings as constants

**Verification:** Utilities importable and TypeScript-valid.

---

---

# WAVE 1 — Auth + UI Component Library
**Two parallel tracks. Both must complete before Wave 2 begins.**

## Track A: Authentication (FE-1-AUTH)

---

### FE-1-AUTH-01 — Admin login page

**Objective:** Build `/auth/admin/login/page.tsx`.

**API:** `POST /api/auth/admin/login` (AdminLoginRequest → AuthResponse)

**In Scope:**
- Form: email + password
- Zod schema validation
- On success: store token in auth store, redirect to `/admin/dashboard`
- On error: show inline error message
- Loading state on submit button

**Out of Scope:** No "forgot password". No social login.

---

### FE-1-AUTH-02 — Owner login page

**Objective:** Build `/auth/owner/login/page.tsx`.

**API:** `POST /api/auth/owner/login` (OwnerLoginRequest → AuthResponse)

Same pattern as FE-1-AUTH-01. Redirect to `/owner/dashboard` on success.

---

### FE-1-AUTH-03 — Client login page

**Objective:** Build `/auth/client/login/page.tsx`.

**API:** `POST /api/auth/client/login` (ClientLoginRequest → AuthResponse)

Same pattern. Redirect to previous page or `/` on success. Include link to register page.

---

### FE-1-AUTH-04 — Client register page

**Objective:** Build `/auth/client/register/page.tsx`.

**API:** `POST /api/auth/client/register` (ClientRegisterRequest → AuthResponse)

**In Scope:**
- Form: name (required), phone (required), email (optional), password (required)
- Zod validation: phone required, email optional but valid if provided, password min 8 chars
- On success: store token, redirect to previous page or `/`

---

### FE-1-AUTH-05 — Auth middleware + route guards + token refresh

**Objective:** Build `middleware.ts` and wire auth store into axios interceptor.

**In Scope:**
- `middleware.ts`:
  - `/admin/*` → check adminToken in store → redirect to `/auth/admin/login` if missing
  - `/owner/*` → check ownerToken → redirect to `/auth/owner/login`
  - `/client/*` → check clientToken → redirect to `/auth/client/login`
  - Public routes always pass
- Wire auth store into axios request interceptor (FE-0-INFRA-03 TODO)
- Wire refresh logic: on 401 → call `POST /api/auth/refresh` → retry → on fail → `clearAuth()` + redirect
- `POST /api/auth/logout` called on manual logout → clearAuth() + redirect

**Verification:**
- Visiting `/admin/dashboard` without token redirects to login
- Token attached to every request header
- 401 triggers refresh attempt

---

## Track B: UI Component Library (FE-1-UI)

---

### FE-1-UI-01 — Button component

**Objective:** Build `components/ui/Button.tsx`.

**Variants:** `primary | secondary | danger | ghost`
**Sizes:** `sm | md | lg`
**States:** loading (spinner + disabled), disabled

Props: `variant, size, isLoading, leftIcon, rightIcon, onClick, type, disabled, className`

**Acceptance Criteria:** All variants render correctly. Loading state disables button and shows spinner.

---

### FE-1-UI-02 — Input + Select components

**Objective:** Build `components/ui/Input.tsx` and `components/ui/Select.tsx`.

Input props: `label, placeholder, error, helperText, leftIcon, rightIcon, type, disabled`
Select props: `label, options, error, placeholder, disabled`

Both integrate with React Hook Form via `register` or `Controller`.

**Verification:** Shows error message below when `error` prop provided.

---

### FE-1-UI-03 — Modal + ConfirmDialog components

**Objective:** Build `components/ui/Modal.tsx` and `components/ui/ConfirmDialog.tsx`.

Modal: accessible, `isOpen`, `onClose`, `title`, `children`, `size (sm|md|lg)`
ConfirmDialog: wraps Modal. Props per TRD Section 12.2.

**Verification:** Closes on backdrop click. Closes on Escape key. ConfirmDialog shows loading on confirm button during async action.

---

### FE-1-UI-04 — Badge + StatusBadge components

**Objective:** Build `components/ui/Badge.tsx` and `components/ui/StatusBadge.tsx`.

Badge: generic colored pill. Props: `label, variant (info|success|warning|danger|neutral)`
StatusBadge: maps booking/lead/unit statuses to colors per TRD Section 12.1.

**Acceptance Criteria:** Every status from `lib/constants/booking-statuses.ts` renders the correct color.

---

### FE-1-UI-05 — Card + Skeleton components

**Objective:** Build `components/ui/Card.tsx` and `components/ui/Skeleton.tsx`.

Card: container with border, radius, padding. Props: `children, className, padding`
Skeleton: animated placeholder. Props: `className` (controls width/height via Tailwind)

---

### FE-1-UI-06 — Table + Pagination components

**Objective:** Build `components/ui/Table.tsx` and `components/ui/Pagination.tsx`.

Table: built on TanStack Table. Props: `columns, data, isLoading, emptyState`
- Loading state: shows Skeleton rows
- Empty state: shows EmptyState component

Pagination: per TRD Section 12.3.

---

### FE-1-UI-07 — EmptyState + FileUpload components

**Objective:** Build `components/ui/EmptyState.tsx` and `components/ui/FileUpload.tsx`.

EmptyState: per TRD Section 12.4.
FileUpload: per TRD Section 8.3.
- Accept: jpg, jpeg, png, webp, pdf
- Max: 10MB
- Shows preview for images, filename for PDF
- Emits `onFileSelected: (file: File) => void`

---

### FE-1-UI-08 — DatePicker + DateRangePicker components

**Objective:** Build `components/ui/DatePicker.tsx` and `components/ui/DateRangePicker.tsx`.

Built on `react-day-picker`. Integrates with React Hook Form.
DateRangePicker: emits `{ from: Date, to: Date }`. Disables past dates by default. Can accept `disabledDates: Date[]` prop for availability blocking.

---

### FE-1-UI-09 — Toast setup + Error boundary

**Objective:** Add `react-hot-toast` Toaster to root layout. Build `components/ui/ErrorBoundary.tsx`.

Toast config: success = 3s, error = 5s.
ErrorBoundary: catches render errors, shows EmptyState with retry button. Does NOT show stack trace.

---

### FE-1-UI-10 — usePermissions hook

**Objective:** Build `lib/hooks/usePermissions.ts`.

Reads `role` from auth store. Returns:
```typescript
{
  canViewCRM: boolean        // super_admin, sales
  canViewFinance: boolean    // super_admin, finance
  canManageUnits: boolean    // super_admin, tech
  canManageUsers: boolean    // super_admin only
  canViewReports: boolean    // super_admin, finance
  canViewOwners: boolean     // super_admin, finance, sales (view only for sales)
  canViewClients: boolean    // super_admin, sales
}
```

**Verification:** Returns correct booleans for each of the 4 admin roles.

---

---

# WAVE 2 — Admin Shell + Units Domain

---

### FE-2-ADMIN-01 — Admin sidebar + header + shell layout

**Objective:** Build `AdminSidebar.tsx`, `AdminHeader.tsx`, `AdminShell.tsx`, and `app/(admin)/layout.tsx`.

**In Scope:**
- Sidebar: collapsible. Items: Dashboard, Areas, Units, CRM, Bookings, Finance, Owners, Clients, Reviews, Settings
- Each item rendered only if `usePermissions()` allows it
- Active state on current route
- Header: page title + user info + logout button
- Shell: sidebar + header + `{children}` main area
- Route group layout wraps all `/admin/*` pages

**Verification:** Sidebar collapses. Navigation works. Permissions hide correct items for each role.

---

### FE-2-ADMIN-02 — Areas list + CRUD

**Objective:** Build `/admin/areas/page.tsx` with full CRUD.

**APIs:**
- `GET /api/areas` → list
- `POST /api/areas` → create (in modal)
- `PUT /api/areas/{id}` → edit (in modal)
- `PATCH /api/areas/{id}/status` → toggle active/inactive

**In Scope:**
- Table: name, unit count (if available), status badge, actions
- Create button → opens modal with form
- Edit button per row → opens same modal pre-filled
- Toggle status → ConfirmDialog → PATCH
- Skeleton while loading. EmptyState if no areas.

**Service:** `lib/api/services/areas.service.ts`
**Hook:** `lib/hooks/useAreas.ts`

---

### FE-2-ADMIN-03 — Amenities management

**Objective:** Build amenities section inside `/admin/settings/page.tsx`.

**APIs:** `GET /api/amenities`, `POST /api/amenities`

Simple list with add form. No edit/delete in MVP.

---

### FE-2-ADMIN-04 — Units list page

**Objective:** Build `/admin/units/page.tsx` — internal unit list with filters.

**API:** `GET /api/internal/units` with filters: area, status, owner, type

**In Scope:**
- Filter bar: area selector, status selector, unit type selector
- Results table: unit name, type, area, owner, capacity, price, status, link to detail
- Skeleton + EmptyState
- "Create Unit" button → links to create form (or modal)

---

### FE-2-ADMIN-05 — Unit create form

**Objective:** Create unit form (can be a page or large modal).

**API:** `POST /api/internal/units` (CreateUnitRequest)

**In Scope:**
- Fields: name, type (select: villa/chalet/studio), area (select), owner (select), capacity, base price, description
- Zod validation
- On success: redirect to unit detail page

---

### FE-2-ADMIN-06 — Unit detail — Info tab

**Objective:** Build unit detail page with Info tab as default.

**APIs:** `GET /api/internal/units/{id}`, `PUT /api/internal/units/{id}`, `PATCH /api/internal/units/{id}/status`, `DELETE /api/internal/units/{id}`

**In Scope:**
- Tab navigation: Info | Images | Amenities | Pricing | Date Blocks | Availability
- Info tab: display all unit fields. "Edit" button → inline edit or modal.
- Status toggle with ConfirmDialog
- Delete (soft) with ConfirmDialog (super_admin only)

---

### FE-2-ADMIN-07 — Unit detail — Images tab

**APIs:** `GET /api/units/{unitId}/images`, `POST /api/internal/units/{unitId}/images`, `PUT /api/internal/units/{unitId}/images/reorder`, `PATCH /api/internal/units/{unitId}/images/{imageId}/cover`, `DELETE /api/internal/units/{unitId}/images/{imageId}`

**In Scope:**
- Grid of current images with primary badge
- Upload new image via FileUpload component (max 10MB, image types only)
- Set as primary cover button per image
- Reorder via drag or up/down arrows
- Delete with ConfirmDialog

---

### FE-2-ADMIN-08 — Unit detail — Amenities tab

**APIs:** `GET /api/units/{unitId}/amenities`, `POST/PUT /api/internal/units/{unitId}/amenities`, `DELETE /api/internal/units/{unitId}/amenities/{amenityId}`

**In Scope:**
- Current amenities list with remove button per item
- "Add amenity" → select from all amenities → `POST`
- Or replace-all approach via `PUT`

---

### FE-2-ADMIN-09 — Unit detail — Pricing tab

**APIs:** `GET/POST /api/internal/units/{unitId}/seasonal-pricing`, `PUT/DELETE /api/internal/seasonal-pricing/{id}`

**In Scope:**
- Base price displayed (read from unit data)
- Seasonal pricing table: label, start date, end date, price/night, actions
- Add seasonal pricing → form: label, date range picker, price
- Edit inline or in modal
- Delete with ConfirmDialog

---

### FE-2-ADMIN-10 — Unit detail — Date Blocks tab

**APIs:** `GET/POST /api/internal/units/{unitId}/date-blocks`, `PUT/DELETE /api/internal/date-blocks/{id}`

**In Scope:**
- List of current date blocks: reason, start, end, blocked by, actions
- Add block → form: date range + reason (select: maintenance/owner_use/other)
- Delete with ConfirmDialog

---

### FE-2-ADMIN-11 — Unit detail — Availability tab

**API:** `POST /api/units/{unitId}/availability/operational-check`

**In Scope:**
- Calendar view showing which dates are available, booked, or blocked
- Use `react-day-picker` in range-select disabled mode to visually show state
- Call operational-check endpoint with date range to get status

---

### FE-2-ADMIN-12 — Units services + hooks

**Objective:** Create complete service + hook layer for units domain.

**Files:**
- `lib/api/services/units.service.ts` — all unit API calls
- `lib/hooks/useUnits.ts` — list with filters, detail, create, update, delete, status
- `lib/types/unit.types.ts` — all unit-related TypeScript types
- Invalidation: after create/update → invalidate `queryKeys.units.all`

---

---

# WAVE 3 — CRM + Bookings (Core Business)
**Two parallel tracks. Coordinate on shared service layer before starting.**

## Track A: CRM Domain

---

### FE-3-CRM-01 — CRM pipeline board

**Objective:** Build `/admin/crm/page.tsx` — kanban pipeline view.

**API:** `GET /api/internal/crm/leads` (returns all leads across all statuses)

**In Scope:**
- Kanban board with columns (loaded via dynamic import):
  - prospecting | relevant | no_answer | booked | confirmed | check_in | completed
  - Exit columns: not_relevant | cancelled | left_early (collapsed or separate section)
- Each column shows: column name, lead count, scrollable card list
- Loading: skeleton columns

**Acceptance Criteria:** Board renders with correct columns. Cards appear in correct column based on status.

---

### FE-3-CRM-02 — Lead card component

**Objective:** Build `components/admin/crm/LeadCard.tsx`.

**In Scope:**
- Shows: client name, unit name (if assigned), area, days in current status, source badge
- Click → opens lead detail drawer (FE-3-CRM-03)
- Status badge using StatusBadge component

---

### FE-3-CRM-03 — Lead detail drawer/modal

**Objective:** Build `components/admin/crm/LeadDetailDrawer.tsx`.

**API:** `GET /api/internal/crm/leads/{id}` → `CrmLeadDetailsResponse`

**In Scope:**
- Slide-in drawer (right side) with full lead info:
  - Client name, phone, source badge
  - Unit selected (if any) + dates + guests
  - Current status + status history list
  - Notes section (FE-3-CRM-05)
  - Assignment info
- Status change button → triggers FE-3-CRM-04
- "Convert to Booking" button (if status = booked) → FE-3-CRM-07

---

### FE-3-CRM-04 — Lead status transition

**Objective:** Implement status change flow for leads.

**API:** `PATCH /api/internal/crm/leads/{id}/status` (UpdateCrmLeadStatusRequest)

**In Scope:**
- Status dropdown or button group showing only valid next statuses
- For transitions that release availability (not_relevant, cancelled): show ConfirmDialog
- On success: toast + invalidate `queryKeys.crm.leads`

**Valid transitions (from TRD):**
- prospecting → relevant | no_answer | not_relevant
- relevant → booked | no_answer | not_relevant
- no_answer → relevant | not_relevant
- booked → confirmed | not_relevant
- confirmed → check_in | cancelled
- check_in → completed | left_early

---

### FE-3-CRM-05 — Lead notes (add/edit/delete)

**APIs:**
- `GET /api/internal/crm/leads/{leadId}/notes`
- `POST /api/internal/crm/leads/{leadId}/notes` (AddLeadNoteRequest)
- `PUT /api/internal/crm/notes/{id}` (UpdateCrmNoteRequest)
- `DELETE /api/internal/crm/notes/{id}`

**In Scope:**
- Notes list: note text, author, date
- Add note: textarea + submit
- Edit: inline edit with save/cancel
- Delete: ConfirmDialog

---

### FE-3-CRM-06 — Lead assignment

**APIs:** `GET/POST/DELETE /api/internal/crm/leads/{leadId}/assignment`

**In Scope:**
- Shows currently assigned sales user
- "Assign" dropdown → list of sales admin users
- "Unassign" removes assignment

---

### FE-3-CRM-07 — Convert lead to booking

**API:** `POST /api/internal/crm/leads/{id}/convert-to-booking` (ConvertLeadToBookingRequest)

**In Scope:**
- Button visible when lead status = booked
- Modal: select unit (from available units), confirm dates, confirm guests
- On success: redirect to booking detail page + toast

---

### FE-3-CRM-08 — CRM services + hooks

**Files:**
- `lib/api/services/crm.service.ts`
- `lib/hooks/useCrmLeads.ts`
- `lib/types/crm.types.ts`

---

## Track B: Bookings Domain

---

### FE-3-BOOK-01 — Bookings list page

**Objective:** Build `/admin/bookings/page.tsx`.

**API:** `GET /api/internal/bookings` with filters

**In Scope:**
- Filter bar: status, unit, date range, assigned_to
- Table: client name, unit, check-in, check-out, nights, status badge, total amount, assigned to, link to detail
- Skeleton + EmptyState
- "Create Booking" (internal) → `POST /api/internal/bookings`

---

### FE-3-BOOK-02 — Booking detail page

**Objective:** Build `/admin/bookings/[id]/page.tsx` — the most complex admin page.

**API:** `GET /api/internal/bookings/{id}` → `BookingDetailsResponse`

**In Scope:**
- Page layout with multiple sections (not tabs):
  1. Booking status stepper (FE-3-BOOK-03)
  2. Client info panel
  3. Unit info panel + dates + guests
  4. Actions panel (FE-3-BOOK-04)
  5. Payments section (FE-3-BOOK-05)
  6. Finance snapshot (FE-3-BOOK-07)
  7. Invoice section (FE-3-BOOK-06)
  8. Notes section (FE-3-BOOK-08)
  9. Status history timeline (FE-3-BOOK-09)

---

### FE-3-BOOK-03 — Booking status stepper component

**Objective:** Build `components/admin/bookings/BookingStatusStepper.tsx`.

**In Scope:**
- Visual horizontal stepper showing the pipeline stages
- Current stage highlighted
- Exit states (cancelled, left_early) shown as a branch below

---

### FE-3-BOOK-04 — Booking lifecycle actions

**APIs:**
- `POST /api/internal/bookings/{id}/confirm` (ConfirmBookingRequest)
- `POST /api/internal/bookings/{id}/cancel` (CancelBookingRequest)
- `POST /api/internal/bookings/{id}/complete` (CompleteBookingRequest)

**In Scope:**
- Action buttons shown conditionally based on current status:
  - Status = booked → show "Confirm" (requires deposit entry)
  - Status = confirmed or check_in → show "Cancel" (ConfirmDialog with reason)
  - Status = check_in → show "Mark Completed"
- Each action shows loading → success toast → invalidates booking query

---

### FE-3-BOOK-05 — Payment recording

**APIs:**
- `GET /api/internal/payments` (filtered by booking)
- `POST /api/internal/payments` (CreatePaymentRequest)
- `POST /api/internal/payments/{id}/mark-paid`
- `POST /api/internal/payments/{id}/mark-failed`
- `POST /api/internal/payments/{id}/cancel`

**In Scope:**
- Payments list per booking: type (deposit/remaining/refund), amount, date, status, proof image link
- "Add Payment" button → modal: type selector, amount, date, proof image upload (FileUpload component)
- Status action buttons per payment row: mark paid, mark failed, cancel

---

### FE-3-BOOK-06 — Invoice view

**APIs:** `GET /api/internal/invoices` (by booking), `GET /api/internal/invoices/{id}`

**In Scope:**
- Invoice card: invoice number, issued date, total, deposit, remaining, PDF link
- "View PDF" button → opens pdf_url

---

### FE-3-BOOK-07 — Finance snapshot

**API:** `GET /api/internal/bookings/{bookingId}/finance-snapshot` → `BookingFinanceSnapshotResponse`

**In Scope:**
- Read-only panel: total value, commission rate, commission amount, owner net, amount collected, remaining

---

### FE-3-BOOK-08 — Booking notes

**APIs:** `GET/POST /api/internal/bookings/{bookingId}/notes`

Same pattern as FE-3-CRM-05 but for bookings.

---

### FE-3-BOOK-09 — Booking status history timeline

**API:** `GET /api/internal/bookings/{id}/status-history` → `BookingStatusHistoryResponse[]`

**In Scope:**
- Vertical timeline: old status → new status, changed by (user name), date, notes
- Most recent at top

---

### FE-3-BOOK-10 — Bookings services + hooks

**Files:**
- `lib/api/services/bookings.service.ts`
- `lib/api/services/payments.service.ts`
- `lib/api/services/invoices.service.ts`
- `lib/hooks/useBookings.ts`
- `lib/hooks/usePayments.ts`
- `lib/hooks/useInvoices.ts`
- `lib/types/booking.types.ts`

---

---

# WAVE 4 — Finance + Owners + Clients
**Three parallel tracks.**

## Track A: Finance

---

### FE-4-FIN-01 — Finance overview tab

**API:** `GET /api/internal/reports/finance/summary` → `FinanceAnalyticsSummaryResponse`

**In Scope:**
- 4 metric cards: Total Revenue, Total Commission, Total Paid to Owners, Total Outstanding
- Month/quarter/year filter
- Summary totals update on filter change

---

### FE-4-FIN-02 — Finance transactions list

**API:** `GET /api/internal/payments` (full list, no booking filter)

**In Scope:**
- Table: client name, unit, owner, booking ID, payment type, amount, date, status
- Filters: date range, payment type, owner
- Pagination

---

### FE-4-FIN-03 — Owner payouts management

**APIs:** `GET/POST /api/internal/owner-payouts`, `POST /api/internal/owner-payouts/{id}/mark-paid`, `POST /api/internal/owner-payouts/{id}/cancel`

**In Scope:**
- Payouts list: owner name, amount, date, method, status badge, proof image link, actions
- "Add Payout" button → modal: select owner, amount, date, payment method, proof image upload
- Mark paid / Cancel buttons per row

---

### FE-4-FIN-04 — Finance services + hooks

**Files:**
- `lib/api/services/finance.service.ts`
- `lib/hooks/useFinance.ts`
- `lib/types/finance.types.ts`

Finance page layout: tabs (Overview | Transactions | Payouts) in `/admin/finance/page.tsx`.

---

## Track B: Owners

---

### FE-4-OWN-01 — Owners list page

**API:** `GET /api/owners`

Table: name, phone, commission rate, unit count, status badge, link to detail.
"Add Owner" button → create form.

---

### FE-4-OWN-02 — Owner create form

**API:** `POST /api/owners` (CreateOwnerRequest)

Form: name, phone, email (optional), commission_rate (number 0-100).

---

### FE-4-OWN-03 — Owner detail page (multi-tab)

**API:** `GET /api/owners/{id}` → `OwnerDetailsResponse`

**Tabs:**
1. **Info** — profile fields, edit via `PUT /api/owners/{id}`, status via `PATCH /api/owners/{id}/status`
2. **Units** — list of owner's units → links to unit detail pages
3. **Earnings** — `GET /api/internal/owners/{ownerId}/payout-summary` → `OwnerPayoutSummaryResponse`
4. **Payouts** — `GET /api/internal/owners/{ownerId}/payouts` + "Add Payout" button

---

### FE-4-OWN-04 — Owners services + hooks

**Files:** `lib/api/services/owners.service.ts`, `lib/hooks/useOwners.ts`, `lib/types/owner.types.ts`

---

## Track C: Clients + Admin Users

---

### FE-4-CLI-01 — Clients list page

**API:** `GET /api/clients`

Table: name, phone, email, total bookings, last booking date, link to detail.

---

### FE-4-CLI-02 — Client detail page

**API:** `GET /api/clients/{id}` → `ClientDetailsResponse`

**In Scope:**
- Profile section: name, phone, email, created date
- Bookings history table: unit, dates, status, amount
- Retention metrics: total bookings, total spent

---

### FE-4-CLI-03 — Clients services + hooks

**Files:** `lib/api/services/clients.service.ts`, `lib/hooks/useClients.ts`, `lib/types/client.types.ts`

---

### FE-4-SET-01 — Admin users management

**APIs:** `GET/POST /api/admin-users`, `PATCH /api/admin-users/{id}/role`, `PATCH /api/admin-users/{id}/status`

**In Scope:** Table of admin users. Add admin form. Role change dropdown per user. Status toggle.

Lives inside `/admin/settings/page.tsx` as a section.

---

---

# WAVE 5 — Admin Dashboard + Reviews + Notifications
**Two parallel tracks. Admin panel complete after this wave.**

## Track A: Dashboard + Reports

---

### FE-5-DASH-01 — Dashboard KPI cards

**API:** `GET /api/internal/reports/bookings/summary` + `GET /api/internal/reports/finance/summary`

**4 KPI cards:** Total Revenue (this month), Commission Earned, Active Bookings (confirmed + check_in), Pending Leads (prospecting + relevant).

---

### FE-5-DASH-02 — Dashboard charts

**APIs:** `GET /api/internal/reports/finance/daily`, `GET /api/internal/reports/bookings/daily`

**In Scope:**
- Line chart: daily revenue last 30 days (Recharts — dynamic import)
- Bar chart: daily bookings last 30 days (Recharts — dynamic import)
- Both load independently (separate queries)

---

### FE-5-DASH-03 — Dashboard smart alerts

**Objective:** Compute actionable alerts from existing query data (no new APIs).

**In Scope:**
- "X leads haven't been contacted in 3+ days" → computed from CRM leads query
- "X units have no confirmed booking in 30 days" → computed from units + bookings data
- "X owner payouts pending 30+ days" → computed from payouts data
- Show as dismissible alert cards above the charts

---

### FE-5-DASH-04 — Reports services + hooks

**Files:** `lib/api/services/reports.service.ts`, `lib/hooks/useReports.ts`

---

## Track B: Reviews + Notifications

---

### FE-5-REV-01 — Reviews moderation page

**Objective:** Build `/admin/reviews/page.tsx`.

**APIs:** `GET` reviews list (via internal endpoint), `POST /api/internal/reviews/{reviewId}/publish`, `/reject`, `/hide`

**In Scope:**
- Table: reviewer name, unit, rating stars, comment excerpt, status badge, actions
- Actions per row: publish / reject / hide (based on current status)
- Each action: ConfirmDialog → API call → toast + invalidate

---

### FE-5-REV-02 — Review status history

**API:** `GET /api/internal/reviews/{reviewId}/status-history`

Side panel or modal showing moderation history for a review.

---

### FE-5-REV-03 — Reviews services + hooks

**Files:** `lib/api/services/reviews.service.ts`, `lib/hooks/useReviews.ts`, `lib/types/review.types.ts`

---

### FE-5-NOT-01 — Admin notifications inbox

**APIs:** `GET /api/internal/me/notifications/inbox`, `GET /api/internal/me/notifications/inbox/summary`, `POST /api/internal/me/notifications/inbox/{notificationId}/read`

**In Scope:**
- Notification bell in admin header with unread count badge (from summary)
- Dropdown or drawer: list of notifications, mark as read on click
- Mark all read button

---

### FE-5-NOT-02 — Admin notification preferences

**APIs:** `GET/PUT /api/internal/me/notification-preferences`

Simple preferences form inside settings page.

---

### FE-5-NOT-03 — Notifications services + hooks

**Files:** `lib/api/services/notifications.service.ts`, `lib/hooks/useNotifications.ts`, `lib/types/notification.types.ts`

---

---

# WAVE 6 — Owner Portal
**Parallel with Wave 7.**

---

### FE-6-OWN-01 — Owner shell layout + sidebar

**Objective:** Build `OwnerShell.tsx`, `OwnerSidebar.tsx`, `app/(owner)/layout.tsx`.

Sidebar items: Dashboard | Units | Bookings | Finance | Notifications
Simpler layout than admin — no role-based hiding needed.

---

### FE-6-OWN-02 — Owner dashboard

**API:** `GET /api/owner/dashboard` → `OwnerPortalDashboardSummaryResponse`

**In Scope:**
- Earnings this month metric card
- Upcoming check-ins list
- Unit occupancy summary

---

### FE-6-OWN-03 — Owner units list

**API:** `GET /api/owner/units` → `OwnerPortalUnitResponse[]`

Read-only grid of owner's units. Name, type, area, status. Links to detail.

---

### FE-6-OWN-04 — Owner unit detail (read-only + calendar)

**API:** `GET /api/owner/units/{unitId}` → `OwnerPortalUnitResponse`

**In Scope:**
- Unit info: name, type, area, capacity, amenities
- Read-only availability calendar showing confirmed bookings
- No edit controls whatsoever

---

### FE-6-OWN-05 — Owner bookings list

**API:** `GET /api/owner/bookings` → `OwnerPortalBookingResponse[]`

Shows only confirmed + check_in + completed bookings.
Table: client name (anonymized if needed), unit, dates, status.

---

### FE-6-OWN-06 — Owner booking detail

**API:** `GET /api/owner/bookings/{bookingId}`

Summary view: dates, guests, status, owner earnings for this booking. No financial raw data.

---

### FE-6-OWN-07 — Owner finance

**APIs:** `GET /api/owner/finance/summary`, `GET /api/owner/finance`, `GET /api/owner/finance/bookings/{bookingId}`

**In Scope:**
- Summary: earnings this month, total paid, outstanding
- Per-booking rows: booking ID, dates, total value, owner net, status
- Click row → per-booking finance detail

---

### FE-6-OWN-08 — Owner notifications inbox

**APIs:** `GET/POST /api/owner/me/notifications/inbox`, `/summary`

Same pattern as admin notifications (FE-5-NOT-01) but using owner endpoints.

---

### FE-6-OWN-09 — Owner notification preferences

**APIs:** `GET/PUT /api/owner/me/notification-preferences`

---

### FE-6-OWN-10 — Owner review reply

**APIs:** `GET/PUT/DELETE /api/owner/reviews/{reviewId}/reply`, `PATCH /api/owner/reviews/{reviewId}/reply/visibility`

**In Scope:** Reply form accessible from booking detail page (if booking has a review).

---

### FE-6-OWN-11 — Owner portal services + hooks

**Files:** `lib/api/services/owner-portal.service.ts`, `lib/hooks/useOwnerPortal.ts`

---

---

# WAVE 7 — Guest App (Public Facing)
**Parallel with Wave 6.**

---

### FE-7-PUB-01 — Public layout (header + footer)

**Objective:** Build `components/public/layout/PublicHeader.tsx`, `PublicFooter.tsx`, `app/(public)/layout.tsx`.

Header: logo, nav links, login/register button (or user menu if logged in).
Footer: simple links.

---

### FE-7-PUB-02 — Homepage

**Objective:** Build `app/(public)/page.tsx`.

**APIs:** `GET /api/areas`, `GET /api/units` (top 6, no filters)

**In Scope:**
- Hero section with search bar (area + date range + guests)
- Area cards grid (dynamic import for image-heavy grid)
- Featured units section
- Search submit → navigate to `/units` with query params

---

### FE-7-PUB-03 — Search results page

**Objective:** Build `app/(public)/units/page.tsx`.

**API:** `GET /api/units` with all filter params

**In Scope:**
- Reads filters from URL query params
- Filter panel (left sidebar or drawer on mobile): area, dates, guests, type, amenities, price range
- Unit cards grid
- Sort: cheapest, highest rated, most booked
- Pagination with `keepPreviousData: true`
- Skeleton grid while loading

---

### FE-7-PUB-04 — Filter panel component

**Objective:** Build `components/public/search/FilterPanel.tsx`.

Inputs: area multi-select, date range picker, guest count, unit type checkboxes, amenity checkboxes, price range slider.
On change: updates URL query params (no submit button — debounced).

---

### FE-7-PUB-05 — Unit card component

**Objective:** Build `components/public/search/UnitCard.tsx`.

Shows: primary image, name, area, type, capacity, rating stars + count, price/night.
Click → navigate to `/units/{id}`.

---

### FE-7-PUB-06 — Unit detail page

**Objective:** Build `app/(public)/units/[id]/page.tsx`.

**APIs:**
- `GET /api/units/{id}` → UnitDetailsResponse
- `GET /api/public/units/{unitId}/reviews/summary`
- `GET /api/public/units/{unitId}/reviews`
- `POST /api/units/{unitId}/pricing/calculate` (called on date selection)

**In Scope:**
- Image gallery (dynamic import)
- Info section: name, type, area, capacity, description
- Amenities list
- Pricing calculator panel (sticky on desktop):
  - Date range picker
  - Guest count
  - On date selection → call pricing/calculate → show nightly breakdown + total
  - "Book Now" button
- Availability calendar (disabled dates = booked/blocked)
- Reviews section (summary stars + paginated list)

---

### FE-7-PUB-07 — Unit image gallery

**Objective:** Build `components/public/unit/UnitGallery.tsx` (dynamic import).

**In Scope:**
- Grid preview of first 4 images + "Show all" button
- Lightbox modal for full gallery navigation

---

### FE-7-PUB-08 — Availability calendar (public)

**Objective:** Build `components/public/unit/AvailabilityCalendar.tsx`.

**In Scope:**
- `react-day-picker` in range selection mode
- Disabled dates: booked + blocked (derived from unit detail data or operational-check)
- Emits selected range upward to booking form

---

### FE-7-PUB-09 — Booking flow + inline registration

**Objective:** Build the complete booking flow for end users.

**APIs:**
- `POST /api/auth/client/register` (if not logged in)
- `POST /api/crm/leads` (PublicCreateCrmLeadRequest)

**Flow:**
1. User clicks "Book Now" on unit detail page
2. If not authenticated → show inline form (name, phone, optional email, password) in a modal or expanded panel
3. If authenticated → skip to step 4
4. Submit booking: create CRM lead with unit, dates, guests, source = 'website'
5. On success: show confirmation screen (step 5)

**In Scope:** Zod validation on registration fields. Loading state. Error display.

---

### FE-7-PUB-10 — Booking confirmation screen

**Objective:** Build `app/(public)/bookings/[id]/page.tsx` — post-booking success screen.

**In Scope:**
- "Your booking request has been received" message
- Summary: unit name, dates, guests, total estimate
- "Our sales team will contact you at {phone} shortly"
- Link to account/bookings

---

### FE-7-PUB-11 — Client account page

**Objective:** Build `app/(public)/account/page.tsx`.

**In Scope:** Profile info display. Edit profile link. Link to booking history.

---

### FE-7-PUB-12 — Client booking history

**Objective:** Build `app/(public)/account/bookings/page.tsx`.

List of client's bookings. Status badges. Link to review submission for completed ones.

---

### FE-7-PUB-13 — Review submission page

**Objective:** Build `app/(public)/bookings/[id]/review/page.tsx`.

**APIs:** `POST /api/client/reviews`, `PUT /api/client/reviews/{reviewId}`

**In Scope:**
- Star rating selector (1-5)
- Optional comment textarea
- Only accessible if booking status = completed and no review yet
- Submit → success message

---

### FE-7-PUB-14 — Client notifications inbox

**APIs:** `GET /api/client/me/notifications/inbox`, `POST .../read`, `GET .../summary`

Notification bell in public header + drawer.

---

---

# WAVE 8 — Polish + Performance + Cross-cutting

---

### FE-8-QA-01 — Lazy loading audit

**Objective:** Verify every heavy component uses `dynamic()` with loading fallback.

Checklist:
- PipelineBoard ✓
- UnitGallery ✓
- AvailabilityCalendar ✓
- Revenue charts ✓
- All modals not always visible ✓

Fix any missing `dynamic()` imports.

---

### FE-8-QA-02 — Skeleton loading audit

**Objective:** Every list page and detail page shows skeleton while loading.

Walk through every page. Any `isLoading` state that shows a spinner instead of skeleton → replace with skeleton.

---

### FE-8-QA-03 — Error boundary audit

**Objective:** Verify error boundaries wrap all major sections.

Every major page section wrapped in ErrorBoundary. No raw stack traces visible to users.

---

### FE-8-QA-04 — TypeScript strict mode — zero errors

**Objective:** `npm run build` has zero TypeScript errors.

No `any`. No `// @ts-ignore`. Fix all type issues properly.

---

### FE-8-QA-05 — Mobile responsiveness pass

**Objective:** All three apps are usable on mobile viewport (375px+).

Admin panel: sidebar becomes mobile drawer. Tables become card lists on mobile.
Owner portal: same.
Guest app: filter panel becomes bottom drawer on mobile.

---

### FE-8-QA-06 — Empty states audit

**Objective:** Every list shows EmptyState when 0 results — never just blank space.

---

### FE-8-QA-07 — 404 + error fallback pages

**Objective:** Build `app/not-found.tsx` and per-app error pages.

`not-found.tsx`: friendly 404 with links back to home / dashboard.

---

### FE-8-QA-08 — Environment config + deployment check

**Objective:** Verify all env variables documented. Build succeeds for production.

- `.env.example` complete and up to date
- `NEXT_PUBLIC_API_URL` correctly set for production
- `npm run build` succeeds cleanly
- No hardcoded localhost URLs anywhere

---

---

## Summary

| Total Waves | 8 |
|---|---|
| Total Tickets | 117 |
| Estimated Duration (1 dev) | ~42 days |
| Estimated Duration (2 devs, parallel) | ~25 days |
| Critical Path | W0 → W1 → W2 → W3 → W4 → W5 → [W6∥W7] → W8 |
| Largest Wave | Wave 3 (CRM + Bookings) — 18 tickets |
| Highest Risk | FE-3-BOOK-02 (Booking Detail) — most complex page |
| First Shippable Value | End of Wave 3 — Admin CRM + Bookings working |
