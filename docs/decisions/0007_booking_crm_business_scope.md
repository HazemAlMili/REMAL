# 0007: Booking & CRM Business-Layer Scope and Domain Rules

## Context & Motivation

Before implementing any Business-layer services for the Booking & CRM domain, we must freeze the exact responsibilities, boundaries, and decision rules that govern this tier. Without this explicit freeze, service implementations risk:

- Mixing CRM lead semantics with booking lifecycle semantics
- Implementing reservation blocking behavior beyond what the MVP requires
- Leaking payment, review, or notification logic into Booking & CRM services
- Building a generic workflow engine instead of targeted service contracts

This document freezes the domain decisions that all Business-layer Booking & CRM services must obey.

---

## Decision 1: Booking Date Semantics

- Bookings use **check_in_date** / **check_out_date** semantics.
- **check_out_date is NOT a charged night.** The guest departs on this day.
- Number of nights = `check_out_date - check_in_date` (in days).

**Frozen in**: [0006_booking_date_semantics.md](./0006_booking_date_semantics.md)

---

## Decision 2: Booking Pricing Snapshot Rule

- Booking pricing is derived from the current **Units & Availability pricing service** at the time of booking creation.
- The translation from booking dates to pricing service parameters is:
  - `startDate` = `check_in_date`
  - `endDate` = `check_out_date` minus 1 day
- The pricing snapshot is stored on the booking entity (`BaseAmount`, `FinalAmount`) and does **not** recalculate after creation unless the booking is explicitly updated while still in `pending` status.

---

## Decision 3: Booking Blocking Rule (Current MVP)

- **Confirmed bookings** block the creation or confirmation of new overlapping bookings on the same unit.
- **Pending and inquiry-status bookings do NOT hard-block** as reservations in this phase.
- The blocking check is performed during:
  1. `CreateAsync` — to prevent creating a booking that overlaps with a confirmed booking
  2. `ConfirmAsync` — to prevent confirming a booking that now overlaps with another confirmed booking

This is intentionally limited for the MVP. A full soft-hold or reservation engine is explicitly out of scope.

---

## Decision 4: Booking Creation Default

- A new booking created via `IBookingService.CreateAsync` always starts in **pending** status.
- No other initial status is allowed at the business layer.

---

## Decision 5: CRM Lead Conversion Rule

- A CRM lead becomes **converted** only after a booking has been successfully created through `ICrmLeadService.ConvertToBookingAsync`.
- If booking creation fails (e.g., overlap conflict, validation error), the lead status must NOT change.
- The conversion operation:
  1. Creates a booking via `IBookingService.CreateAsync`
  2. Sets the lead status to `converted` only on success
  3. Returns the created `Booking` entity

---

## Decision 6: Out of Scope for Booking & CRM Business Tier

The following are explicitly **excluded** from all Booking & CRM business-layer services:

| Excluded Concern        | Rationale                                              |
|-------------------------|--------------------------------------------------------|
| Payments / Invoices     | Separate Finance domain, not yet implemented           |
| Reviews                 | Separate Reviews domain                                |
| Notifications           | Cross-cutting concern, separate infrastructure         |
| Background jobs         | Separate infrastructure tier                           |
| CRM scoring/automation  | Phase 2 feature                                        |
| Generic workflow engine | Over-engineering — services use direct status methods   |
| Soft-hold / reservation | MVP uses confirmed-only blocking                       |
| DTOs / API concerns     | API tier responsibility                                |

---

## Service Responsibility Matrix

| Service                     | Responsible For                                                       |
|-----------------------------|-----------------------------------------------------------------------|
| `IBookingService`           | Booking CRUD, pending-state updates, overlap validation at creation   |
| `IBookingLifecycleService`  | Status transitions (confirm, cancel, complete), overlap check on confirm, status history recording |
| `ICrmLeadService`           | Lead CRUD, status management, lead-to-booking conversion             |
| `ICrmNoteService`           | Notes attached to bookings or leads (exactly-one-parent rule)        |
| `ICrmAssignmentService`     | Admin user assignment to bookings or leads, active/inactive tracking |

---

## Money Representation

- All monetary values use `decimal` (mapped to `DECIMAL(12,2)` in the database).
- No `float` or `double` for financial calculations.

---

## Definition of Done

This decision document freezes the above rules. All subsequent Booking & CRM Business-layer tickets must adhere to these decisions without exception. Any deviation requires a new decision document.
