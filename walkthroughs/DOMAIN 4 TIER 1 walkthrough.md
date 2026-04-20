# Finance & Payments: Phase 4 Database Tier Walkthrough

## Summary
The Database Tier setup for the Finance & Payments Domain is now complete. This phase established the fundamental record-keeping system for money collection, billing, and owner payouts. We rigorously enforced mathematical integrity through database-level check constraints (e.g., `total = subtotal`, `payout = gross - commission`) and ensured a clean MVP boundary by strictly excluding speculative features such as tax engines, refund workflows, or external payment gateway payloads.

## Overview of Tasks Completed

### DB-PF-01: Money Collection Records (`payments`)
- Built the core `payments` table to track actual funds received or attempted.
- **Strict Constraints:** Enforced limited status (`pending`, `paid`, `failed`, `cancelled`) and method (`cash`, `bank_transfer`, `card`, `wallet`) sets.
- **Safety Gate:** Added `ck_payments_amount_positive` to prevent invalid financial entries.
- **Linkage:** Established a hard link to `bookings` and a deferred/optional link to `invoices`.

### DB-PF-02: Official Billing Records (`invoices`)
- Created the `invoices` table as the standalone billing authority for reservations.
- **Integrity Rule:** Implemented `ck_invoices_total_equals_subtotal` for the MVP phase, ensuring the billing snapshot remains simple and verifiable before tax/discount complexity is introduced.
- **Uniqueness:** Secured the `invoice_number` through a unique index to prevent duplicate billing.
- **Relationship Completion:** Closed the loop by adding the foreign key from `payments` to `invoices`.

### DB-PF-03: Line-Item Breakdowns (`invoice_items`)
- Developed `invoice_items` to decompose invoices into readable components (e.g., `booking_stay`, `manual_adjustment`).
- **Math Enforcement:** Implemented `ck_invoice_items_line_total_formula` ensuring `line_total` is always a perfect product of `quantity` and `unit_amount`.
- **Cascade Deletion:** Configured `ON DELETE CASCADE` to ensure that removing an invoice automatically cleans up its associated breakdown.

### DB-PF-04: Owner Payout Basis (`owner_payouts`)
- Constructed the source-of-truth for owner earnings per booking.
- **Snapshot Logic:** Explicitly stores `gross_booking_amount`, `commission_rate`, and `commission_amount` at the time of payout record creation.
- **Payout Formula:** Enforced `payout_amount = gross_booking_amount - commission_amount` via database constraints.
- **Uniqueness:** Restricted payouts to a 1:1 relationship with bookings using `ux_owner_payouts_booking_id`.

### DB-PF-05: Domain Integrity Checkgate
- Final sweep of the Finance domain to ensure 100% contract compliance.
- **Type Enforcement:** Verified all money fields are strictly `DECIMAL(12,2)`.
- **Leakage Blocked:** Comprehensive scan for forbidden fields (`tax_rate`, `refund_id`, `bank_account_number`, `pdf_url`) across all tables.
- **Init Integration:** Updated the master `init.sql` bootstrap script to include migrations `0022` through `0026`.

---
> [!TIP]
> **Constraint Tactic:** By embedding the financial formulas directly into the database schema (`CHECK` constraints), we have decoupled the data integrity from the application layer, ensuring that even direct SQL insertions cannot produce mathematically inconsistent financial records.
