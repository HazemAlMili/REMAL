# REMAL Platform — Exact API Specification (Backend)

This document is a verbatim reflection of the current Controller implementations and exactly matches the Swagger UI (localhost) structure.

---

## 🔐 Auth (Authentication)
**Base Path**: `/api/Auth`
- `POST /client/register`: Register new client.
- `POST /client/login`: Validates phone/password for Clients.
- `POST /admin/login`: Validates email/password for Admins.
- `POST /owner/login`: Validates phone/password for Owners.
- `POST /refresh`: Refresh session token.
- `POST /logout`: Terminate session.

---

## 🏗️ Domain 1: Master Data

### AdminUsers 🔒 (`SuperAdminOnly`)
**Base Path**: `/api/admin-users`
- `GET /`: List all.
- `POST /`: Create new.
- `PATCH /{id}/role`: Update role.
- `PATCH /{id}/status`: Toggle active status.

### Amenities 🆓
**Base Path**: `/api/Amenities`
- `GET /`: List all (Anonymous).
- `POST /`: Create (SuperAdmin).

### Areas 📍
**Base Path**: `/api/Areas`
- `GET /`: List all (Anonymous).
- `GET /{id}`: Detail (Anonymous).
- `POST /`: Create (SuperAdmin).
- `PUT /{id}`: Update (SuperAdmin).
- `PATCH /{id}/status`: Toggle status (SuperAdmin).

### Clients 👤 (`SalesOrSuperAdmin`)
**Base Path**: `/api/Clients`
- `GET /`: List all.
- `GET /{id}`: Detail.

### Owners 🤝
**Base Path**: `/api/Owners`
- `GET /`: List (Admin Read Owners policy).
- `GET /{id}`: Detail (Admin Read Owners policy).
- `POST /`: Create (SuperAdmin).
- `PUT /{id}`: Update (SuperAdmin).
- `PATCH /{id}/status`: Toggle status (SuperAdmin).

---

## 🏡 Domain 2: Inventory & Units

### Units (Public & Admin Internal)
- `GET /api/units`: Public list.
- `GET /api/units/{id}`: Public detail.
- `GET /api/internal/units`: Admin full list.
- `POST /api/internal/units`: Create (SuperAdmin/Sales).
- `PUT /api/internal/units/{id}`: Update (SuperAdmin/Sales).
- `PATCH /api/internal/units/{id}/status`: Toggle status (SuperAdmin/Sales).

### Media (UnitImages)
- `GET /api/units/{unitId}/images`: Public list.
- `POST /api/internal/units/{unitId}/images`: Add image (SuperAdmin).
- `PUT /api/internal/units/{unitId}/images/reorder`: Reorder gallery (SuperAdmin).
- `PATCH /api/internal/units/{unitId}/images/{imageId}/cover`: Set cover (SuperAdmin).
- `DELETE /api/internal/units/{unitId}/images/{imageId}`: Remove image (SuperAdmin).

### Specs (UnitAmenities)
- `GET /api/units/{unitId}/amenities`: Public list.
- `POST /api/internal/units/{unitId}/amenities`: Assign (SuperAdmin).
- `DELETE /api/internal/units/{unitId}/amenities/{amenityId}`: Remove (SuperAdmin).
- `PUT /api/internal/units/{unitId}/amenities`: Replace all (SuperAdmin).

### Pricing & Availability 📅
- `POST /api/units/{unitId}/availability/operational-check`: JSON availability check for range.
- `POST /api/units/{unitId}/pricing/calculate`: Detailed price breakdown for range.
- **SeasonalPricing**:
  - `GET /api/internal/units/{unitId}/seasonal-pricing`: List.
  - `POST /api/internal/units/{unitId}/seasonal-pricing`: Create (SuperAdmin).
  - `PUT /api/internal/seasonal-pricing/{id}`: Update (SuperAdmin).
  - `DELETE /api/internal/seasonal-pricing/{id}`: Delete (SuperAdmin).
- **DateBlocks**:
  - `GET /api/internal/units/{unitId}/date-blocks`: List.
  - `POST /api/internal/units/{unitId}/date-blocks`: Create (SuperAdmin).
  - `PUT /api/internal/date-blocks/{id}`: Update (SuperAdmin).
  - `DELETE /api/internal/date-blocks/{id}`: Delete (SuperAdmin).

---

## 📅 Domain 3: Operations & CRM

### Bookings & Lifecycle 🔄
- **List/Action**:
  - `GET /api/internal/bookings`: List all.
  - `POST /api/internal/bookings`: Create manual.
  - `GET /api/internal/bookings/{id}`: Detail.
  - `PUT /api/internal/bookings/{id}`: Update pending.
  - `GET /api/internal/bookings/{id}/status-history`: Audit trail.
- **Lifecycle (Base: `/api/internal/bookings/{id}`)**:
  - `POST /confirm`: Confirm status.
  - `POST /cancel`: Cancel status.
  - `POST /complete`: Complete status.

### CRM Leads 📈
- `POST /api/crm/leads`: Public capture/inquiry.
- `GET /api/internal/crm/leads`: List.
- `GET /api/internal/crm/leads/{id}`: Detail.
- `PUT /api/internal/crm/leads/{id}`: Update.
- `PATCH /api/internal/crm/leads/{id}/status`: Set status.
- `POST /api/internal/crm/leads/{id}/convert-to-booking`: Convert inquiry to booking.

### CRM Support (Notes & Assignments)
- **Assignments**:
  - `GET /api/internal/bookings/{bookingId}/assignment`
  - `POST /api/internal/bookings/{bookingId}/assignment`
  - `DELETE /api/internal/bookings/{bookingId}/assignment`
  - `GET /api/internal/crm/leads/{leadId}/assignment`
  - `POST /api/internal/crm/leads/{leadId}/assignment`
  - `DELETE /api/internal/crm/leads/{leadId}/assignment`
- **Notes**:
  - `GET /api/internal/bookings/{id}/notes`
  - `POST /api/internal/bookings/{id}/notes`
  - `GET /api/internal/crm/leads/{id}/notes`
  - `POST /api/internal/crm/leads/{id}/notes`
  - `PUT /api/internal/crm/notes/{id}`
  - `DELETE /api/internal/crm/notes/{id}`
