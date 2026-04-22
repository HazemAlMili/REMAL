# Decision 0009 — Owner Portal DB Scope: Read-Model-First (MVP Freeze)

**Date:** 2026-04-21
**Status:** Frozen
**Domain:** Owner Portal (Domain 5)
**Applies to:** Tier 1 (DB) through all Owner Portal tiers

---

## 1. Decision Summary

Owner Portal MVP is **read-model-first**.

The portal does NOT introduce new core transactional write tables in Tier 1. All Owner Portal data reads are served from the existing transactional source tables established by prior domains. The only DB artifacts introduced in Owner Portal Tier 1 are SQL views that reshape existing data for portal-specific read queries.

This decision is frozen. No future Owner Portal ticket may create a transactional write table without an explicit approved decision note superseding this one.

---

## 2. Rationale

By the time Owner Portal is implemented, the following source-of-truth tables are already fully established:

| Table | Established In |
|---|---|
| `owners` | Domain 1 — Master Data & Auth |
| `units` | Domain 2 — Units & Availability |
| `bookings` | Domain 3 — Booking & CRM |
| `invoices` | Domain 4 — Payments / Invoices / Finance |
| `payments` | Domain 4 — Payments / Invoices / Finance |
| `owner_payouts` | Domain 4 — Payments / Invoices / Finance |

Every piece of data an owner needs to view in their portal already exists in these tables. Introducing new transactional tables would:

- Duplicate the source of truth
- Create synchronization risk (portal tables drift from transactional tables)
- Violate the principle that each domain owns one canonical source
- Add unnecessary write paths to the portal without business justification

---

## 3. Source-of-Truth Tables (Immutable for Portal)

The following tables are the authoritative source for all Owner Portal read queries. The portal must never write to these tables directly via portal-initiated flows — writes originate from their respective domains only.

| Table | Owner Portal Usage |
|---|---|
| `owners` | Identity, profile display, commission rate |
| `units` | Owner's unit list, unit details, status |
| `bookings` | Confirmed bookings for owner's units |
| `invoices` | Invoice records linked to owner's bookings |
| `payments` | Payment records linked to owner's bookings |
| `owner_payouts` | Payout snapshots, payout history, earnings totals |

> **Rule:** Owner Portal reads data. Owner Portal does not own data.

---

## 4. What IS Introduced in Owner Portal Tier 1

Owner Portal Tier 1 DB support is limited to exactly three categories:

| Category | What It Is |
|---|---|
| This decision note | Architecture freeze document |
| SQL read-model views | Non-materialized `CREATE OR REPLACE VIEW` statements that reshape source tables for portal queries |
| Verification scripts | Static checks confirming views exist and return expected columns |

Nothing else is introduced in Tier 1.

---

## 5. Planned Read-Model Views

The following views will be created in Owner Portal Tier 1:

### `owner_portal_units_overview`

**Purpose:** One row per unit owned by a given owner. Provides the portal's unit list display including current status, area name, and base pricing.

**Source tables:** `units`, `areas`

**Key columns (illustrative):**
- `unit_id`, `owner_id`, `title`, `unit_type`, `unit_status`
- `area_id`, `area_name`
- `base_price_per_night`
- `created_at`

---

### `owner_portal_bookings_overview`

**Purpose:** One row per confirmed (or completed) booking on an owner's units. Provides booking history including dates, client reference, amounts, and booking status.

**Source tables:** `bookings`, `units`

**Key columns (illustrative):**
- `booking_id`, `unit_id`, `owner_id`
- `booking_status`
- `check_in_date`, `check_out_date`, `num_nights`
- `base_amount`, `final_amount`
- `client_id`
- `created_at`

> **Note:** Only bookings with status `confirmed`, `check_in`, `completed` are surfaced in the portal view. `prospecting`, `relevant`, `no_answer`, `booked`, `not_relevant`, `cancelled` are excluded from owner-facing display.

---

### `owner_portal_finance_overview`

**Purpose:** One row per booking showing the financial snapshot from the owner's perspective: what was charged, what was paid, and what payout was recorded.

**Source tables:** `bookings`, `owner_payouts`, `invoices`, `payments`

**Key columns (illustrative):**
- `booking_id`, `unit_id`, `owner_id`
- `final_amount`
- `invoice_id`, `invoice_status`, `invoice_total`
- `total_paid` (sum of paid payments for booking)
- `payout_id`, `payout_status`, `payout_amount`, `commission_rate`, `commission_amount`
- `payout_paid_at`

---

## 6. Explicit Exclusions (MVP)

The following are **explicitly out of scope** for Owner Portal MVP and must not be introduced:

| Exclusion | Reason |
|---|---|
| Materialized views | Not needed at current data scale; adds refresh complexity |
| `owner_portal_preferences` table | No portal personalization in MVP |
| `owner_portal_notifications` table | Notifications are a separate domain concern |
| `owner_portal_sessions` table | JWT handles auth; no portal-specific session store |
| Any `owner_portal_*` write table | Portal is read-only in MVP |
| Duplicate finance/booking/unit tables | Would split source of truth |
| Owner-initiated booking writes via portal | Owners cannot create/modify bookings |
| Owner-initiated payout requests via portal | Payouts are Admin-initiated only |

---

## 7. Write Rules for Owner Portal

| Action | Allowed in MVP | Who Initiates |
|---|---|---|
| View own units | Yes | Owner (read only) |
| View own bookings (confirmed+) | Yes | Owner (read only) |
| View own payout history | Yes | Owner (read only) |
| View own earnings summary | Yes | Owner (read only) |
| Create/modify units | No | Admin only |
| Approve/reject bookings | No | Not applicable (admin-owned flow) |
| Request payout | No | Admin-initiated only |
| Upload documents | No | Deferred |
| Edit profile | No | Deferred |

---

## 8. Impact on Later Owner Portal Tiers

| Tier | What This Decision Means |
|---|---|
| Tier 2 (Data Access) | Repositories query existing entity tables; no new entity classes for portal-specific write models |
| Tier 3 (Business) | Services aggregate read-model data from existing repos; no portal-specific write services |
| Tier 4 (API) | Controllers serve read-only portal endpoints; no POST/PUT/DELETE for portal-owned data |
| Owner Auth | Already established in Domain 1 — no new auth tables |

---

## 9. Verification Checklist (DB-OP-01)

| Check | Type | Expected Result |
|---|---|---|
| This file exists at `docs/decisions/0009_owner_portal_db_scope.md` | Static | Pass |
| Note explicitly states no new transactional tables in Tier 1 | Static | See §3, §4, §6 |
| Note explicitly names source-of-truth tables | Static | See §3 |
| Note explicitly names planned read-model views | Static | See §5 |
| No migration file created by this ticket | Static | No `0027_*` file in `db/migrations/` |
| No new EF entity created by this ticket | Static | No new `*.cs` in `Data/Entities/` |
