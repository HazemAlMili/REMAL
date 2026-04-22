# Decision 0008 — Payments / Invoices / Finance Business Scope

**Date:** 2026-04-21
**Status:** Frozen
**Domain:** Payments / Invoices / Finance (Domain 4)

---

## 1. Current MVP Exclusions

The following concerns are **explicitly deferred** and must NOT be introduced into any service, entity, controller, or DTO in the current MVP:

| Concern | Status |
|---|---|
| Refunds | Deferred — tracked in Finance log only as a future feature |
| Taxes / VAT | Deferred — no tax fields, no tax engine, no tax line items |
| Discounts | Deferred — no discount fields, no coupon/promo logic |
| Payment Gateway / Provider Integration | Deferred — all payments are manual entries in current MVP |
| Webhook / Callback handling | Deferred — no gateway means no webhooks |
| Bank Payout Execution | Deferred — payout is a snapshot record only, not a bank operation |
| Reconciliation Engine | Deferred — no auto-reconciliation, no export |
| Partial Payouts | Deferred — one payout row per booking, no partial splits |
| PDF Invoice Generation | Deferred — invoice is a data record only |
| External e-invoicing Providers | Deferred — no provider integrations |

The data model is designed to be **gateway-ready** (payment method, reference number fields exist) without coupling to any gateway.

---

## 2. Invoice Total Rule

> **invoice.TotalAmount = invoice.SubtotalAmount** in current MVP.

There is no tax, no discount, no surcharge applied on top of subtotal. All adjustments happen through invoice line items (manual_adjustment type). The service layer enforces this identity at all times.

---

## 3. Invoice Item Types in MVP

Only two line types are permitted in the current MVP:

| Line Type | When Used |
|---|---|
| `booking_stay` | Created automatically on invoice draft creation from booking (quantity = 1, unit_amount = booking.FinalAmount) |
| `manual_adjustment` | Added explicitly by finance admin for any additional charge or credit |

No product catalog, no tax line, no discount line, no gateway fee line.

---

## 4. Payment Linkage Rule

- A payment **may optionally** be linked to an invoice via `InvoiceId`.
- If `InvoiceId` is provided:
  - The invoice must exist.
  - The invoice's `BookingId` must equal the payment's `BookingId`.
  - The invoice must not be in `draft` or `cancelled` status when marking the payment as paid.
- A payment not linked to any invoice is valid (e.g., a deposit recorded before invoice creation).

---

## 5. Invoice Status Rule

Invoice status transitions:
```
draft → issued → paid (system-set)
draft → cancelled
issued → cancelled (only if no linked paid payments)
```

The `paid` status is **never set manually**. It is set automatically by `PaymentService.MarkPaidAsync` when the sum of all linked paid payments equals `invoice.TotalAmount`.

---

## 6. Owner Payout Rule

- Payout snapshot is derived from `booking.FinalAmount` and an explicit `commissionRate` input.
- `grossBookingAmount = booking.FinalAmount`
- `commissionAmount = round(gross × rate / 100, 2)`
- `payoutAmount = gross − commissionAmount`
- The snapshot can only be created or updated when the booking status is `confirmed` or `completed`.
- An existing payout snapshot can only be updated when its status is `pending`.
- Payout does **not** automatically trigger on booking confirmation or payment. It is explicitly initiated by a finance admin.

---

## 7. One Active Invoice Per Booking (MVP Rule)

At most one non-cancelled invoice may exist per booking at any time. The allowed statuses for an "active" invoice are: `draft`, `issued`, `paid`.

- If a booking already has an invoice in any of these states, creating a new invoice for the same booking will raise a `ConflictException`.
- A `cancelled` invoice does **not** block creation of a new invoice for the same booking.

This rule is enforced at the Business tier (`InvoiceService.CreateDraftFromBookingAsync`).

---

## 8. Service Responsibilities Summary

| Service | Responsibility |
|---|---|
| `IPaymentService` | Payment creation, status transitions (pending→paid/failed/cancelled), invoice-link validation, overpayment prevention, invoice paid synchronization |
| `IInvoiceService` | Draft creation from booking, manual line item additions, issue/cancel flow, one-active-invoice rule enforcement, total recalculation |
| `IOwnerPayoutService` | Payout snapshot creation/update from booking, payout status transitions (pending→scheduled→paid/cancelled) |
| `IFinanceSummaryService` | Read-only aggregation: invoice balance, booking finance snapshot, owner payout totals by status |
