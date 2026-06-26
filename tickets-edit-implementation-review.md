# Tickets Edit: Implementation Review Handoff

## 1. Purpose

This document describes the implementation completed for `tickets-edit.md` and the later PRD booking-status alignment request. It is intended for another engineering agent to review the changes for correctness, regressions, incomplete acceptance criteria, and production readiness.

The implementation spans:

- ASP.NET Core API controllers and hosted services.
- Business-layer services and interfaces.
- Entity Framework entities, enum conversion, queries, and read models.
- PostgreSQL migrations and SQL views.
- Next.js admin, owner, client, and public portal components.
- React Query hooks, API services, route constants, and TypeScript types.

The working tree also contained pre-existing user changes. In particular, do not revert unrelated edits in:

- `rental-platform/components/ui/Combobox.tsx`
- `rental-platform/app/(owner)/owner/units/[unitId]/page.tsx`
- `tickets-edit.md`

## 2. Architectural Decision: Booking and CRM

The implementation kept `CrmLead` and `Booking` as separate entities instead of merging them.

The intended contract is:

1. Website/app booking creation creates a `Booking` at `BookingStatus.Prospecting`.
2. CRM leads use a matching early-stage status vocabulary.
3. A CRM lead must reach `LeadStatus.Booked` before conversion.
4. `CrmLeadService.ConvertToBookingAsync` creates the booking directly at `BookingStatus.Booked`.
5. Booking lifecycle transitions are then enforced by `BookingStatusTransitions`.

This decision should be reviewed against the PRD statement that CRM and bookings are the same pipeline. The implementation aligns vocabularies and conversion behavior, but it does not physically merge the tables or guarantee a one-to-one lead/booking record for every public request.

## 3. Booking Status State Machine

### Status values

`RentalPlatform.Shared/Enums/BookingStatus.cs` contains:

- `Prospecting`
- `Relevant`
- `NoAnswer`
- `NotRelevant`
- `Booked`
- `Confirmed`
- `CheckIn`
- `Completed`
- `Cancelled`
- `LeftEarly`

`RentalPlatform.Shared/Enums/LeadStatus.cs` uses the same vocabulary.

The PRD calls this a "7-stage + 4-exit" pipeline but explicitly lists six active stages and four exits. The implementation follows the explicit status list, resulting in ten statuses.

### Valid transitions

Defined in `RentalPlatform.Shared/Constants/BookingStatusTransitions.cs` and mirrored in `rental-platform/lib/constants/booking-statuses.ts`:

| From | Allowed targets |
|---|---|
| Prospecting | Relevant, NoAnswer, NotRelevant |
| Relevant | Booked, NoAnswer, NotRelevant |
| NoAnswer | Relevant, NotRelevant |
| Booked | Confirmed, NotRelevant |
| Confirmed | CheckIn, Cancelled |
| CheckIn | Completed, LeftEarly |
| NotRelevant | None |
| Completed | None |
| Cancelled | None |
| LeftEarly | None |

Holding statuses used by availability and overlap checks are:

- `Booked`
- `Confirmed`
- `CheckIn`

### Storage and API representation

- EF stores enum values through the existing lowercase string converters in `BookingConfiguration.cs` and `CrmLeadConfiguration.cs`.
- Multi-word database values are lowercase without underscores, for example `noanswer`, `notrelevant`, `checkin`, and `leftearly`.
- Controller responses generally use `.ToString()`, so API responses expose PascalCase values such as `NoAnswer` and `CheckIn`.
- Frontend constants use PascalCase values.

Review the mixed database/API naming convention carefully. The implementation is internally consistent with the existing EF converter, but it does not store the PRD's snake_case strings literally.

## 4. Ticket 1: Units Module and Public Availability

### Implemented backend behavior

Files:

- `RentalPlatform.Business/Interfaces/IUnitService.cs`
- `RentalPlatform.Business/Services/UnitService.cs`
- `RentalPlatform.API/Controllers/UnitsController.cs`
- `RentalPlatform.API/DTOs/Responses/Units/UnitListItemResponse.cs`
- `RentalPlatform.API/DTOs/Responses/Units/UnitDetailsResponse.cs`

Changes:

- Added `GetInternalCatalogAsync` with paging and filters for owner, project, unit type, active state, and free-text search.
- Internal unit queries include `Project`, `Owner`, and `UnitImages` where required.
- Unit list/detail DTOs now expose `OwnerName` and `ProjectName`.
- Missing relationships map to `[Unassigned Owner]` and `[Unassigned Project]` instead of throwing.
- Existing public unit queries continue to use soft-delete filtering from the repository/query layer.

### Implemented frontend behavior

Files:

- `rental-platform/app/admin/units/page.tsx`
- `rental-platform/components/admin/units/UnitFilters.tsx`
- `rental-platform/components/admin/units/UnitTable.tsx`
- `rental-platform/lib/types/unit.types.ts`
- `rental-platform/components/ui/DateRangePicker.tsx`
- `rental-platform/components/public/unit/UnitBookingPanel.tsx`

Changes:

- Unit table displays project and owner names.
- Edit action navigates to `/admin/units/{id}/edit`.
- Search, project, type, and status filters are functional and URL-backed.
- Changing a filter resets pagination to page one.
- Public booking panel preloads an availability window from today through 180 days ahead.
- Blocked dates are passed to `DateRangePicker` and disabled before submission.

### API contract

`GET /api/internal/units`

Supported query parameters include:

- `page`
- `pageSize`
- `includeInactive`
- `ownerId`
- `projectId`
- `unitType`
- `isActive`
- `search`

Existing availability endpoint used by the public calendar:

`POST /api/units/{unitId}/availability/operational-check`

### Reviewer focus

- Confirm the 180-day preload does not create excessive requests or stale availability behavior.
- Test a race where a block is added after preload but before booking submission; backend validation must remain authoritative.
- Verify the edit route loads the selected unit and does not only navigate correctly.
- Confirm currency formatting requirements across all unit surfaces, not only the modified table.
- Confirm whether every public reservation must also create a `crm_leads` row. Current behavior creates a prospecting booking; it does not necessarily create both records.

## 5. Ticket 2: CRM Pipeline and Availability Guards

### Implemented backend behavior

Files:

- `RentalPlatform.Business/Services/CrmLeadService.cs`
- `RentalPlatform.Shared/Enums/LeadStatus.cs`
- `RentalPlatform.API/Controllers/CrmLeadsController.cs`
- `RentalPlatform.API/Controllers/ClientBookingsController.cs`

Changes:

- New CRM leads start at `Prospecting`.
- CRM status transitions match the PRD transition table.
- Lead create/update validates desired dates against unit availability when a desired unit and dates are supplied.
- Lead-to-booking conversion requires `LeadStatus.Booked`.
- Conversion creates a booking at `BookingStatus.Booked`.
- Client booking aggregation maps lead statuses using the new vocabulary and filters terminal lead states.

### Implemented frontend behavior

Files:

- `rental-platform/lib/constants/booking-statuses.ts`
- `rental-platform/lib/utils/status.ts`
- `rental-platform/lib/hooks/useCrm.ts`
- `rental-platform/components/admin/crm/CreateLeadForm.tsx`
- `rental-platform/components/admin/crm/LeadCard.tsx`
- `rental-platform/components/admin/crm/LeadDetailHeader.tsx`
- `rental-platform/components/admin/crm/LeadStatusTransition.tsx`
- `rental-platform/components/admin/crm/StatusTransitionDialog.tsx`
- `rental-platform/components/admin/crm/ConvertToBookingPanel.tsx`

Changes:

- Board columns, labels, badges, closed states, and allowed transitions use the new statuses.
- Pipeline queries periodically refetch so status changes become visible without a full browser reload.
- Booked transitions explain that dates become soft-held.
- Conversion UI requires the lead to be in `Booked` status.

### Relevant endpoints

- `POST /api/crm/leads`
- `POST /api/internal/crm/leads`
- `GET /api/internal/crm/leads`
- `GET /api/internal/crm/leads/{id}`
- `PUT /api/internal/crm/leads/{id}`
- `PATCH /api/internal/crm/leads/{id}/status`
- `POST /api/internal/crm/leads/{id}/convert-to-booking`

### Reviewer focus

- The original ticket requested live phone lookup and inline temporary-password generation during conversion. Review `ConvertToBookingPanel.tsx` closely: the broader password-management requirement was addressed with an admin client-password reset tool, but conversion-specific password generation may still be incomplete.
- Availability checks occur in business logic, but review whether the form provides immediate on-change conflict feedback for every unit/date edit.
- Verify simultaneous conversions are protected by final backend overlap validation and not only frontend checks.
- Review whether polling frequency and query invalidation can cause unnecessary board traffic.
- Confirm `LeadStatus.Booked -> Confirmed` is useful while the lead remains separate from a converted booking. There is potential for two lifecycle records to drift after conversion.

## 6. Ticket 3: Booking Lifecycle, Quick Booking, Invoices, and Automation

### Booking list and detail

Files:

- `RentalPlatform.Business/Interfaces/IBookingService.cs`
- `RentalPlatform.Business/Services/BookingService.cs`
- `RentalPlatform.API/Controllers/BookingsController.cs`
- `RentalPlatform.API/DTOs/Responses/Bookings/BookingResponses.cs`
- `rental-platform/components/admin/bookings/BookingFilters.tsx`
- `rental-platform/components/admin/bookings/BookingTable.tsx`
- `rental-platform/components/admin/bookings/BookingHeader.tsx`

Changes:

- Booking list supports `checkInFrom` and `checkInTo` as `DateOnly` filters.
- Booking list/detail includes assigned admin data.
- Responses expose `AssignedAdminUserName` and `AssignedAdminUserRole`.
- Table displays staff name and role instead of a UUID.
- Project display uses `ProjectName` rather than raw `ProjectId` where available.
- New bookings default to `BookingStatus.Prospecting`.

### Quick booking

Files:

- `RentalPlatform.API/Controllers/BookingsController.cs`
- `rental-platform/components/admin/bookings/QuickBookingModal.tsx`
- `rental-platform/app/(admin)/bookings/page.tsx`
- `rental-platform/lib/api/services/bookings.service.ts`
- `rental-platform/lib/hooks/useBookings.ts`

Endpoint:

`POST /api/internal/bookings/quick`

Authorization:

`SalesOrSuperAdmin`

Payload:

```json
{
  "clientId": "uuid",
  "unitId": "uuid",
  "checkInDate": "2026-07-01",
  "checkOutDate": "2026-07-05",
  "guestCount": 4,
  "source": "admin",
  "assignedAdminUserId": "uuid-or-null",
  "internalNotes": "optional"
}
```

The endpoint bypasses CRM lead creation and creates a normal prospecting booking.

### Deposit-gated confirmation

Files:

- `RentalPlatform.Business/Services/BookingLifecycleService.cs`
- `rental-platform/components/admin/bookings/BookingLifecycleActions.tsx`
- `rental-platform/components/admin/bookings/RecordPaymentModal.tsx`
- `rental-platform/app/(admin)/bookings/[bookingId]/page.tsx`

Changes:

- Backend confirmation fails if no paid payment exists.
- Frontend opens the payment form before the confirmation dialog when paid amount is zero.
- Payment capture can create and immediately mark a payment as paid.
- The final backend rule prevents bypassing the UI reminder.

### Invoice generation and reissue

Files:

- `RentalPlatform.Business/Interfaces/IInvoiceService.cs`
- `RentalPlatform.Business/Services/InvoiceService.cs`
- `RentalPlatform.API/DTOs/Requests/Invoices/InvoiceRequests.cs`
- `RentalPlatform.API/Validators/InvoiceValidators.cs`
- `rental-platform/components/admin/bookings/BookingInvoice.tsx`

Changes:

- Draft and reissue invoice numbers are optional.
- The server generates `INV-yyyyMMdd-####` values and checks uniqueness.
- The frontend no longer generates random invoice numbers.

Relevant endpoints:

- `POST /api/internal/invoices/drafts`
- `POST /api/internal/invoices/{id}/reissue`

Review whether existing invoice file/cloud-storage behavior actually replaces the prior asset. The implemented fix primarily addresses number generation and duplicate-number failures.

### Automatic completion job

Files:

- `RentalPlatform.API/Services/AutoCompleteBookingsJob.cs`
- `RentalPlatform.API/Program.cs`
- `RentalPlatform.Business/Models/NotificationTemplateRegistry.cs`

Behavior:

- Registered as an ASP.NET hosted background service.
- Runs daily at 02:00 UTC.
- Finds `CheckIn` bookings where `CheckOutDate <= UTC yesterday`.
- Transitions them to `Completed`.
- Writes `BookingStatusHistory` with no admin actor.
- Sends in-app notifications to active Finance, SuperAdmin, and assigned-admin recipients when a balance remains.
- Uses template code `BOOKING_COMPLETED_WITH_BALANCE`.

### Reviewer focus

- `DateOnly` checkout does not preserve a checkout timestamp. The job's `<= yesterday` rule approximates "24 hours after checkout" and should be confirmed with product.
- Review behavior across Cairo local time versus UTC execution at 02:00.
- Confirm multiple active invoices cannot cause an ambiguous outstanding-balance basis.
- Confirm payment sum behavior is correct when payments exist against superseded invoices.
- Check hosted-job concurrency when multiple API replicas run; there is no distributed job lock.
- Confirm quick-booking double-click protection at both UI mutation state and backend idempotency levels. No idempotency key was added.

## 7. Ticket 4: Finance, Analytics, Payments, and Payouts

### Payments search and client hydration

Files:

- `RentalPlatform.Business/Interfaces/IPaymentService.cs`
- `RentalPlatform.Business/Services/PaymentService.cs`
- `RentalPlatform.API/Controllers/PaymentsController.cs`
- `RentalPlatform.API/DTOs/Responses/Payments/PaymentResponse.cs`
- `rental-platform/app/(admin)/finance/payments/page.tsx`
- `rental-platform/components/admin/finance/PaymentsTable.tsx`
- `rental-platform/lib/types/finance.types.ts`

Changes:

- Payment queries include `Booking.Client`.
- Search covers booking ID, invoice ID, reference number, client name, and client phone.
- Payment responses expose `ClientName` and `ClientPhone`.
- Payments ledger has a general search field and a client column.
- Existing mark-paid, mark-failed, and cancel actions remain wired.

Endpoint:

`GET /api/internal/payments?search=...&paymentStatus=...&bookingId=...&invoiceId=...`

### Gross profit analytics

File:

- `rental-platform/app/(admin)/analytics/page.tsx`

Behavior:

- Adds a Gross Profit metric card.
- Current formula is `financeSummary.totalInvoicedAmount * 0.20`.

Review whether gross profit must use total invoiced revenue, paid revenue, or recognized completed-booking revenue. The original ticket says total revenue, while the implementation uses invoiced amount.

### Payout eligibility and status consistency

Files:

- `rental-platform/components/admin/finance/RecordPayoutModal.tsx`
- `rental-platform/components/admin/finance/PayoutsTable.tsx`
- `rental-platform/components/admin/owners/OwnerPayoutsTab.tsx`
- `rental-platform/lib/constants/payout-statuses.ts`
- `rental-platform/lib/types/finance.types.ts`

Changes:

- Payout status values are normalized to lowercase in frontend types and table logic.
- Eligible booking lookup combines Confirmed and Completed bookings.
- Empty owner cases continue to render an empty state.

### Reviewer focus

- Search normalization should be tested with `+20`, spaces, dashes, and parentheses. The query lowercases and compares values, but full canonical phone normalization should be verified.
- Review whether `Confirmed` bookings should be payout-eligible before stay completion.
- Verify payout amount calculation is unchanged and remains owner/commission correct.
- Test row-action permissions using Finance, Sales, Tech, and SuperAdmin accounts.

## 8. Ticket 5: Client Identity, Owner Auth, Date Blocks, and Owner Finance

### Client search, status, total spent, and password reset

Files:

- `RentalPlatform.Business/Interfaces/IClientService.cs`
- `RentalPlatform.Business/Services/ClientService.cs`
- `RentalPlatform.API/Controllers/ClientsController.cs`
- `RentalPlatform.API/DTOs/Requests/Clients/ResetClientPasswordRequest.cs`
- `RentalPlatform.API/Validators/ClientRequestValidators.cs`
- `RentalPlatform.API/Validators/ClientRegisterRequestValidator.cs`
- `RentalPlatform.API/Validators/UpdateClientProfileRequestValidator.cs`
- `rental-platform/components/admin/clients/ClientDetailHeader.tsx`
- `rental-platform/components/admin/clients/ClientPasswordResetDialog.tsx`
- `rental-platform/components/admin/clients/ClientBookingHistory.tsx`
- `rental-platform/lib/api/services/clients.service.ts`
- `rental-platform/lib/hooks/useClients.ts`

Changes:

- Client list search supports name or phone through `GET /api/clients?search=...`.
- Existing status endpoint is exposed in the detail header through Deactivate/Reactivate controls.
- Total spent uses safe numeric fallbacks and includes Confirmed, CheckIn, and Completed bookings.
- Added admin password reset endpoint and modal.
- Passwords require at least eight characters and are hashed with BCrypt cost 12.
- Client timestamps are updated on profile, status, and password changes.
- Phone validation uses `^\d{10,15}$`.

Endpoints:

- `GET /api/clients?search=...&includeInactive=...`
- `PATCH /api/clients/{id}/status`
- `PATCH /api/clients/{id}/password`

Password payload:

```json
{
  "newPassword": "at-least-eight-characters"
}
```

Status/password authorization is `SalesOrSuperAdmin`.

### Owner auth hydration

Files:

- `rental-platform/app/(owner)/layout.tsx`
- `rental-platform/lib/hooks/useAuth.ts`

Changes:

- Owner login stores role and server-issued permissions.
- Owner layout waits for Zustand persisted-state hydration before redirecting.
- On cold refresh, the layout attempts refresh-token rotation before authenticated queries run.
- Persist API access is deferred to `useEffect`; this prevents SSR/prerender failures.

The SSR fix was discovered during QA: calling `useAuthStore.persist.hasHydrated()` during server render caused owner routes to return a Next `not-found`/500 document and caused `next build` to fail.

### Owner date blocking

Files:

- `RentalPlatform.Business/Interfaces/IDateBlockService.cs`
- `RentalPlatform.Business/Services/DateBlockService.cs`
- `RentalPlatform.API/Controllers/DateBlocksController.cs`
- `rental-platform/components/owner/units/OwnerAvailabilityCalendar.tsx`
- `rental-platform/lib/api/services/owner-portal.service.ts`
- `rental-platform/lib/hooks/useOwnerPortal.ts`

Endpoint:

`POST /api/owner/units/{unitId}/date-blocks`

Authorization:

`OwnerOnly`

Payload:

```json
{
  "startDate": "2026-07-01",
  "endDate": "2026-07-03",
  "reason": "OwnerUse",
  "notes": "Optional"
}
```

Behavior:

- Verifies the unit belongs to the authenticated owner.
- Rejects overlaps with Booked, Confirmed, or CheckIn bookings.
- Invalidates owner availability queries after success.
- Owner UI supports OwnerUse, Maintenance, and Other reasons.

### Owner finance display names

Files:

- `RentalPlatform.Data/ReadModels/OwnerPortalFinanceOverview.cs`
- `RentalPlatform.Data/Configurations/OwnerPortalFinanceOverviewConfiguration.cs`
- `RentalPlatform.API/DTOs/Responses/OwnerPortal/OwnerPortalResponses.cs`
- `RentalPlatform.API/Controllers/OwnerPortalFinanceController.cs`
- `rental-platform/components/owner/finance/OwnerFinanceTable.tsx`
- `rental-platform/lib/types/owner-portal.types.ts`

Changes:

- Owner finance read model now exposes `UnitName` and `ClientName`.
- Owner transaction table displays unit/client names.
- Booking ID remains a shortened booking reference because the domain does not define a booking name.

### Reviewer focus

- Seeded and existing phone values include a leading `+`, while new client validation accepts digits only. Confirm the desired canonical format before release.
- Confirm password-reset audit requirements. The endpoint updates the hash and timestamp but does not add a dedicated security audit event or force session revocation.
- Verify owner refresh cookies work with production domain, SameSite, Secure, path, and reverse-proxy settings.
- Test owner block overlap at date boundaries and under concurrent booking creation.
- Confirm owner finance SQL view inner joins do not hide historical rows with missing/soft-deleted unit or client relations.

## 9. Database Migrations

### `0048_align_crm_lead_pipeline.sql`

Purpose:

- Migrates old CRM statuses to the new pipeline.
- Replaces the CRM lead status check constraint.

Mapping:

| Old | New stored value |
|---|---|
| new | prospecting |
| contacted | relevant |
| qualified | booked |
| converted | booked |
| lost | notrelevant |

Files:

- `db/migrations/0048_align_crm_lead_pipeline.sql`
- `db/migrations/0048_align_crm_lead_pipeline_rollback.sql`

### `0049_owner_portal_finance_names.sql`

Purpose:

- Recreates `owner_portal_finance_overview` with `unit_name` and `client_name`.

Files:

- `db/migrations/0049_owner_portal_finance_names.sql`
- `db/migrations/0049_owner_portal_finance_names_rollback.sql`

The migration uses `DROP VIEW IF EXISTS` followed by `CREATE VIEW`. This was necessary because PostgreSQL cannot insert new columns into the middle of a view using `CREATE OR REPLACE VIEW`.

`db/init.sql` runs both migrations for fresh environments.

### Local migration state used for QA

- `0048` was applied to the local Docker PostgreSQL database and updated four existing CRM rows.
- `0049` was applied and the view was verified to expose 15 columns, including `unit_name` and `client_name`.

Reviewer should test rollback scripts in a disposable database and inspect dependencies on `owner_portal_finance_overview` before production deployment.

## 10. Cross-Module Side Effects

| Trigger | Side effect |
|---|---|
| Create website/admin booking | Starts at Prospecting unless an explicit initial status is supplied |
| Convert Booked CRM lead | Creates a Booked booking |
| Move booking to Booked | Dates become part of holding-status availability checks |
| Move Booked to NotRelevant | Releases the soft hold because NotRelevant is not a holding status |
| Confirm booking | Requires at least one paid payment and generates an invoice draft when needed |
| Create/update date block | Rejects overlaps with Booked, Confirmed, or CheckIn bookings |
| Owner creates date block | Verifies unit ownership, writes date block, invalidates owner availability UI |
| Auto-complete past-due CheckIn booking | Marks Completed, writes history, optionally notifies admins of outstanding balance |
| Reset client password | Rehashes password and updates client timestamp |
| Reissue invoice without number | Generates a unique server-side invoice number |

## 11. Authorization Review Matrix

| Operation | Current policy |
|---|---|
| Read internal bookings | InternalAdminRead |
| Create/update/quick booking | SalesOrSuperAdmin |
| Booking lifecycle transitions | Internal admin policies in `BookingLifecycleController` |
| Read internal units | InternalAdminRead |
| Create/update unit status | Existing unit-management policies |
| Client status/password reset | SalesOrSuperAdmin |
| Read/manage payments | Existing finance/internal policies in `PaymentsController` |
| Owner date-block creation | OwnerOnly |
| CRM internal mutation | Existing CRM policies in `CrmLeadsController` |

Reviewer should specifically confirm whether Sales should be allowed to reset client passwords. A stricter SuperAdmin-only policy may be more appropriate.

## 12. Verification Already Completed

### Static/build verification

Passed:

```text
dotnet build RentalPlatform.API\RentalPlatform.API.csproj
cd rental-platform; npm run type-check
cd rental-platform; npm run build
```

Results:

- Backend build: 0 errors, 0 warnings.
- TypeScript type-check: passed.
- Next production build: passed after fixing owner-layout SSR hydration.
- Existing non-blocking warning remains in `rental-platform/app/page.tsx` for use of `<img>` instead of `next/image`.

### API checks

Verified against rebuilt Docker API at `http://localhost:5001`:

- Swagger returns HTTP 200.
- SuperAdmin and Sales login succeed.
- Client search returns the expected seeded client.
- Internal unit search returns filtered results.
- Owner units endpoint returns HTTP 200, including a valid empty-list response for an owner with no units.

### Browser smoke checks

The in-app browser handle was unavailable in this session, so local Playwright Chromium was used as the browser fallback.

Admin smoke passed:

- Admin login.
- Client search by name.
- Client detail navigation.
- Reset-password modal opens.
- Deactivate/Reactivate control is visible.
- Unit filters render and update URL state.
- Project and Owner columns render.
- Quick Booking modal opens with expected fields.
- Payments search and Client column render.

Owner smoke passed:

- Owner login.
- Owner units list and unit detail navigation.
- Owner availability form renders.
- Block From, Block To, Reason, and Block Dates controls render.
- Owner finance page loads.
- Final owner navigation pass produced no 4xx/5xx responses.

Forms that mutate production-like records were opened and inspected but not submitted during browser smoke testing.

## 13. Highest-Priority Review Risks

1. **CRM/Booking identity model**: Separate entities can drift after conversion; confirm this satisfies the PRD.
2. **Phone validation mismatch**: Digits-only validation conflicts with seeded `+20...` phone values and UI examples.
3. **Status storage format**: Database values use concatenated lowercase names rather than PRD snake_case.
4. **Auto-complete timing**: DateOnly plus UTC-yesterday is an approximation of exactly 24 hours after checkout.
5. **Background job duplication**: Multiple API replicas could process the same sweep without a distributed lock.
6. **Gross profit source**: Uses invoiced amount rather than necessarily paid or recognized revenue.
7. **Password-reset security**: No forced refresh-token/session revocation or dedicated password-reset audit entry.
8. **Conversion password flow**: Inline new-client password generation during CRM conversion may remain incomplete.
9. **Invoice reissue scope**: Unique number generation was fixed; verify actual document/file replacement and client-log side effects.
10. **Idempotency/concurrency**: Quick booking and CRM conversion have validation but no request idempotency key.
11. **Owner finance view joins**: Inner joins to units/clients may hide damaged or historical relational records.
12. **Existing data migration**: Booking rows with legacy statuses should be audited separately; migration 0048 changes CRM leads only.

## 14. Suggested Reviewer Sequence

1. Review enums, EF converters, SQL constraints, and frontend constants together.
2. Review booking and CRM transition enforcement, including every lifecycle controller endpoint.
3. Review overlap checks in booking creation, CRM lead conversion, date blocks, and availability service.
4. Review confirmation/payment/invoice transaction boundaries and failure rollback behavior.
5. Review auto-complete job timing, retries, multi-replica behavior, and notifications.
6. Review client password reset authorization, hashing, auditing, and session invalidation.
7. Review owner auth refresh/hydration under hard reload and expired refresh cookies.
8. Review owner finance migration forward/rollback behavior in a disposable DB.
9. Run focused API integration tests for filters, transitions, conflicts, and permission failures.
10. Run browser smoke with mutating test records, then clean up those records.

## 15. Recommended Additional Tests

- Unit tests for every valid and invalid booking transition.
- Integration test proving CRM conversion creates a Booked booking and rejects a second overlapping conversion.
- Integration test proving Confirmed cannot be entered without a paid payment.
- Integration test for invoice-number uniqueness under parallel draft creation.
- Hosted-job test for checkout cutoff around UTC/Cairo midnight.
- Integration test for owner block ownership and overlap rejection.
- Security test proving unauthorized roles cannot reset passwords.
- Auth test covering owner hard refresh with valid, expired, and missing refresh cookies.
- SQL migration/rollback test for 0048 and 0049.
- Browser test that submits Quick Booking once and verifies duplicate-click prevention.
- Browser test that creates an owner block and verifies the public calendar disables those dates.
- Browser test for client phone search with `+20`, spaces, dashes, and digits-only formats.

## 16. Reviewer Completion Criteria

The review should not be considered complete until the reviewer can answer:

- Are all status values and transitions consistent across DB, backend, DTOs, and frontend?
- Is there exactly one authoritative lifecycle record after CRM conversion?
- Can any race create overlapping holding bookings or date blocks?
- Can a booking be confirmed without a truly settled deposit?
- Can automatic completion run twice without harmful side effects?
- Are password resets sufficiently restricted, audited, and session-safe?
- Do owner refresh and finance views work in production-like cookie and database conditions?
- Are migrations safe for existing data and reversible?
- Do all five ticket acceptance criteria pass with mutating end-to-end tests?
