# Domain 3 Tier 3 — Booking & CRM Business Layer Walkthrough

---

## Overview

This tier transforms raw Booking & CRM data access into governed, rule-enforced business operations. Five service contracts were defined, a comprehensive domain decision note was frozen, and five service implementations were built — each enforcing explicit validation, status control, pricing snapshots, and ownership semantics.

**Build**: ✅ 0 errors, 0 warnings  
**QA Review**: 29/29 strict contract checks PASS  
**PM Decision**: GO

---

## BZ-BC-01: Contracts & Domain Decision Note

### Interfaces Created

| Interface | Responsibility |
|-----------|---------------|
| [IBookingService](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Interfaces/IBookingService.cs) | Booking CRUD, pending-state updates, pricing snapshot, overlap validation |
| [IBookingLifecycleService](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Interfaces/IBookingLifecycleService.cs) | Controlled status transitions: confirm, cancel, complete |
| [ICrmLeadService](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Interfaces/ICrmLeadService.cs) | Lead CRUD, status management, lead-to-booking conversion |
| [ICrmNoteService](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Interfaces/ICrmNoteService.cs) | Notes attached to bookings or leads (exactly-one-parent) |
| [ICrmAssignmentService](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Interfaces/ICrmAssignmentService.cs) | Admin ownership assignment with active/inactive tracking |

### Domain Decision Note

[0007_booking_crm_business_scope.md](file:///d:/Clinets/Remal/REMAL/docs/decisions/0007_booking_crm_business_scope.md) freezes 6 key decisions:

1. **Date semantics**: check-in/check-out, checkout is NOT a charged night
2. **Pricing translation**: `endDate = checkOutDate - 1 day` before calling availability service
3. **Confirmed-only blocking**: pending/inquiry do NOT hard-block in MVP
4. **Default status**: new bookings always start as `pending`
5. **Lead conversion**: becomes `converted` only after successful booking creation
6. **Out of scope**: payments, reviews, notifications, scoring, background jobs

---

## BZ-BC-02: BookingService

**File**: [BookingService.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Services/BookingService.cs)

### CreateAsync Flow

```
Validate dates (checkOut > checkIn)
  → Validate guestCount > 0
  → Validate source whitelist (direct, admin, phone, whatsapp, website)
  → Client must exist (active, non-deleted)
  → Unit must exist (active, non-deleted)
  → Admin must exist and be active (if provided)
  → guestCount <= unit.MaxGuests
  → Translate dates: pricingEnd = checkOutDate - 1 day
  → Check operational availability (date blocks)
  → Check confirmed-only overlap
  → Compute pricing snapshot (BaseAmount = FinalAmount = TotalPrice)
  → Set OwnerId from unit.OwnerId (not caller input)
  → Set status = "pending"
  → Create initial BookingStatusHistory (OldStatus = null)
  → SaveChangesAsync
```

### UpdatePendingAsync

- Only allowed from `pending` or `inquiry` status
- Re-validates everything: dates, guests, source, availability, overlap (excluding self), pricing
- Re-computes pricing snapshot

### GetStatusHistoryAsync

- Returns status history rows for a booking ordered by most recent first

---

## BZ-BC-03: BookingLifecycleService

**File**: [BookingLifecycleService.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Services/BookingLifecycleService.cs)

### Transition Matrix

| Method | Allowed From | Target | Re-checks |
|--------|-------------|--------|-----------|
| `ConfirmAsync` | pending, inquiry | confirmed | Unit active, operational availability, confirmed overlap (excl self) |
| `CancelAsync` | inquiry, pending, confirmed | cancelled | None |
| `CompleteAsync` | confirmed | completed | None |

### Key Behaviors

- **Every transition** appends one `BookingStatusHistory` row (old → new, admin, notes)
- **Admin validation** required on all transitions (`changedByAdminUserId` must exist and be active)
- **Confirm re-checks** use `checkOutDate.AddDays(-1)` for availability, and confirmed-only overlap excluding self
- **No money mutation** — only `BookingStatus` and `UpdatedAt` change
- **No payment/refund/notification** side effects

---

## BZ-BC-04: CrmLeadService

**File**: [CrmLeadService.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Services/CrmLeadService.cs)

### Validation Rules

| Rule | Detail |
|------|--------|
| Contact info | `contactName` and `contactPhone` required after trim |
| Desired stay | `checkOut > checkIn` when both present; `guestCount > 0` when present |
| Source whitelist | `direct, admin, phone, whatsapp, website` |
| Status whitelist | `new, contacted, qualified, converted, lost` |
| Default status | `new` on creation |
| Optional references | `clientId`, `targetUnitId`, `assignedAdminUserId` validated only when provided |

### ConvertToBookingAsync Flow

```
Lead must exist
  → Must NOT be "converted" or "lost"
  → If lead.ClientId set → must match provided clientId
  → If lead.TargetUnitId set → must match provided unitId
  → Call IBookingService.CreateAsync(source=lead.Source, admin=lead.AssignedAdminUserId)
  → ON SUCCESS: lead.LeadStatus = "converted"
  → Backfill lead.ClientId if null
  → Backfill lead.TargetUnitId if null
```

Lead remains a distinct entity — no `booking_id` field is simulated.

---

## BZ-BC-05: CrmNoteService

**File**: [CrmNoteService.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Services/CrmNoteService.cs)

### Operations

| Method | Behavior |
|--------|----------|
| `AddToBookingAsync` | Booking must exist, sets `CrmLeadId = null` |
| `AddToLeadAsync` | Lead must exist, sets `BookingId = null` |
| `UpdateAsync` | Note must exist, noteText required after trim |
| `DeleteAsync` | Note must exist, physical delete (MVP) |
| `GetByBookingIdAsync` | Booking must exist, returns notes for that booking |
| `GetByLeadIdAsync` | Lead must exist, returns notes for that lead |

**Key constraints**: exactly-one-parent (booking XOR lead), no attachments, no version history, no generic parent engine.

---

## BZ-BC-06: CrmAssignmentService

**File**: [CrmAssignmentService.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Services/CrmAssignmentService.cs)

### One-Active-Assignment Semantics

| Operation | Behavior |
|-----------|----------|
| `AssignBookingAsync` | Deactivates previous active rows → creates new active row → syncs `booking.AssignedAdminUserId` |
| `AssignLeadAsync` | Same pattern for leads |
| `ClearBookingAssignmentAsync` | Deactivates all active rows → sets `booking.AssignedAdminUserId = null` |
| `ClearLeadAssignmentAsync` | Same pattern for leads |
| `GetActiveForBookingAsync` | Returns current active assignment or null |
| `GetActiveForLeadAsync` | Same for leads |

### Idempotent Guard

Assigning the same admin who is already the active assignee returns the existing assignment without creating a duplicate row.

### Snapshot Synchronization

Parent entity's `AssignedAdminUserId` field is always updated in lockstep with assignment row changes — no drift possible.

---

## Verification Summary

| Check | Result |
|-------|--------|
| Solution builds | ✅ 0 errors, 0 warnings |
| All 5 services implement their interfaces | ✅ |
| Pricing uses `checkOutDate - 1 day` | ✅ |
| Confirmed-only overlap blocking | ✅ |
| Status history on every transition + creation | ✅ |
| Lead conversion delegates to IBookingService | ✅ |
| Assignment snapshot sync | ✅ |
| No payment/invoice/review/notification leakage | ✅ |
| QA: 29/29 contract checks | ✅ |
| PM Decision | GO |
