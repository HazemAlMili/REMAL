# Decision 0011 — Reviews & Ratings Business Scope: Single-Review, Moderated, Owner-Reply MVP

**Date:** 2026-04-22
**Status:** Frozen
**Domain:** Reviews & Ratings (Domain 6)
**Applies to:** Tier 3 (Business) and all subsequent Reviews & Ratings tiers

---

## 1. Decision Summary

Reviews & Ratings Business tier implements a **single-review-per-booking, moderation-gated, owner-reply** MVP. There is no community ranking, helpfulness voting, abuse reporting, media attachments, or threaded commenting in scope. This decision is frozen and cannot be superseded without an explicit approved decision note.

---

## 2. Core Rules (Non-Negotiable)

| Rule | Description |
|---|---|
| **R1 — One review per booking** | A client may submit at most one review per booking. A second submission for the same booking must be rejected. |
| **R2 — Completed bookings only** | A review may only be created for a booking whose `booking_status` is `completed`. Any other status must be rejected. |
| **R3 — Client-scoped creation** | A review may only be created or updated by the client whose `client_id` matches the booking's `client_id`. Cross-client review mutation is never permitted. |
| **R4 — New review starts as pending** | Every newly created review has `review_status = 'pending'`. No review enters the system already published. |
| **R5 — Only published reviews count** | Only reviews with `review_status = 'published'` are included in public review listings and `unit_review_summaries` calculations. |
| **R6 — Moderation status vocabulary** | The only valid `review_status` values in MVP are: `pending`, `published`, `rejected`, `hidden`. No other values may be used or assumed. |
| **R7 — Pending-only updates** | A client may only update a review while it is in `pending` status. Once moderated (published/rejected/hidden), the review content is locked. |
| **R8 — One owner reply per review** | An owner may have at most one reply per review. Creating a reply when one already exists must update the existing reply (upsert). |
| **R9 — Owner reply visibility** | An owner reply is publicly visible only when all three conditions are met: (a) the review is `published`, (b) a reply exists, (c) the reply's `is_visible = true`. |
| **R10 — No community features** | No helpfulness votes, no abuse reports, no media attachments, no threaded comment chains, no community ranking systems, and no recommendation engines are in scope for this MVP. |

---

## 3. Service Responsibility Boundaries

### IReviewService
Responsible for review lifecycle management:
- Reading reviews (filtered by status/unit/client/owner)
- Creating a new review (validates: completed booking, correct client, no duplicate)
- Updating a pending review (validates: still pending, correct client)

Does **not** handle: moderation transitions, owner replies, public-display logic.

### IReviewModerationService
Responsible for admin-driven status transitions:
- `PublishAsync` — transitions any review to `published`; records status history; triggers `UnitReviewSummary` recalculation
- `RejectAsync` — transitions any review to `rejected`; records status history
- `HideAsync` — transitions a published review to `hidden`; records status history; triggers `UnitReviewSummary` recalculation

Does **not** handle: review creation, client-side updates, owner replies.

### IReviewReplyService
Responsible for owner reply management:
- Reading the single reply for a review
- Creating or updating the reply (upsert semantics — one reply per review)
- Toggling reply visibility
- Deleting the reply (validates: owner matches)

Does **not** handle: review moderation, threaded replies, admin-authored replies.

### IReviewSummaryService
Responsible for public-facing published review reads:
- Returning the `UnitReviewSummary` aggregate snapshot for a unit
- Returning the paginated list of published reviews for a unit (with owner reply text if visible)
- Returning a single published review by unit + review ID

Does **not** handle: moderation, unpublished reviews, raw review management.

---

## 4. Out of Scope for MVP (Explicitly Forbidden)

The following features are **explicitly excluded** from the Reviews & Ratings MVP and must not be implemented, scaffolded, or hinted at in any service, interface, model, or comment in this domain:

- Helpfulness votes / like counts
- Abuse / spam reports
- Media attachments / photo uploads
- Threaded comments or nested reply chains
- Admin-authored replies
- Review edit history / revision tracking
- Community ranking or recommendation scores
- Sentiment analysis
- Automated moderation queues
- Notification dispatch (email/push) triggered by review events

---

## 5. Status Transition Rules

```
pending  ──publish──►  published  ──hide──►  hidden
pending  ──reject──►  rejected
published  ──hide──►  hidden
```

- `hidden` and `rejected` are terminal states in the current MVP (no re-publish path).
- Every transition records a row in `review_status_history`.
- `UnitReviewSummary` must be recalculated (by the Business layer) after any transition that changes the published review count for a unit (publish → adds, hide → subtracts).

---

## 6. Unit Review Summary Update Responsibility

`UnitReviewSummary` is an **application-maintained snapshot**, not a DB-computed value. The Business layer (specifically `IReviewModerationService`) is responsible for upserting the summary row after any moderation event that changes the published count for a unit. The `IReviewSummaryService.GetUnitSummaryAsync` reads this snapshot; it does not recalculate from raw reviews.
