# CRM-REFACTOR — Implementation Brief (handoff)

> Self-contained brief for an implementing agent. Assumes **no prior context** — every file path, exact predicate, message string, credential, and gotcha is spelled out. A separate reviewer will check the resulting diff against this document.

---

## 0. Background you must know

App is **"Kaza Booking"**:
- **Backend**: .NET 10 layered solution — `RentalPlatform.API` / `.Business` / `.Data` / `.Shared`. EF Core with **explicit column mapping** (`HasColumnName`; no snake_case convention). Postgres/Npgsql. FluentValidation. JWT auth.
- **Frontend**: Next.js App Router in `rental-platform/` — TanStack React Query + axios + react-hook-form + zod. `app/(admin)/...` route-group implementations are re-exported by literal `app/admin/...` folders to produce `/admin/...` URLs.

**Operational rules (do not violate):**
- The backend runs in **Docker** as the `kaza-api` container (port 5001). After any backend change you MUST rebuild: `docker compose build api && docker compose up -d api`. `dotnet run` will **not** apply changes to the running stack. The frontend is dev-served (hot reload — no rebuild).
- **No DB schema changes / no migrations.** (Confirmed decision — see §1.)
- **No mock/hardcoded data.** The unit list must come from the live API.

**Goal:** At `/admin/crm`, invert the Create-Lead form to be **dates-first**. The target-unit dropdown stays disabled until a valid check-in/check-out range is chosen; it then shows **only** units with zero overlapping holding bookings and zero overlapping maintenance date-blocks for that window. Also enforce phone pattern `^\+?\d{10,15}$` on the lead form + backend lead validators, and verify the calendar picker doesn't dismiss after the first click.

---

## 1. Decisions already made with the user (do NOT deviate)

1. **No new DB index / no migration.** The bookings table has only single-column indexes (`unit_id`, `booking_status`, `check_in_date`, `check_out_date`); `date_blocks` already has a composite `(unit_id, start_date, end_date)`. That is adequate. Do not add an index.
2. **No hard backend availability gate on lead creation.** A CRM lead is a *prospect*; `CrmLeadService.CreateAsync` must keep creating leads regardless of availability. The "in-flight collision" edge case is handled **on the frontend** by the date-filtered dropdown + the existing per-unit availability warning that disables submit.

---

## 2. Part A — Backend: date-filtered internal units catalog

The catalog query lives in the **Business layer** (`UnitService`), not a repository. The `Unit` entity has a `DateBlocks` navigation but **NO `Bookings` navigation** (the FK is configured `.WithMany()` with no inverse) — so you cannot write `u.Bookings.Any(...)`. Use a two-step exclusion.

Mirror the **exact** overlap semantics from `RentalPlatform.Business/Services/UnitAvailabilityService.cs` so the dropdown agrees with the per-unit availability check:
- **Holding bookings** (half-open; checkout = departure day, not occupied): `from < b.CheckOutDate && to > b.CheckInDate`, filtered to holding statuses.
- **Date blocks** (inclusive both ends): `from <= db.EndDate && to >= db.StartDate`.

Facts:
- Holding statuses constant: `RentalPlatform.Shared.Constants.BookingStatusTransitions.HoldingStatuses` = `{ Booked, Confirmed, CheckIn }`.
- `Booking.CheckInDate` / `Booking.CheckOutDate` are `DateOnly`; `Booking.BookingStatus` is `RentalPlatform.Shared.Enums.BookingStatus`.
- `DateBlock.StartDate` / `DateBlock.EndDate` are `DateOnly`.
- `Booking` and `DateBlock` have **no soft-delete**. `Unit` has a global query filter `DeletedAt == null`, so `_unitOfWork.Units.Query()` already excludes deleted units.

### A1. `RentalPlatform.Business/Services/UnitService.cs` → `GetInternalCatalogAsync`
Add two optional params **before** `CancellationToken cancellationToken = default`:
`DateOnly? availableFrom = null, DateOnly? availableTo = null`.

After the existing filters are applied to `IQueryable<Unit> query` but **before** `CountAsync`/paging, insert:

```csharp
// Availability filter: exclude units with an overlapping holding booking or
// maintenance block. Predicate semantics mirror UnitAvailabilityService
// (bookings = half-open [checkIn, checkOut); blocks = inclusive [start, end]).
if (availableFrom.HasValue && availableTo.HasValue)
{
    if (availableFrom.Value >= availableTo.Value)
        throw new BusinessValidationException("availableTo must be after availableFrom.");

    var holding = BookingStatusTransitions.HoldingStatuses;

    var bookedUnitIds = await _unitOfWork.Bookings.Query()
        .Where(b => holding.Contains(b.BookingStatus)
                 && availableFrom.Value < b.CheckOutDate
                 && availableTo.Value   > b.CheckInDate)
        .Select(b => b.UnitId).Distinct().ToListAsync(cancellationToken);

    var blockedUnitIds = await _unitOfWork.DateBlocks.Query()
        .Where(db => availableFrom.Value <= db.EndDate
                  && availableTo.Value   >= db.StartDate)
        .Select(db => db.UnitId).Distinct().ToListAsync(cancellationToken);

    var unavailable = bookedUnitIds.Concat(blockedUnitIds).Distinct().ToList();
    if (unavailable.Count > 0)
        query = query.Where(u => !unavailable.Contains(u.Id));
}
```

If only one of the two dates is provided, ignore the availability filter (behave as before). Add `using RentalPlatform.Shared.Constants;` if not already present.

### A2. `RentalPlatform.Business/Interfaces/IUnitService.cs`
Update the `GetInternalCatalogAsync` signature to add the same two optional params (same position).

### A3. `RentalPlatform.API/Controllers/UnitsController.cs` → `GetInternalUnits`
The endpoint is `[HttpGet("api/internal/units")]`, `[Authorize(Policy = "InternalUnitsRead")]`, binding individual `[FromQuery]` params (no DTO). Keep that style:
- Add params: `[FromQuery] DateOnly? availableFrom = null, [FromQuery] DateOnly? availableTo = null` (`DateOnly` binds from `YYYY-MM-DD` query strings in .NET 10).
- Pass `availableFrom, availableTo` through to `_unitService.GetInternalCatalogAsync(...)`.

---

## 3. Part B — Backend: phone regex on lead validators

File: `RentalPlatform.API/Validators/CrmLeadValidators.cs`. The admin form posts to `POST /api/internal/crm/leads` → binds `InternalCreateCrmLeadRequest`. Add the regex to the `ContactPhone` rule in **all three** validators — `InternalCreateCrmLeadRequestValidator`, `PublicCreateCrmLeadRequestValidator`, `UpdateCrmLeadRequestValidator` — keeping their existing `.NotEmpty()` / `.MaximumLength(30)`:

```csharp
RuleFor(x => x.ContactPhone)
    .NotEmpty()
    .MaximumLength(30)
    .Matches(@"^\+?\d{10,15}$")
    .WithMessage("Invalid phone configuration. Provide 10-15 digits with an optional leading '+' format.");
```

(Matches the regex already in `ClientRequestValidators.cs` / `ClientRegisterRequestValidator.cs`.)

---

## 4. Part C — Frontend: types / hook / service plumbing

The units service forwards filters as axios params, and the query key already hashes the whole filters object — so you only extend the type + add an `enabled` toggle to the hook.

### C1. `rental-platform/lib/types/unit.types.ts`
Extend `UnitListFilters`:
```ts
availableFrom?: string; // YYYY-MM-DD
availableTo?: string;   // YYYY-MM-DD
```

### C2. `rental-platform/lib/hooks/useUnits.ts` → `useInternalUnitsList`
Add an optional second arg and forward `enabled` (backward-compatible):
```ts
export function useInternalUnitsList(
  filters?: UnitListFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.units.internalList(filters),
    queryFn: () => unitsService.getInternalList(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    enabled: options?.enabled ?? true,
  });
}
```

---

## 5. Part D — Frontend: the CRM lead form

File: `rental-platform/components/admin/crm/CreateLeadForm.tsx`. It uses react-hook-form + zod (inline `createLeadSchema`), the shared controlled `<DateRangePicker>` (`value={{from,to}}` / `onChange`), `<Combobox>` for the unit, and already runs a per-unit availability check via the **3-arg** `useAvailabilityCheck` imported from `@/lib/hooks/usePublic`.
> ⚠️ Gotcha: there is a **different** 4-arg `useAvailabilityCheck(unitId, month, year, filters)` in `useUnits.ts`. Keep importing the **`usePublic`** one (`useAvailabilityCheck(unitId, startDate, endDate)`).

`desiredStart`/`desiredEnd` are already derived as `YYYY-MM-DD` via `formatDateForApi`.

### D1. Phone enforcement
- In `createLeadSchema`, change `contactPhone` to:
  ```ts
  contactPhone: z
    .string()
    .min(1, "Please enter the phone number")
    .regex(/^\+?\d{10,15}$/, "Invalid phone configuration. Provide 10-15 digits with an optional leading '+' format."),
  ```
- Set the form to validate live: `useForm<FormValues>({ resolver: zodResolver(createLeadSchema), mode: "onChange", defaultValues: {...} })` (so the error shows/clears instantly).
- Add a shared helper in `rental-platform/lib/utils/format.ts`:
  ```ts
  // Keep only digits and a single optional leading '+'.
  export function sanitizePhoneInput(value: string): string {
    const plus = value.trimStart().startsWith("+") ? "+" : "";
    return plus + value.replace(/\D/g, "");
  }
  ```
  Wire it onto the phone `Input` (strip non-numeric as the user types). With `{...register("contactPhone")}`, override `onChange`:
  ```tsx
  const phoneReg = register("contactPhone");
  // ...
  <Input
    label="Phone number" type="tel" required disabled={isLoading}
    {...phoneReg}
    onChange={(e) => { e.target.value = sanitizePhoneInput(e.target.value); phoneReg.onChange(e); }}
    error={errors.contactPhone?.message}
  />
  ```
- **Cross-persona parity:** apply the same `sanitizePhoneInput` onChange wrapper to the public phone inputs in the auth forms `rental-platform/components/.../InlineRegisterForm.tsx` and `InlineLoginForm.tsx` (confirm exact paths under `components/`). Their zod regex is already `^\+?\d{10,15}$`; only add the onChange sanitizer.

### D2. Date-first reorder + dynamic, filtered unit dropdown
- **Reorder**: put **Desired dates** (`<DateRangePicker>`) first, **Target unit** (`<Combobox>`) directly beneath it, then contact name/phone/email, source, guest count, internal note. Re-label the unit field "Target unit" (no longer "(optional)").
- Compute nights + validity:
  ```ts
  const nights = desiredStart && desiredEnd
    ? Math.round((new Date(desiredEnd).getTime() - new Date(desiredStart).getTime()) / 86_400_000)
    : 0;
  const hasValidRange = Boolean(desiredStart && desiredEnd && nights >= 1);
  ```
- **Single-night edge case:** if both dates are set but `nights < 1`, render an inline alert (reuse the existing red `AlertTriangle` alert block already in this file): **`Check-out date must be at least 1 night after check-in.`** Treat the range as invalid (units query disabled, submit disabled).
- **Feed + gate the units query** (replaces the current unconditional `useInternalUnitsList({ pageSize: 500 })`):
  ```ts
  const { data: unitsData, isLoading: isLoadingUnits } = useInternalUnitsList(
    { pageSize: 500, availableFrom: desiredStart ?? undefined, availableTo: desiredEnd ?? undefined },
    { enabled: hasValidRange }
  );
  ```
- **Combobox behavior:**
  - `disabled` until `hasValidRange` (also keep disabled while a submit is in flight).
  - Placeholder, no valid range: **`Select desired date range to view available units`**.
  - Placeholder while loading: **`Loading available units…`**.
  - `hasValidRange` and empty list: helper text beneath the combobox: **`No units available for this date frame. Try adjusting your dates.`**
  - When the date range changes and the previously-selected `targetUnitId` is no longer in the options, clear it (`setValue("targetUnitId", undefined)`), e.g. in a `useEffect` keyed on the option list / range.
- **Keep** the existing per-unit `useAvailabilityCheck(targetUnitId, desiredStart, desiredEnd)` + `hasDateConflict` warning and `disabled={hasDateConflict}` on submit — this is the graceful in-flight-collision handler. Also disable submit when `!hasValidRange` or no unit selected.
- Optional tidy: in `handleFormSubmit`, replace the hand-rolled date-string construction with the already-imported `formatDateForApi(values.desiredCheckInDate)` (same `YYYY-MM-DD`, no timezone shift).

---

## 6. Part E — Calendar premature-dismissal (VERIFY FIRST; likely no change)

File: `rental-platform/components/ui/DateRangePicker.tsx`. It already closes only when both ends are set:
```tsx
onSelect={(range) => {
  onChange({ from: range?.from ?? null, to: range?.to ?? null })
  if (range?.from && range?.to) setOpen(false)
}}
```
The project uses **react-day-picker v9**, whose range mode returns `{from, to: undefined}` after the first click — so the panel should already stay open after check-in and close after check-out. **Verify in the browser.** Only if it actually dismisses after the first click, harden the guard to require a real multi-day range:
```tsx
if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) setOpen(false)
```
Do not change otherwise.

---

## 7. Explicit non-changes
- No DB migration / no index.
- No availability gate inside `CrmLeadService.CreateAsync`.
- `auth.ts` / `booking.ts` phone regex already correct — leave the regex; only add the onChange sanitizer for parity.
- `formatCurrency` already renders two decimals — verify only.

---

## 8. Files to touch
- `RentalPlatform.Business/Services/UnitService.cs`
- `RentalPlatform.Business/Interfaces/IUnitService.cs`
- `RentalPlatform.API/Controllers/UnitsController.cs`
- `RentalPlatform.API/Validators/CrmLeadValidators.cs`
- `rental-platform/lib/types/unit.types.ts`
- `rental-platform/lib/hooks/useUnits.ts`
- `rental-platform/lib/utils/format.ts`
- `rental-platform/components/admin/crm/CreateLeadForm.tsx`
- `rental-platform/components/.../InlineRegisterForm.tsx`, `InlineLoginForm.tsx` (parity — confirm exact paths)
- (verify-only) `rental-platform/components/ui/DateRangePicker.tsx`

---

## 9. Smoke-test / Playwright constraints (auth-gated portal)

`/admin/*` is gated by three layered guards. This is a **functional** test (we verify live availability filtering), so the design-shot recipe is adapted: **authenticate against the real backend and do NOT blanket-mock `**/api/**`** — mocking would defeat the whole point (verifying that the live query excludes occupied units).

1. **Auth via the REAL admin login** (gives a real JWT in memory so live `/api/internal/units` calls carry a valid token, and sets the real `refresh_token` cookie):
   - Navigate to `/auth/admin/login`.
   - Seeded dev SuperAdmin: **`superadmin.dev@rental.local` / `Admin@1234`** (from `db/migrations/0008_seed_dev_master_data.sql`).
   - Fill `input[name="email"]` + `input[name="password"]`, click `button[type=submit]`.
2. **Middleware** (`middleware.ts`) redirects `/admin|/owner|/account` to login unless a `refresh_token` cookie is present — and it also fires on the RSC request of client-side (SPA) navigations. The real login sets this cookie. If you ever seed it manually, use the **url form**: `addCookies([{ name: 'refresh_token', value: 'x', url: 'http://localhost:3001' }])` (not bare `domain`).
3. **Beat the zustand hydration race:** after logging in (so `setAuth` puts `subjectType` + `accessToken` in memory), **SPA-navigate by clicking a nav link** to reach `/admin/crm` — do not hard-reload (a remount re-triggers the guard before persist rehydrates). AdminShell specifically refreshes when `accessToken` is null, so the cookie + a valid in-memory token is enough.
4. **Clean screenshots:** `page.emulateMedia({ reducedMotion: 'reduce' })` — the global `app/template.tsx` framer wrapper renders its subtree at `opacity:0` during load and headless Chromium pauses CSS animations; reduced-motion pins entrance animations to static.
5. **Playwright code-snippet gotcha:** `browser_run_code_unsafe` runs in the **Node** process; any DOM/`document` access must be wrapped in `page.evaluate(...)`.

---

## 10. QA verification checklist

### 10.1 Pre-flight
- [ ] Rebuild backend: `docker compose build api && docker compose up -d api`. Confirm the .NET build succeeded (no compile errors) and the container is healthy.
- [ ] Frontend type-check clean: `npm run type-check` (or `npx tsc --noEmit`) in `rental-platform/`.

### 10.2 API (use a real SuperAdmin JWT)
- [ ] `GET /api/internal/units?availableFrom=2026-07-01&availableTo=2026-07-05` → returns **only** units with no holding-booking / date-block overlap in that window. Response envelope is `{ success, data, message, errors, pagination }`.
- [ ] Cross-check a **known-booked** unit for that window against `GET /api/units/{id}/availability/operational-check?startDate=2026-07-01&endDate=2026-07-05` — the catalog exclusion and the per-unit check must **agree**.
- [ ] `GET /api/internal/units` with **no** date params → full list, behavior unchanged.
- [ ] `GET /api/internal/units?availableFrom=2026-07-05&availableTo=2026-07-01` (from ≥ to) → 400 `BusinessValidationException` ("availableTo must be after availableFrom").
- [ ] `POST /api/internal/crm/leads` with `contactPhone:"abc12"` → 400 with message *"Invalid phone configuration. Provide 10-15 digits with an optional leading '+' format."*; with `"12345"` (too short) → 400; with `"01062327721"` → 201; with `"+201062327721"` → 201.

### 10.3 Functional workflow matrix (UI at `/admin/crm`, logged in per §9)
- [ ] Open a clean browser context; navigate to `/admin/crm`; launch the **Create Lead** form.
- [ ] Confirm the **Unit dropdown is disabled** and shows `Select desired date range to view available units`.
- [ ] Click the **Desired Dates** selector; click a check-in day → **calendar stays open**.
- [ ] Click a valid check-out day → **calendar closes** and the field shows the range.
- [ ] After a valid range, open the Unit dropdown; via devtools **Network**, confirm the `GET /api/internal/units` request carries `availableFrom` & `availableTo`, and that **occupied/blocked units are absent** from the response array.
- [ ] Pick a **fully-booked window** (one with no free units) → dropdown locks + `No units available for this date frame. Try adjusting your dates.`
- [ ] Pick the **same day** for check-in and check-out → inline alert `Check-out date must be at least 1 night after check-in.` and submit disabled.
- [ ] Type a phone with **letters / trailing spaces** → characters are stripped on type; a too-short/too-long value blocks submit with the canonical message.
- [ ] Type a valid phone (e.g. `+201111111111` or `01062327721`) + select an available unit + valid dates → lead is created and appears in the pipeline.

### 10.4 Data legibility & precision audit
- [ ] Dates serialize as pure `YYYY-MM-DD` in the network payloads; changing the local machine timezone does **not** shift the date values (no off-by-one across midnight).
- [ ] Validation error cards **clear instantly** once a field is corrected (form is `mode: "onChange"`).
- [ ] Any financial values on adjacent dashboard cards render with exactly two decimals (`.00`) — `formatCurrency` (verify only; no change expected).

---

## 11. Notes for the reviewer
- Confirm the catalog overlap predicate is **byte-for-byte** consistent with `UnitAvailabilityService` (half-open bookings; inclusive blocks; `HoldingStatuses` only) — the dropdown and the per-unit warning must never disagree.
- Confirm **no** new migration / index file was added, and `CrmLeadService.CreateAsync` was **not** given an availability gate.
- Confirm the phone regex landed in **all three** lead validators and in the lead-form zod schema, and that the onChange sanitizer was added to the lead form + both public auth forms.
- Confirm `useInternalUnitsList`'s new `enabled` option didn't break its other callers (they pass no second arg → default `true`).
