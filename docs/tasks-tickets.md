```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WAVE QA REVIEW PROMPT
Wave: 4 — Finance + Owners + Clients
Tickets: FE-4-FIN-01..05, FE-4-OWN-01..06, FE-4-CLI-01..03, FE-4-ADM-01..02
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are a senior QA engineer reviewing Wave 4.

## MOCK DATA AUDIT — HARD GATE

```bash
grep -rn "mockOwner\\|fakeOwner\\|sampleOwner\\|mockClient\\|mockPayout" \\
  --include="*.ts" --include="*.tsx" .

grep -rn "commissionRate.*0\\.2\\b" \\
  --include="*.ts" --include="*.tsx" components/ lib/api/
# commissionRate as decimal (0.20) is WRONG — must be percentage (20.00)

grep -rn "'instapay'\\|'vodafonecash'\\|'cash'\\|'banktransfer'" \\
  --include="*.ts" --include="*.tsx" .
# Must be PascalCase: 'InstaPay', 'VodafoneCash', 'Cash', 'BankTransfer'

grep -rn "'super_admin'\\|'super admin'" --include="*.ts" --include="*.tsx" .
# Must be 'SuperAdmin'

grep -rn "'pending'\\|'scheduled'\\|'paid'" \\
  --include="*.ts" --include="*.tsx" lib/api/services/ components/admin/finance/
# Payout statuses must be PascalCase: 'Pending', 'Scheduled', 'Paid'

grep -rn "pagination\\.total[^C]" --include="*.ts" --include="*.tsx" .
# Must be pagination.totalCount — NOT pagination.total
```

## API CONTRACT VERIFICATION

### Finance:

- [ ]  `MarkOwnerPayoutPaidRequest` uses optional notes-only body
- [ ]  `paymentMethod` PascalCase: 'InstaPay', 'VodafoneCash', 'Cash', 'BankTransfer'
- [ ]  `PayoutStatus` PascalCase: 'Pending', 'Scheduled', 'Paid', 'Cancelled'
- [ ]  Finance reports use `dateFrom`/`dateTo` ISO date strings in query params (NOT startDate/endDate)
- [ ]  `conversionRate` does NOT exist in API — no conversion rate column in any report table
- [ ]  Payout lifecycle: Pending → Schedule → Mark Paid (not skipping schedule)
- [ ]  `SetOwnerPayoutScheduledRequest` sends optional notes only (NO scheduledDate field)
- [ ]  `CreateOwnerPayoutRequest` sends `bookingId`, `commissionRate`, `notes?` only (NO ownerId, NO amount, NO paymentMethod)

### Owners:

- [ ]  `commissionRate` stored as PERCENTAGE (20.00), displayed as %
- [ ]  Form submits `commissionRate` directly (no ÷100 conversion)
- [ ]  Edit form pre-fills directly from `owner.commissionRate` (no ×100 conversion)
- [ ]  `OwnerStatus` is LOWERCASE: 'active' | 'inactive' (not PascalCase)
- [ ]  `UpdateOwnerStatusRequest` sends `{ status: 'active' }` (lowercase string, NOT `{ isActive: boolean }`)
- [ ]  `OwnerPayoutSummaryResponse` has `totalPending`, `totalScheduled`, `totalPaid` (NOT totalEarnings, totalPaidOut, pendingAmount)

### Clients:

- [ ]  Client booking-history endpoint is a backend gap until documented (`clientId` filter NOT in API Reference Section 16)
- [ ]  Booking history row uses `booking.id` for navigation (NOT `booking.bookingId` — P10)
- [ ]  Booking history "Total" column uses `booking.finalAmount` (NOT `totalAmount` — P10)
- [ ]  Total Spent computed only from Confirmed + CheckIn + Completed bookings
- [ ]  `ClientListItemResponse` does NOT include `totalBookings` — P33
- [ ]  Client list filters only include `includeInactive`, `page`, `pageSize` (NO search param — P33)

### Admin Users:

- [ ]  Role change sends `{ role: 'Finance' }` (PascalCase)
- [ ]  Cannot deactivate own account (ID check implemented)
- [ ]  `ADMIN_ROLE_LABELS` used for display (SuperAdmin → "Super Admin")
- [ ]  `adminUsersService.getAll` returns paginated response (NOT flat array)

## PER-TICKET CHECKS

### FE-4-FIN-01 — Finance Types

- [ ]  `PayoutStatus`: Pending | Scheduled | Paid | Cancelled
- [ ]  `MarkOwnerPayoutPaidRequest` uses optional notes-only body
- [ ]  `FinanceAnalyticsDailySummaryResponse` uses `metricDate` (NOT `date`)
- [ ]  `FinanceAnalyticsDailySummaryResponse` uses `totalInvoicedAmount`, `totalPaidAmount`, `totalRemainingAmount`, `totalPendingPayoutAmount`, `totalScheduledPayoutAmount`, `totalPaidPayoutAmount` (NOT totalRevenue, depositsCollected, remainingCollected, refunds, numberOfConfirmedBookings)
- [ ]  `BookingAnalyticsDailySummaryResponse` uses `metricDate`, `bookingSource`, `bookingsCreatedCount`, `pendingBookingsCount`, `confirmedBookingsCount`, `cancelledBookingsCount`, `completedBookingsCount`, `totalFinalAmount`
- [ ]  `payoutsService.getByBooking` returns `Promise<OwnerPayoutResponse>` (single object, NOT array)

### FE-4-FIN-02 — Finance Overview

- [ ]  7 stat cards from `FinanceAnalyticsSummaryResponse`: totalBookingsWithInvoiceCount, totalInvoicedAmount, totalPaidAmount, totalRemainingAmount, totalPendingPayoutAmount, totalScheduledPayoutAmount, totalPaidPayoutAmount
- [ ]  Date range filter sends `dateFrom`/`dateTo` (NOT startDate/endDate)
- [ ]  `canViewFinance` gate

### FE-4-FIN-03 — Owner Payouts

- [ ]  Payouts loaded per owner (not global list)
- [ ]  "Mark Paid" dialog sends optional notes only (NO paymentDate, paymentMethod, proofImageUrl — P19)
- [ ]  Schedule dialog sends optional notes only (NO scheduledDate — P19)
- [ ]  Cancel uses optional notes (NO required reason)
- [ ]  Create payout form has: bookingId, commissionRate, notes (NO ownerId, amount, paymentMethod, proofImageUrl — P18)
- [ ]  `OwnerPayoutResponse` has `grossBookingAmount`, `commissionRate`, `commissionAmount`, `payoutAmount` (NO amount, paymentMethod, proofImageUrl — P17)

### FE-4-FIN-04 — Payments List

- [ ]  Only documented payment filters sent: `paymentStatus`, `bookingId`, `invoiceId`, `page`, `pageSize`
- [ ]  Payment status filter VALUES sent as PascalCase ('Pending', 'Paid', 'Failed', 'Cancelled')
- [ ]  NO `type` column — PaymentType ('Deposit'/'Remaining'/'Refund') does NOT exist — P12
- [ ]  NO `clientName` or `recordedBy` columns — these do NOT exist in PaymentResponse — P12
- [ ]  `mark-paid` sends NO request body (empty POST) — P12
- [ ]  `mark-failed` sends `{ notes?: string }` only — P12
- [ ]  `cancel` sends `{ notes?: string }` only — P12
- [ ]  Booking ID in table links to booking detail

### FE-4-FIN-05 — Reports

- [ ]  Both finance and bookings daily endpoints called
- [ ]  Default range = current month
- [ ]  NO conversionRate column — this field does NOT exist in API response (P28)
- [ ]  Revenue table uses `metricDate` (NOT `date`), `bookingsWithInvoiceCount`, `totalInvoicedAmount`, `totalPaidAmount`, `totalRemainingAmount`, `totalPendingPayoutAmount`, `totalScheduledPayoutAmount`, `totalPaidPayoutAmount`
- [ ]  Bookings table uses `metricDate` (NOT `date`), `bookingSource`, `bookingsCreatedCount` (NOT totalLeads), `pendingBookingsCount` (NOT activeLeads), `confirmedBookingsCount`, `cancelledBookingsCount`, `completedBookingsCount`, `totalFinalAmount`

### FE-4-OWN-01 — Owner Types

- [ ]  `OwnerStatus` lowercase: 'active' | 'inactive'
- [ ]  `commissionRate` is percentage (0..100) in type definition (NOT decimal 0..1)
- [ ]  `OwnerListItemResponse` does NOT include `notes` or `updatedAt` (only in detail)
- [ ]  `OwnerPayoutSummaryResponse` has `totalPending`, `totalScheduled`, `totalPaid` (NOT totalEarnings, totalPaidOut, pendingAmount)

### FE-4-OWN-02 — Owners List

- [ ]  Commission shown as %: `Math.round(owner.commissionRate)%`
- [ ]  Only documented filters sent: `includeInactive`, `page`, `pageSize` (NO search, NO name filter)
- [ ]  Status toggle sends `{ status: 'inactive' }` (lowercase string, NOT `{ isActive: false }`)
- [ ]  `canManageOwners` gates action buttons

### FE-4-OWN-03 — Create Owner

- [ ]  `commissionRate` sent directly (no /100 conversion)
- [ ]  `email` = undefined (not "") when empty
- [ ]  `status` is required in create payload (lowercase 'active'|'inactive')

### FE-4-OWN-04 — Owner Detail

- [ ]  Commission shown as `%`
- [ ]  Payout summary loaded from separate endpoint (`GET /api/internal/owners/{id}/payout-summary`)
- [ ]  No undocumented embedded units list assumption
- [ ]  `OwnerDetailsResponse` includes `notes: string | null` and `updatedAt: string`

### FE-4-OWN-05 — Edit Owner

- [ ]  Pre-fills with `owner.commissionRate` directly (no ×100 conversion)
- [ ]  Sends `commissionRate` to API directly (no ÷100 conversion)
- [ ]  Uses `PUT /api/owners/{id}` (not POST or PATCH)
- [ ]  Full owner shape sent in update payload including `status`

### FE-4-OWN-06 — Owner Payouts Tab

- [ ]  Uses owner-specific payout endpoint (`GET /api/internal/owners/{ownerId}/payouts`)
- [ ]  New payout knows owner context for invalidation; `CreateOwnerPayoutRequest` has NO ownerId field (owner derived from booking — P18)
- [ ]  Table columns match API: bookingId, grossBookingAmount, commissionRate, commissionAmount, payoutAmount, payoutStatus, scheduledAt, paidAt, notes

### FE-4-CLI-01 — Client Types

- [ ]  `ClientListItemResponse` does NOT include `totalBookings` — P33
- [ ]  `ClientListFilters` only includes documented params: `includeInactive`, `page`, `pageSize` (NO search)
- [ ]  `getBookings` is BLOCKED with backend-gap error (no documented endpoint)

### FE-4-CLI-02 — Clients List

- [ ]  Phone masked in display
- [ ]  Only documented filters sent: `includeInactive`, `page`, `pageSize` (NO search param)
- [ ]  NO "Total Bookings" column (field does not exist in API — P33)

### FE-4-CLI-03 — Client Detail

- [ ]  Booking history uses `?clientId=` filter (⚠️ requires backend confirmation — NOT documented in API Section 16)
- [ ]  Booking rows use `booking.id` for navigation (NOT `booking.bookingId` — P10)
- [ ]  "Total" column uses `booking.finalAmount` (NOT `totalAmount` — P10)
- [ ]  "Status" column uses `booking.bookingStatus` (NOT `status` — P10)
- [ ]  "Unit" column shows `booking.unitId` (flat, no nested object — P10)
- [ ]  Total Spent computed only from Confirmed + CheckIn + Completed bookings

### FE-4-ADM-01 — Admin Users

- [ ]  Role badge uses `ADMIN_ROLE_LABELS`
- [ ]  Self-deactivation blocked (ID comparison: `adminUser.id` vs `useAuthStore().user.userId`)
- [ ]  Self-role-change blocked (same ID check)
- [ ]  `adminUsersService.getAll` returns paginated response with `items` + `pagination`
- [ ]  `AdminUserListFilters` uses documented params: `includeInactive`, `page`, `pageSize`

### FE-4-ADM-02 — Create Admin User

- [ ]  Role sent as PascalCase: 'SuperAdmin', 'Sales', 'Finance', 'Tech'
- [ ]  `email` sent as `undefined` (not "") when empty
- [ ]  Form resets on modal close

## ARCHITECTURE CHECKS

- [ ]  No inline endpoint strings
- [ ]  No inline role/status strings
- [ ]  `commissionRate` never hardcoded and never converted (÷100 or ×100)
- [ ]  `pnpm type-check` zero errors
- [ ]  No mock data anywhere
- [ ]  No `any` types
- [ ]  Pagination always uses `totalCount` + `totalPages` (NOT `total`, `count`, or `pages`)

## Business Validation

| Test | Expected |
| --- | --- |
| SuperAdmin creates owner with commission=20% | API receives commissionRate=20.00 (percentage, NOT 0.20) |
| Finance creates payout (selects booking + sets 20% commission) | API receives { bookingId, commissionRate: 20.00 } → payout in Pending with auto-calculated amounts |
| Finance schedules pending payout | API receives { notes? } only → status changes to Scheduled (NO date parameter) |
| Finance marks payout as paid (optional notes) | API receives { notes? } only → status changes to Paid (NO proofImageUrl, NO paymentMethod, NO paymentDate) |
| Finance views Finance overview | 7 stat cards show: totalInvoicedAmount, totalPaidAmount, totalRemainingAmount, totalPendingPayoutAmount, totalScheduledPayoutAmount, totalPaidPayoutAmount, totalBookingsWithInvoiceCount |
| Finance views revenue report for current month | Real data shows with metricDate (NOT date), no conversionRate column |
| Sales browses client list (includeInactive filter) | Table shows: name, phone, email, status, created (NO totalBookings column, NO search bar) |
| SuperAdmin creates new Finance admin user | API receives { name, email, password, role: 'Finance' } (PascalCase) |
| SuperAdmin changes Sales user role to Tech | Role updates, badge changes to "Tech" |
| SuperAdmin tries to deactivate own account | Button disabled, action blocked |

## Wave 4 Sign-off Recommendation

- [ ]  APPROVED
CONDITIONAL — conditions: ...
BLOCKED — blockers: ...