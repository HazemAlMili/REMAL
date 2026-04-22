# Decision 0010 — Owner Portal Business Scope: Read-Only, Owner-Scoped MVP

**Date:** 2026-04-21
**Status:** Frozen
**Domain:** Owner Portal (Domain 5)
**Applies to:** Tier 3 (Business) and all subsequent Owner Portal tiers

---

## 1. Decision Summary

Owner Portal Business tier is **read-only** and **owner-scoped**.

Every service method in this tier returns data exclusively for the authenticated owner's records. No write-side portal actions (unit mutations, booking cancellations, finance mutations) are permitted in the MVP. This decision is frozen and cannot be superseded without an explicit approved decision note.

---

## 2. Core Rules (Non-Negotiable)

| Rule | Description |
|---|---|
| **R1 — Read-only MVP** | Owner Portal services expose no write, update, cancel, or delete actions in Tier 3 MVP |
| **R2 — Owner scoping** | Every service method is scoped to the provided `ownerId`; cross-owner data leakage is never permitted under any circumstance |
| **R3 — Owner-id match** | An owner may only access records whose `owner_id` matches the authenticated owner context |
| **R4 — No unit mutation** | No owner-side unit create/update/delete in this tier |
| **R5 — No booking mutation** | No owner-side booking cancellation, status change, or note addition in this tier |
| **R6 — No finance mutation** | No owner-side invoice creation, payment marking, or payout request in this tier |
| **R7 — No field overreach** | No CRM-internal, admin-only, or internal-only fields beyond the frozen read-model contracts (DB-OP-02 through DB-OP-04) |
| **R8 — No bank/refund/tax** | No bank transfer details, refund logic, tax calculations, or reconciliation logic in Owner Portal MVP |
| **R9 — Official access pattern** | Owner Portal services must use the `IQueryable<T>` access pattern established in DA-OP-05 (via `IUnitOfWork.OwnerPortalUnitsOverview`, `OwnerPortalBookingsOverview`, `OwnerPortalFinanceOverview`) |
| **R10 — Derived summaries** | Dashboard and finance summary values are derived from read models and existing payout records — no new source-of-truth tables are created |

---

## 3. Service Responsibilities

| Service | Responsibility |
|---|---|
| `IOwnerPortalUnitService` | Owner-scoped unit inventory reads with optional `isActive` and `areaId` filtering |
| `IOwnerPortalBookingService` | Owner-scoped booking reads with optional status and check-in date range filtering |
| `IOwnerPortalFinanceService` | Owner-scoped finance snapshot reads and aggregated finance summary |
| `IOwnerPortalDashboardService` | Aggregated dashboard summary derived from the other three services' data |

---

## 4. Error Handling Contracts

| Condition | Exception |
|---|---|
| Owner not found | `NotFoundException` |
| Owner is inactive | `BusinessValidationException` |
| Record not found in owner-scoped context | `NotFoundException` |
| Record exists but belongs to a different owner | treated as `NotFoundException` in portal context (no cross-owner information disclosure) |

---

## 5. Explicit Exclusions (Owner Portal MVP)

The following are **out of scope** for all Owner Portal Business tier tickets unless a superseding decision note is approved:

- Owner-initiated unit create/update/deactivate
- Owner-initiated booking cancellation or status change
- Owner-initiated invoice creation or payment recording
- Owner payout request or bank detail submission
- Owner notification preferences or messaging
- Owner profile update (password change, contact info)
- Availability calendar management
- Seasonal pricing management
- CRM note/lead/assignment access
- Finance reconciliation, tax breakdown, or refund processing
- Admin-only reports or cross-owner aggregate views

---

## 6. Relationship to Tier 1 and Tier 2 Freeze

This decision extends the Tier 1 freeze (DB-OP-01 — `0009_owner_portal_db_scope.md`):

- Tier 1 froze: no new transactional write tables, read-model views only
- Tier 2 confirmed: `IQueryable<T>` read-only access pattern, `AsNoTracking()` enforced
- Tier 3 (this note) freezes: no write-side service methods, owner scoping enforced at every call site

The chain of immutability is: DB → Data Access → Business → API.

---

## 7. Impact on Tier 4 (API)

Owner Portal API controllers must:

- authenticate using the JWT with `subjectType=owner`
- extract `ownerId` from the authenticated owner's claims
- pass `ownerId` directly to all service methods — never accept it from the request body or query string
- return only the data the service provides — no augmentation with admin/internal data
- use an owner-only authorization policy

---

## 8. Verification Checklist

Before moving from Business tier to API tier, verify:

- [ ] All 4 services implemented
- [ ] All service methods include an owner existence check
- [ ] All service methods include an owner active-status check
- [ ] No method returns records whose `owner_id != ownerId`
- [ ] No write-side mutations exist in any service
- [ ] No CRM/admin/bank/refund/tax fields are returned or computed
- [ ] Dashboard summary is derived entirely from existing read models
- [ ] No new source-of-truth tables or EF entities were introduced
- [ ] Build succeeds, 0 errors, 0 warnings
