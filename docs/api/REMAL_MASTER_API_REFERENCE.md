# REMAL Platform — Master API Reference

This document is a verbatim reflection of the current Controller implementations and exactly matches the Swagger UI (localhost) structure.
**Last updated:** 2026-04-22 | **Controllers covered:** 37 | **Endpoints:** 120+

---

## 🔐 Auth (Authentication)
**Base Path**: `/api/Auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/client/register` | Public | Register new client |
| `POST` | `/client/login` | Public | Validate phone/password for Clients |
| `POST` | `/admin/login` | Public | Validate email/password for Admins |
| `POST` | `/owner/login` | Public | Validate phone/password for Owners |
| `POST` | `/refresh` | Any | Refresh session token |
| `POST` | `/logout` | Any | Terminate session |

---

## 🏗️ Domain 1 — Master Data

### AdminUsers 🔒
**Policy**: `SuperAdminOnly`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin-users` | List all admin users |
| `POST` | `/api/admin-users` | Create new admin user |
| `PATCH` | `/api/admin-users/{id}/role` | Update role |
| `PATCH` | `/api/admin-users/{id}/status` | Toggle active status |

---

### Amenities 🆓

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/Amenities` | Anonymous | List all amenities |
| `POST` | `/api/Amenities` | SuperAdmin | Create amenity |

---

### Areas 📍

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/Areas` | Anonymous | List all areas |
| `GET` | `/api/Areas/{id}` | Anonymous | Area detail |
| `POST` | `/api/Areas` | SuperAdmin | Create area |
| `PUT` | `/api/Areas/{id}` | SuperAdmin | Update area |
| `PATCH` | `/api/Areas/{id}/status` | SuperAdmin | Toggle active status |

---

### Clients 👤
**Policy**: `SalesOrSuperAdmin`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/Clients` | List all clients |
| `GET` | `/api/Clients/{id}` | Client detail |

---

### Owners 🤝

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/Owners` | InternalAdminReadOwners | List all owners |
| `GET` | `/api/Owners/{id}` | InternalAdminReadOwners | Owner full profile |
| `POST` | `/api/Owners` | SuperAdmin | Create owner |
| `PUT` | `/api/Owners/{id}` | SuperAdmin | Update owner |
| `PATCH` | `/api/Owners/{id}/status` | SuperAdmin | Toggle active status |

---

## 🏡 Domain 2 — Inventory & Units

### Units

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/units` | Public | Search + filter units |
| `GET` | `/api/units/{id}` | Public | Unit public detail |
| `GET` | `/api/internal/units` | AdminAuthenticated | Admin unit list |
| `POST` | `/api/internal/units` | SuperAdmin/Sales | Create unit |
| `PUT` | `/api/internal/units/{id}` | SuperAdmin/Sales | Update unit |
| `PATCH` | `/api/internal/units/{id}/status` | SuperAdmin/Sales | Toggle unit status |

---

### Unit Images (Media)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/units/{unitId}/images` | Public | List unit images |
| `POST` | `/api/internal/units/{unitId}/images` | SuperAdmin | Add image |
| `PUT` | `/api/internal/units/{unitId}/images/reorder` | SuperAdmin | Reorder gallery |
| `PATCH` | `/api/internal/units/{unitId}/images/{imageId}/cover` | SuperAdmin | Set cover image |
| `DELETE` | `/api/internal/units/{unitId}/images/{imageId}` | SuperAdmin | Remove image |

---

### Unit Amenities

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/units/{unitId}/amenities` | Public | List unit amenities |
| `POST` | `/api/internal/units/{unitId}/amenities` | SuperAdmin | Assign amenity |
| `DELETE` | `/api/internal/units/{unitId}/amenities/{amenityId}` | SuperAdmin | Remove amenity |
| `PUT` | `/api/internal/units/{unitId}/amenities` | SuperAdmin | Replace all amenities |

---

### Seasonal Pricing

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/internal/units/{unitId}/seasonal-pricing` | AdminAuthenticated | List seasonal pricing |
| `POST` | `/api/internal/units/{unitId}/seasonal-pricing` | SuperAdmin | Create seasonal pricing |
| `PUT` | `/api/internal/seasonal-pricing/{id}` | SuperAdmin | Update seasonal pricing |
| `DELETE` | `/api/internal/seasonal-pricing/{id}` | SuperAdmin | Delete seasonal pricing |

---

### Date Blocks

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/internal/units/{unitId}/date-blocks` | AdminAuthenticated | List date blocks |
| `POST` | `/api/internal/units/{unitId}/date-blocks` | SuperAdmin | Create block |
| `PUT` | `/api/internal/date-blocks/{id}` | SuperAdmin | Update block |
| `DELETE` | `/api/internal/date-blocks/{id}` | SuperAdmin | Delete block |

---

### Availability & Pricing

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/units/{unitId}/availability/operational-check` | Public | JSON availability check for date range |
| `POST` | `/api/units/{unitId}/pricing/calculate` | Public | Detailed price breakdown for date range |

---

## 📅 Domain 3 — Operations & CRM

### Bookings

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/internal/bookings` | InternalAdminRead | List all bookings |
| `POST` | `/api/internal/bookings` | InternalAdminRead | Create booking manually |
| `GET` | `/api/internal/bookings/{id}` | InternalAdminRead | Booking detail |
| `PUT` | `/api/internal/bookings/{id}` | InternalAdminRead | Update pending booking |
| `GET` | `/api/internal/bookings/{id}/status-history` | InternalAdminRead | Booking audit trail |

---

### Booking Lifecycle

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/internal/bookings/{id}/confirm` | InternalAdminRead | Confirm booking |
| `POST` | `/api/internal/bookings/{id}/cancel` | InternalAdminRead | Cancel booking |
| `POST` | `/api/internal/bookings/{id}/complete` | InternalAdminRead | Complete booking |

---

### CRM Leads

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/crm/leads` | Public | Public lead capture / inquiry |
| `GET` | `/api/internal/crm/leads` | SalesOrSuperAdmin | List leads |
| `GET` | `/api/internal/crm/leads/{id}` | SalesOrSuperAdmin | Lead detail |
| `PUT` | `/api/internal/crm/leads/{id}` | SalesOrSuperAdmin | Update lead |
| `PATCH` | `/api/internal/crm/leads/{id}/status` | SalesOrSuperAdmin | Set lead status |
| `POST` | `/api/internal/crm/leads/{id}/convert-to-booking` | SalesOrSuperAdmin | Convert lead to booking |

---

### CRM Assignments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/internal/bookings/{bookingId}/assignment` | InternalAdminRead | Get booking assignment |
| `POST` | `/api/internal/bookings/{bookingId}/assignment` | InternalAdminRead | Assign booking |
| `DELETE` | `/api/internal/bookings/{bookingId}/assignment` | InternalAdminRead | Unassign booking |
| `GET` | `/api/internal/crm/leads/{leadId}/assignment` | SalesOrSuperAdmin | Get lead assignment |
| `POST` | `/api/internal/crm/leads/{leadId}/assignment` | SalesOrSuperAdmin | Assign lead |
| `DELETE` | `/api/internal/crm/leads/{leadId}/assignment` | SalesOrSuperAdmin | Unassign lead |

---

### CRM Notes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/internal/bookings/{id}/notes` | InternalAdminRead | List booking notes |
| `POST` | `/api/internal/bookings/{id}/notes` | InternalAdminRead | Add booking note |
| `GET` | `/api/internal/crm/leads/{id}/notes` | SalesOrSuperAdmin | List lead notes |
| `POST` | `/api/internal/crm/leads/{id}/notes` | SalesOrSuperAdmin | Add lead note |
| `PUT` | `/api/internal/crm/notes/{id}` | InternalAdminRead | Update note |
| `DELETE` | `/api/internal/crm/notes/{id}` | InternalAdminRead | Delete note |

---

## 💰 Domain 4 — Finance

### Payments
**Base Path**: `/api/internal/payments` | **Policy**: `FinanceOrSuperAdmin`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/internal/payments` | List payments (filter: `paymentStatus`, `bookingId`, `invoiceId`, paginated) |
| `GET` | `/api/internal/payments/{id}` | Payment detail |
| `POST` | `/api/internal/payments` | Create payment |
| `POST` | `/api/internal/payments/{id}/mark-paid` | Mark payment as paid |
| `POST` | `/api/internal/payments/{id}/mark-failed` | Mark payment as failed |
| `POST` | `/api/internal/payments/{id}/cancel` | Cancel payment |

---

### Invoices
**Base Path**: `/api/internal/invoices` | **Policy**: `FinanceOrSuperAdmin`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/internal/invoices` | List invoices (filter: `invoiceStatus`, `bookingId`, paginated) |
| `GET` | `/api/internal/invoices/{id}` | Invoice detail (with line items) |
| `POST` | `/api/internal/invoices/drafts` | Create invoice draft from booking |
| `POST` | `/api/internal/invoices/{id}/items/manual-adjustment` | Add manual adjustment line |
| `POST` | `/api/internal/invoices/{id}/issue` | Issue invoice |
| `POST` | `/api/internal/invoices/{id}/cancel` | Cancel invoice |

---

### Finance Summaries

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/internal/invoices/{invoiceId}/balance` | FinanceOrSuperAdmin | Invoice balance (paid / remaining) |
| `GET` | `/api/internal/bookings/{bookingId}/finance-snapshot` | InternalAdminRead | Full finance snapshot for a booking |
| `GET` | `/api/internal/owners/{ownerId}/payout-summary` | FinanceOrSuperAdmin | Owner payout totals summary |

---

### Owner Payouts
**Policy**: `FinanceOrSuperAdmin`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/internal/owner-payouts/by-booking/{bookingId}` | Get payout by booking |
| `GET` | `/api/internal/owners/{ownerId}/payouts` | List payouts by owner (`?payoutStatus=`) |
| `POST` | `/api/internal/owner-payouts` | Create or update payout from booking |
| `POST` | `/api/internal/owner-payouts/{id}/schedule` | Schedule payout |
| `POST` | `/api/internal/owner-payouts/{id}/mark-paid` | Mark payout as paid |
| `POST` | `/api/internal/owner-payouts/{id}/cancel` | Cancel payout |

---

## ⭐ Domain 5 — Reviews

### Public Reviews 🆓
**Base Path**: `/api/public/units/{unitId}/reviews`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/public/units/{unitId}/reviews/summary` | Unit review score summary (avg rating, count) |
| `GET` | `/api/public/units/{unitId}/reviews` | Paginated published reviews for a unit |
| `GET` | `/api/public/units/{unitId}/reviews/{reviewId}` | Single published review detail |

---

### Client Reviews 🔒
**Base Path**: `/api/client/reviews` | **Policy**: `ClientOnly`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/client/reviews` | Submit review after completed booking |
| `PUT` | `/api/client/reviews/{reviewId}` | Update own pending review |
| `GET` | `/api/client/reviews/by-booking/{bookingId}` | Get own review for a booking |

---

### Review Moderation (Internal) 🔒
**Base Path**: `/api/internal/reviews/{reviewId}` | **Policy**: `SalesOrSuperAdmin`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/internal/reviews/{reviewId}/publish` | Publish review |
| `POST` | `/api/internal/reviews/{reviewId}/reject` | Reject review |
| `POST` | `/api/internal/reviews/{reviewId}/hide` | Hide published review |
| `GET` | `/api/internal/reviews/{reviewId}/status-history` | Review moderation audit trail |

---

### Review Replies (Owner) 🔒
**Base Path**: `/api/owner/reviews` | **Policy**: `OwnerOnly`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/owner/reviews/{reviewId}/reply` | Get own reply to a review |
| `PUT` | `/api/owner/reviews/{reviewId}/reply` | Create or update reply |
| `PATCH` | `/api/owner/reviews/{reviewId}/reply/visibility` | Toggle reply visibility |
| `DELETE` | `/api/owner/reviews/{reviewId}/reply` | Delete reply |

---

## 🔔 Domain 6 — Notifications

### Internal Notification Management 🔒
**Policy**: `AdminAuthenticated`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/internal/notifications` | List all notifications (filter: `status`, `channel`, `templateId`, paginated) |
| `GET` | `/api/internal/notifications/{notificationId}` | Notification detail |
| `POST` | `/api/internal/notifications/admins/{adminUserId}` | Create notification for admin |
| `POST` | `/api/internal/notifications/clients/{clientId}` | Create notification for client |
| `POST` | `/api/internal/notifications/owners/{ownerId}` | Create notification for owner |

---

### Notification Dispatch (Lifecycle) 🔒
**Policy**: `AdminAuthenticated`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/internal/notifications/{notificationId}/queue` | Queue notification for sending |
| `POST` | `/api/internal/notifications/{notificationId}/mark-sent` | Mark as sent |
| `POST` | `/api/internal/notifications/{notificationId}/mark-delivered` | Mark as delivered |
| `POST` | `/api/internal/notifications/{notificationId}/mark-failed` | Mark as failed |
| `POST` | `/api/internal/notifications/{notificationId}/cancel` | Cancel notification |
| `GET` | `/api/internal/notifications/{notificationId}/delivery-logs` | Delivery attempt logs |

---

### Notification Inbox (Multi-Recipient)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/internal/me/notifications/inbox` | AdminAuthenticated | Admin notification inbox |
| `GET` | `/api/internal/me/notifications/inbox/summary` | AdminAuthenticated | Admin inbox unread summary |
| `POST` | `/api/internal/me/notifications/inbox/{notificationId}/read` | AdminAuthenticated | Mark admin notification as read |
| `GET` | `/api/client/me/notifications/inbox` | ClientOnly | Client notification inbox |
| `GET` | `/api/client/me/notifications/inbox/summary` | ClientOnly | Client inbox unread summary |
| `POST` | `/api/client/me/notifications/inbox/{notificationId}/read` | ClientOnly | Mark client notification as read |
| `GET` | `/api/owner/me/notifications/inbox` | OwnerOnly | Owner notification inbox |
| `GET` | `/api/owner/me/notifications/inbox/summary` | OwnerOnly | Owner inbox unread summary |
| `POST` | `/api/owner/me/notifications/inbox/{notificationId}/read` | OwnerOnly | Mark owner notification as read |

---

### Notification Preferences (Multi-Recipient)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/internal/me/notification-preferences` | AdminAuthenticated | Get admin preferences (`?channel=`) |
| `PUT` | `/api/internal/me/notification-preferences` | AdminAuthenticated | Upsert admin preference |
| `GET` | `/api/client/me/notification-preferences` | ClientOnly | Get client preferences |
| `PUT` | `/api/client/me/notification-preferences` | ClientOnly | Upsert client preference |
| `GET` | `/api/owner/me/notification-preferences` | OwnerOnly | Get owner preferences |
| `PUT` | `/api/owner/me/notification-preferences` | OwnerOnly | Upsert owner preference |

---

## 🏠 Owner Portal

**Policy**: `OwnerOnly` — all endpoints scoped to the authenticated owner's own data only.

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/owner/dashboard` | Owner dashboard summary (units, bookings, payout totals) |

---

### Owner Units
> *(Served by existing public + internal units endpoints scoped to owner — no separate portal units controller in current implementation.)*

---

### Owner Bookings

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/owner/bookings` | List own bookings (filter: `bookingStatus`, `checkInFrom`, `checkInTo`, paginated) |
| `GET` | `/api/owner/bookings/{bookingId}` | Own booking detail |

---

### Owner Finance

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/owner/finance` | List finance rows for own bookings (filter: `invoiceStatus`, `payoutStatus`, paginated) |
| `GET` | `/api/owner/finance/bookings/{bookingId}` | Finance row for a specific own booking |
| `GET` | `/api/owner/finance/summary` | Aggregated finance summary for own portfolio |

---

## 📊 Domain 7 — Reports & Analytics (Internal)

> All analytics endpoints are **internal read-only**.
> **Policy**: `InternalAnalyticsRead` — requires admin JWT with role in `[super_admin, sales, finance, tech]`.
> No exports, no charts, no raw query endpoints.

---

### Booking Analytics

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/internal/reports/bookings/daily` | `dateFrom`, `dateTo`, `bookingSource`, `page`, `pageSize` | Daily booking analytics rows (paginated) |
| `GET` | `/api/internal/reports/bookings/summary` | `dateFrom`, `dateTo`, `bookingSource` | Aggregate booking analytics summary |

**Daily response fields**: `metricDate`, `bookingSource`, `bookingsCreatedCount`, `pendingBookingsCount`, `confirmedBookingsCount`, `cancelledBookingsCount`, `completedBookingsCount`, `totalFinalAmount`

**Summary response fields**: `dateFrom`, `dateTo`, `bookingSource` + all totals of the above counts/amounts

---

### Finance Analytics

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/internal/reports/finance/daily` | `dateFrom`, `dateTo`, `page`, `pageSize` | Daily finance analytics rows (paginated) |
| `GET` | `/api/internal/reports/finance/summary` | `dateFrom`, `dateTo` | Aggregate finance analytics summary |

**Daily response fields**: `metricDate`, `bookingsWithInvoiceCount`, `totalInvoicedAmount`, `totalPaidAmount`, `totalRemainingAmount`, `totalPendingPayoutAmount`, `totalScheduledPayoutAmount`, `totalPaidPayoutAmount`

**Summary response fields**: `dateFrom`, `dateTo` + all totals of the above

---

### Reviews Analytics

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/internal/reports/reviews/daily` | `dateFrom`, `dateTo`, `page`, `pageSize` | Daily reviews analytics rows (paginated) |
| `GET` | `/api/internal/reports/reviews/summary` | `dateFrom`, `dateTo` | Aggregate reviews analytics summary (weighted avg rating) |

**Daily response fields**: `metricDate`, `publishedReviewsCount`, `averageRating`, `reviewsWithOwnerReplyCount`, `reviewsWithVisibleOwnerReplyCount`

**Summary response fields**: `dateFrom`, `dateTo` + all totals + weighted `averageRating`

---

### Notifications Analytics

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/internal/reports/notifications/daily` | `dateFrom`, `dateTo`, `channel`, `page`, `pageSize` | Daily notifications analytics rows (paginated) |
| `GET` | `/api/internal/reports/notifications/summary` | `dateFrom`, `dateTo`, `channel` | Aggregate notifications analytics summary |

**Allowed `channel` values**: `in_app`, `email`, `sms`, `whatsapp`

**Daily response fields**: `metricDate`, `channel`, `notificationsCreatedCount`, `pendingNotificationsCount`, `queuedNotificationsCount`, `sentNotificationsCount`, `deliveredNotificationsCount`, `failedNotificationsCount`, `cancelledNotificationsCount`, `readNotificationsCount`

**Summary response fields**: `dateFrom`, `dateTo`, `channel` + all totals of the above

---

## 📦 Response Envelope

All API responses use a unified envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": null,
  "errors": null,
  "pagination": {
    "totalCount": 143,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

Error response:
```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": ["DateFrom must be on or before DateTo."],
  "pagination": null
}
```

---

## 🔑 Authorization Policy Reference

| Policy | Required Claim | Required Role(s) |
|---|---|---|
| `AdminAuthenticated` | `subjectType=admin` | Any admin role |
| `SuperAdminOnly` | `subjectType=admin` | `super_admin` |
| `SalesOrSuperAdmin` | `subjectType=admin` | `sales`, `super_admin` |
| `FinanceOrSuperAdmin` | `subjectType=admin` | `finance`, `super_admin` |
| `InternalAdminRead` | `subjectType=admin` | `super_admin`, `sales`, `finance` |
| `InternalAdminReadOwners` | `subjectType=admin` | `super_admin`, `sales`, `finance` |
| `InternalAnalyticsRead` | `subjectType=admin` | `super_admin`, `sales`, `finance`, `tech` |
| `OwnerOnly` | `subjectType=owner` | — |
| `ClientOnly` | `subjectType=client` | — |
