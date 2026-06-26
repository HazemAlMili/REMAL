# REVIEW-FINDINGS — Kaza Booking, Phase 1 Release-Gate Audit

> **Status:** ⛔ GATE HOLD — 1 Critical + 5 High must clear before merge.
> **Type:** Read-only static audit (no files modified, no database touched) of the working-tree changeset described in `tickets-edit-implementation-review.md`.
> **Method:** Source read line-by-line + 10 parallel domain auditors; every Critical/High was personally re-verified against the code.
> **Audience:** The implementing agent — fix the items below, then run the **Re-assessment Checklist** (§9) and report PASS/FAIL per item.

---

## 0. Ground rules for the implementing agent

1. **No database schema changes — at all.** Do not run migrations, create/alter tables, columns, views, or constraints, emit any DDL, or touch the live database. Every fix is **application-level only**. The only Postgres features allowed are *runtime* primitives that add no schema: **advisory locks** (`pg_advisory_xact_lock`) and the always-present system column **`xmin`** as an EF concurrency token (model config only — emits no DDL). Where a finding cannot be fully closed without schema, apply the partial app-level fix and **document the residual risk** (see §8) rather than changing the schema.
2. **Do not revert unrelated pre-existing edits** in `rental-platform/components/ui/Combobox.tsx`, `rental-platform/app/(owner)/owner/units/[unitId]/page.tsx`, `tickets-edit.md`.
3. **No mock/hardcoded data.** Every counter/grid/dropdown/history must read from a live endpoint. Two hardcoded KPI numbers are flagged below (F12, F13) — wire them to real data or remove.
4. Backend stack: **.NET 10**, EF Core, Npgsql, FluentValidation, JWT. Frontend: **Next.js (App Router)**, React Query, Zustand, axios, Tailwind.
5. Backend runs in Docker as the `kaza-api` container on `:5001`. Rebuild the image to apply backend changes (`docker compose build api && docker compose up -d api`), not `dotnet run`.
6. After each fix, leave the file's surrounding style/idioms intact and reference findings by their ID (F1…F20) in commit messages.

---

## 1. What is solid (do NOT regress these)

These were verified correct. Any fix must preserve them.

| Category | Verdict | Evidence |
|---|---|---|
| **Owner multi-tenant isolation** | ✅ Airtight | `ownerId` always from JWT `NameIdentifier`; every owner query filters `OwnerId == ownerId`; path `unitId`/`bookingId` conjoined with token owner (`OwnerPortalUnitService.cs:53`, `OwnerPortalBookingService.cs:60`); date-block re-check `DateBlockService.cs:80-84`. Caller-supplied `ownerId` only on admin endpoints. |
| **Deposit-gated confirmation** | ✅ Server-enforced | `BookingLifecycleService.cs:146-152` throws `ConflictException` if `paidAmount <= 0`; reached on every confirm path. UI gate is cosmetic on top. |
| **Owner finance view soft-delete safety** | ✅ Not a bug (Sector 11 fear unfounded) | `units`/`clients` have `deleted_at`; `bookings.unit_id`/`client_id` are `NOT NULL` FK `ON DELETE RESTRICT` (`0016_create_bookings.sql:18-19`, `0010_create_units.sql:78`). A referenced unit/client cannot be hard-deleted; soft-delete keeps the `id`, so the view's INNER JOINs never drop finance rows. |
| **Status vocabulary & transitions** | ✅ Consistent | Both enums have the same 10 statuses; EF stores lowercase-no-underscore; API exposes PascalCase via `.ToString()`; frontend parses case-insensitively (`lib/utils/status.ts`); backend ↔ frontend transition tables are edge-for-edge identical. |
| **ClientBookings query coverage** | ✅ Includes Confirmed + CheckIn | `ClientBookingsController.cs:47-52` applies a status filter only when supplied; otherwise returns all states. |
| **Owner token hydration / SSR** | ✅ Deferred to `useEffect`, refresh-rotated on cold load | `app/(owner)/layout.tsx:26-41`. |
| **Migrations forward-safety** | ✅ 0048 data UPDATE before ADD CONSTRAINT; 0049 DROP+CREATE view | new constraint value-set exactly matches app vocabulary. |
| **No mock record data** | ✅ Essentially met | All grids/history fetch live via React Query; `demo/` is a separate app; `app/admin/*` are harmless re-exports of `app/(admin)/*`. |
| **Invoice file orphaning** | ✅ Impossible | No file/PDF asset exists on `Invoice`; reissue is pure DB supersede-and-recreate, transactional (`InvoiceService.cs:320-428`). |

---

## 2. 🔴 CRITICAL

### F1 — CRM conversion never finalizes the lead → drift + duplicate bookings
- **Files:** `RentalPlatform.Business/Services/CrmLeadService.cs:225-263`; consequence visible in `RentalPlatform.API/Controllers/ClientBookingsController.cs:47-76`.
- **Evidence:**
  ```csharp
  // CrmLeadService.cs
  225  if (lead.LeadStatus != LeadStatus.Booked) throw new ConflictException(...);   // precondition
  237  var booking = await _bookingService.CreateAsync(... initialStatus: BookingStatus.Booked ...);
  249  lead.LeadStatus = LeadStatus.Booked;   // ← NO-OP: lead was already required to be Booked at line 225
  // no ConvertedBookingId written; lead never moved to a terminal/converted state
  ```
- **Why it's Critical (deterministic, not a race):**
  1. The lead stays `Booked` and remains independently transitionable to `Confirmed` (per the lead transition table) → **two drifting lifecycle records**. Violates the acceptance criterion "exactly one authoritative lifecycle record after conversion."
  2. The convert endpoint has **no idempotency** and the still-`Booked` lead re-passes the guard at line 225, so a retry / second tab / second admin / network retry creates **duplicate bookings**. `BookingService.EnsureNoConfirmedOverlap` ignores `Booked`, so it does **not** block them.
  3. `ClientBookingsController` then surfaces **both** the lingering lead and the booking → the client sees the same stay **twice**.
- **Fix (no schema):**
  - Inside a **single transaction** (`_unitOfWork.BeginTransactionAsync`), create the booking, then move the lead to a **terminal `LeadStatus`** (one of the existing 10 vocab values — there is no dedicated `Converted` value, so confirm the choice with product). This one change solves all three sub-issues at once: the existing `lead.LeadStatus != Booked` guard (line 225) now makes a 2nd conversion throw (idempotency), a terminal lead can no longer drift to `Confirmed`, and terminal leads are already excluded from `ClientBookingsController`/pipeline.
  - Verify `ClientBookingsController` excludes the now-terminal lead so no duplicate row appears.
  - *(No `ConvertedBookingId` column — that would be a schema change. The terminal-status approach is the no-schema equivalent; its only cost is repurposing an existing status value.)*
- **Re-assess:** Convert a `Booked` lead; confirm (a) the lead is no longer transitionable, (b) a second `POST .../convert-to-booking` is rejected (no 2nd booking), (c) the client's booking list shows the stay once.

---

## 3. 🟠 HIGH

### F2 — Quick Booking: no idempotency + TOCTOU double-book
- **Files:** `RentalPlatform.API/Controllers/BookingsController.cs:109-126`; `RentalPlatform.Business/Services/BookingService.cs:143-151, 316-339`; `RentalPlatform.Data/Configurations/BookingConfiguration.cs` (no constraint); `rental-platform/components/admin/bookings/QuickBookingModal.tsx:80-101,229-235`.
- **Evidence:** `POST /api/internal/bookings/quick` accepts only `CreateBookingRequest` (no idempotency key/header). Overlap check is a non-atomic read-then-write; new bookings default to `Prospecting` (not a holding status), so two quick-creates never block each other; **no DB unique/exclusion constraint** on `(unit_id, dates)` and no enclosing transaction. UI disable relies solely on React Query `isPending` (defeated by two tabs / two operators / direct API).
- **Fix (no schema):**
  - Serialize per-unit with a Postgres **advisory lock** — `SELECT pg_advisory_xact_lock(hashtext(@unitId))` at the start of a transaction that wraps the overlap check + insert/confirm, so two operations on the same unit cannot interleave. No DDL.
  - App-level idempotency: before creating, look up a booking with the same `clientId + unitId + checkInDate + checkOutDate + status` created within the last N seconds; if found, return it instead of creating a duplicate.
  - *(A durable, cross-replica `Idempotency-Key` store and a `btree_gist` exclusion constraint would both be schema changes — out of scope. The advisory lock closes the TOCTOU race without schema; the recent-duplicate guard is best-effort. Document this residual.)*
- **Re-assess:** Two concurrent identical quick-booking requests → exactly one booking created (serialized by the per-unit advisory lock); an overlapping confirm is rejected.

### F3 — Auto-complete job is not multi-replica safe + can clobber edits
- **Files:** `RentalPlatform.API/Services/AutoCompleteBookingsJob.cs:58-112`; `RentalPlatform.API/Program.cs:242`; `RentalPlatform.Data/.../Repository.cs:52-55`.
- **Evidence:** `AddHostedService<AutoCompleteBookingsJob>()` runs on every replica. The sweep does `Query().Where(status==CheckIn).Where(CheckOutDate<=cutoff).ToList()` → mutate in memory → one `SaveChangesAsync`, with **no advisory lock / leader election / concurrency token**. Status write is not conditional (`UPDATE ... WHERE status='checkin'` is not used). `Repository.Update` marks the **whole entity** Modified, so a concurrent admin edit between read and save is overwritten (last-writer-wins). Notifications have no idempotency (`new Notification { Id = Guid.NewGuid() }` per run).
- **Fix (no schema):**
  - Guard the sweep with `SELECT pg_try_advisory_xact_lock(<const>)` at the start of a transaction; bail if not acquired so only one replica runs the sweep. **Or** convert the transition to `ExecuteUpdateAsync(...)` with a `WHERE booking_status='checkin'` predicate so it is atomic.
  - Add an `xmin` optimistic-concurrency token via `modelBuilder.Entity<Booking>().UseXminAsConcurrencyToken()` (Npgsql) — this maps the always-present system column, so it is **model config only, NO DDL/migration**. Alternatively, mark only the changed properties dirty instead of `Update(entity)` so a stale snapshot can't overwrite other columns.
  - Add a per-booking "already notified" guard (only notify when this run actually transitioned the row).
  - *(This is a complete no-schema fix — no residual risk.)*
- **Re-assess:** Simulate two replicas (or two invocations) → each booking transitions once, one status-history row, one notification set; concurrent admin edit to an unrelated column survives.

### F4 — Password reset has no audit trail and no session revocation
- **Files:** `RentalPlatform.Business/Services/ClientService.cs:140-157`; `RentalPlatform.API/Controllers/ClientsController.cs:87-96`; `RentalPlatform.API/Services/JwtTokenService.cs:40-55`; `RentalPlatform.API/Controllers/AuthController.cs:118-134`.
- **Evidence:** BCrypt cost 12 rehash ✅ and `UpdatedAt` set ✅, but **no audit/security-event row** is written and **no token revocation** occurs. Refresh tokens are stateless signed JWTs (no `jti`, no version/stamp, no DB entity, no denylist), so a stolen/old session keeps minting access tokens until expiry. Sector 7 explicitly requires both.
- **Fix (no schema):**
  - Write a structured security event via `ILogger` on reset (inject `ILogger<ClientService>`; log actor admin id, target client id, timestamp). This satisfies "log a security audit entry" without an audit table.
  - Session invalidation without a new column: embed the existing `clients.UpdatedAt` (already bumped on reset at line 151) as a claim in issued tokens, and on refresh (`AuthController.cs:118-134`) reject a token whose stamp predates the client's current `UpdatedAt`.
  - *(Caveat / residual: reusing `UpdatedAt` also logs the user out on any profile edit, not just password changes. If that side-effect is unacceptable, full per-credential revocation needs a dedicated stamp column — out of scope under the no-schema rule; document the residual gap and ship the `ILogger` audit + access-token-expiry mitigation only.)*
- **Re-assess:** After an admin resets a client's password, an access/refresh token issued before the reset is rejected; an audit row exists.

### F5 — Phone validation rejects the seeded `+20` format
- **Files:** `RentalPlatform.Business/Services/ClientService.cs:19`; `RentalPlatform.API/Validators/ClientRegisterRequestValidator.cs:13`; `ClientRequestValidators.cs:13`; `UpdateClientProfileRequestValidator.cs:13`. Seeds: `db/migrations/0047_seed_minimal_dev_login.sql:19` (`+201111111111`), `0046_seed_dev_users_units.sql`.
- **Evidence:** Regex `^\d{10,15}$` (digits only) in all four places; seeds store `+20…`. **Register and profile-update both reject** the `+`, so seeded clients cannot save their profile (breaks the Client Profile acceptance criterion). Login (exact string match) and admin search (naive `Contains`) tolerate `+` only incidentally.
- **Fix:** Accept an optional leading `+`: `^\+?\d{10,15}$` (or full E.164 `^\+?[1-9]\d{9,14}$`) consistently across the service regex + all 3 validators + the frontend client-side schema. Optionally canonicalize on write. Mirror the same rule on owner phone if applicable.
- **Re-assess:** A seeded client (`+201111111111`) edits and saves their profile; a new client registers with a `+`-prefixed number; admin search finds them with and without `+`.

### F6 — Gross-profit KPI is fabricated (hardcoded 20%)
- **File:** `rental-platform/app/(admin)/analytics/page.tsx:138` — `formatCurrency(financeSummary.totalInvoicedAmount * 0.2)`.
- **Evidence:** A financial figure shown to admins is a flat 20% of *invoiced* (not backend-computed, not paid/collected, not recognized-completed revenue). This is both a Sector 6 correctness issue and a "no hardcoded data" violation.
- **Fix:** Decide the basis with product (invoiced vs collected vs recognized completed-stay) and compute it **server-side** in the finance summary endpoint; bind the card to that field. If undefined, remove the card rather than show a magic number.
- **Re-assess:** The gross-profit value comes from an API field; changing data changes the number; no `* 0.2` literal remains in the page.

---

## 4. 🟡 MEDIUM

### F7 — Invoice number generation TOCTOU
- **File:** `RentalPlatform.Business/Services/InvoiceService.cs:431-449` (gen), `:315-318` (reissue dup-check).
- **Evidence:** `SELECT count/exists` → later `SaveChanges` is a race; the DB unique index (`InvoiceConfiguration.cs:27-28`) prevents bad data but a concurrent collision re-throws a raw `DbUpdateException` (unhandled 500), with no retry.
- **Fix:** Catch `DbUpdateException` (unique violation) around the insert and regenerate-and-retry (bounded loop). Optionally derive the sequence atomically (DB sequence per day).
- **Re-assess:** Two parallel draft/reissue creations both succeed with distinct numbers; no 500.

### F8 — Auto-complete timing is fragile / mislabeled
- **File:** `RentalPlatform.API/Services/AutoCompleteBookingsJob.cs:14,65,71,89`.
- **Evidence:** Correct *today* (02:00 UTC = 04:00 Cairo keeps UTC/Cairo dates aligned), but cutoff is derived from `UtcNow.Date` and the `DateOnly` "<= yesterday" rule approximates "24h after checkout" as 24–48h. The status-history note hardcodes "24 hours after checkout," which the comparison does not guarantee. Breaks if `RunAtUtcTime` is ever moved into 22:00–00:00 UTC.
- **Fix:** Compute the cutoff against Cairo local date explicitly (`TimeZoneInfo` "Africa/Cairo"); correct the note text; confirm the intended SLA with product.
- **Re-assess:** A booking checking out "today" completes on the intended Cairo day regardless of the configured UTC run hour.

### F9 — CRM conversion temp password never surfaced
- **Files:** `RentalPlatform.API/Controllers/ClientsController.cs:32` (mints `Guid.NewGuid().ToString("N")`); `rental-platform/components/admin/crm/ConvertToBookingPanel.tsx`.
- **Evidence:** Inline new-client creation is not password-blocked (good), but the generated temp password is never shown/copyable, so the new client cannot log in until a separate admin reset.
- **Fix:** Return the temp password (once) to the admin UI with a copy action, or auto-trigger the reset flow / send credentials. Confirm intended UX with product.
- **Re-assess:** After converting with a new client, the admin can obtain a working initial credential without a second manual step.

### F10 — `Sales` role can reset client passwords
- **File:** `RentalPlatform.API/Controllers/ClientsController.cs:88` (`[Authorize(Policy="SalesOrSuperAdmin")]`).
- **Fix:** Decide policy; if credential resets should be SuperAdmin-only, switch to the existing `SuperAdminOnly` policy.
- **Re-assess:** A Sales token is rejected (403) on `PATCH /api/clients/{id}/password` if the decision is SuperAdmin-only.

### F11 — `OwnerPayout.PayoutStatus` is not enum-backed
- **Files:** `OwnerPayoutConfiguration.cs:29-32` (no `HasConversion`); service uses raw lowercase literals; `rental-platform/lib/constants/payout-statuses.ts` defensively dual-cases keys.
- **Fix:** Apply the same enum-string converter pattern used for Booking/Lead (`HasConversion(v => v.ToString().ToLower(), v => Enum.Parse(..., true))`) for consistency, then simplify the frontend map. Low risk but removes a latent inconsistency.
- **Re-assess:** Payout status round-trips through the enum; frontend needs only one casing.

### F12 — Hardcoded `openLeadsCount = 0`
- **File:** `rental-platform/app/(admin)/dashboard/page.tsx:78` (comment admits it).
- **Fix:** Wire to the real source (`useLeadsPipeline` already exists and is used by the CRM page) or a dedicated count endpoint.
- **Re-assess:** The "Open leads" StatCard reflects real lead counts.

---

## 5. 🟢 LOW (cleanup / defensive)

| ID | Finding | File | Suggested action |
|---|---|---|---|
| F13 | Status-history endpoint returns lowercase while siblings return PascalCase (masked by case-insensitive render) | `BookingsController.cs:202-203` | Normalize via the same mapping as `/bookings`. |
| F14 | CRM pipeline grouping keys on raw `leadStatus` (latent silent-drop if casing drifts) | `rental-platform/lib/hooks/useCrm.ts:34` | Normalize the grouping key. |
| F15 | Finance view uses INNER JOIN (not a bug today; LEFT JOIN is more defensible for an audit read model) | `db/migrations/0049_owner_portal_finance_names.sql:29,31` | **Deferred** — changing the view is a schema change and it is not a bug today (FK RESTRICT protects it). No action under the no-schema rule. |
| F16 | 0048 rollback is data-lossy (`converted`→`booked`→`qualified`; new-only statuses collapse) | `db/migrations/0048_align_crm_lead_pipeline_rollback.sql` | Document as one-way; no code change. |
| F17 | Leftover `Console.WriteLine` debug lines | `ClientBookingsController.cs:57,187,230` | Remove. |
| F18 | Analytics summary cards omit `tabular-nums` (table cells have it) | `rental-platform/app/(admin)/analytics/page.tsx` (card spans) | Add `tabular-nums` for column alignment. |
| F19 | `init.sql` skips a `0046` entry (jumps 0045→0047) — pre-existing, outside changeset | `db/init.sql` | Verify intended; awareness only. |
| F20 | Duplicate route trees `app/admin/*` (re-exports) vs `app/(admin)/*` — note `app/admin/units/*` are the *real* unit pages | `rental-platform/app/...` | Awareness; not a collision (route group changes the URL). |

---

## 6. Acceptance-criteria scorecard (current state)

| Criterion | Status | Blocking finding |
|---|---|---|
| Cross-persona correspondence on reload | ⚠️ | F1 (duplicate client row) |
| Zero hardcoded data overrides | ⚠️ | F6, F12 |
| Secure client profile (read/update/password) | ❌ | F4, F5 |
| DB-view mapping integrity under soft-delete | ✅ | — |
| Error/constraint mapping consistency | ⚠️ | F7 |
| Multi-tenant isolation unchanged | ✅ | — |
| Deposit truly settled before confirm | ✅ | — |
| Migrations safe for existing data | ✅ (0048 rollback lossy, documented) | F16 |

---

## 7. Recommended fix order (smallest blast radius first)

1. **F1** — finalize the lead on conversion (move it to a terminal `LeadStatus`, transactional — no schema). Unblocks pipeline integrity, idempotency, and the duplicate client row at once.
2. **F5** — phone regex `^\+?\d{10,15}$` across service + 3 validators + frontend schema.
3. **F4** — `ILogger` security audit + reuse `clients.UpdatedAt` as a token stamp checked on refresh (no schema).
4. **F2** — per-unit advisory lock + app-level recent-duplicate guard on quick booking (no schema).
5. **F3** — advisory lock + `xmin` concurrency token (no DDL) + notification guard on the job.
6. **F6 / F12** — real gross-profit basis; wire open-leads count.
7. MEDIUM (F7–F11) then LOW (F13–F20) as cleanup.

---

## 8. No-schema constraint — strategy & residual risks

**Hard rule for this engagement: NO database schema changes.** No new migrations, no new tables/columns, no view/constraint/DDL changes, and no touching the live DB. Every fix is application-level. The only Postgres features used are *runtime* primitives that emit no schema:
- **Advisory locks** — `pg_advisory_xact_lock(key)` / `pg_try_advisory_xact_lock(key)` (transaction-scoped, no DDL).
- **`xmin`** — the system column present on every Postgres row, mapped as an EF concurrency token via `UseXminAsConcurrencyToken()` (model config only; adds no column).

| Finding | No-schema approach | Residual risk to document (do NOT fix with schema) |
|---|---|---|
| **F1** | Move the lead to a terminal `LeadStatus` on conversion, inside a transaction; the existing `LeadStatus != Booked` guard then blocks a 2nd conversion; terminal leads are already excluded from pipeline + `ClientBookingsController`. | No dedicated `Converted` value exists in the 10-status vocab — an existing terminal value must be repurposed (confirm with product). |
| **F2** | Per-unit advisory lock around check+create/confirm + a recent-duplicate guard (same client+unit+dates+status within N seconds → return existing). | No durable cross-replica idempotency-key store without a table; the recent-duplicate guard is best-effort, not a hard guarantee. |
| **F3** | `pg_try_advisory_xact_lock` so only one replica sweeps; `xmin` concurrency token (no DDL); per-booking notified guard. | None significant — complete no-schema fix. |
| **F4** | Structured security log via `ILogger` on reset; embed existing `clients.UpdatedAt` as a token claim and reject stale tokens on refresh. | Reusing `UpdatedAt` also invalidates sessions on profile edits; true per-credential revocation would need a stamp column (out of scope) — document the gap. |
| **F15** | Deferred — view change is a schema change and it is not a bug today (FK RESTRICT protects it). | Theoretical only, if FK delete-behavior ever changes. |

All other findings (**F5–F14, F16–F20**) are pure code/config and need no schema.

---

## 9. Re-assessment checklist (run after fixes; report PASS/FAIL + evidence)

**Critical / High**
- [ ] **F1** Converting a `Booked` lead leaves it non-transitionable AND a 2nd convert call creates no 2nd booking AND the client list shows the stay once.
- [ ] **F2** Two concurrent identical quick bookings → one record (serialized by the per-unit advisory lock); overlapping confirm rejected.
- [ ] **F3** Two job runs/replicas → each booking transitions once, one history row, one notification set; concurrent admin edit survives.
- [ ] **F4** Token issued before a password reset is rejected after it; audit row written.
- [ ] **F5** Seeded `+20…` client saves profile; `+`-prefixed registration succeeds; search works with/without `+`.
- [ ] **F6** Gross profit comes from an API field; no `* 0.2` literal remains.

**Medium**
- [ ] **F7** Parallel invoice creation → distinct numbers, no 500.
- [ ] **F8** Checkout-day booking completes on the intended Cairo day regardless of UTC run hour; note text corrected.
- [ ] **F9** Admin obtains a working initial credential after converting a new client.
- [ ] **F10** Password-reset policy matches the agreed role (Sales rejected if SuperAdmin-only).
- [ ] **F11** Payout status round-trips via the enum converter.
- [ ] **F12** Open-leads StatCard reflects real counts.

**Low**
- [ ] **F13–F20** addressed or explicitly deferred with rationale.

**Regression guard (must remain PASS)**
- [ ] Owner cannot read/modify another owner's data (try a foreign `unitId`/`bookingId` with an owner token → 404/empty).
- [ ] Booking cannot be confirmed with `paidAmount <= 0`.
- [ ] `dotnet build` clean; `cd rental-platform && npm run type-check && npm run build` pass.
- [ ] No new mock/hardcoded record data introduced.

---

## 10. Verification status of this audit

- All ✅ "solid" items and all 🔴/🟠 findings were verified by **direct source reads** (file:line quoted above), not inference alone.
- This was a **static** review: no tests were executed, no running API was called, the database was not touched. Runtime claims (e.g., concurrency races) are derived from the code paths cited and should be confirmed by the re-assessment tests in §9.
- Source-of-truth handoff this builds on: `tickets-edit-implementation-review.md`. Ticket: deep technical review / architectural handoff validation (Phase 1).
