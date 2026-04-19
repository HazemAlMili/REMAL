# Domain 3 Tier 4 — Booking & CRM API Walkthrough

---

## Overview

This tier establishes the official API surface for the Booking & CRM domain. It provides a hardened, validated, and role-authorized gateway for managing the complete booking lifecycle and the CRM sales pipeline. All operations strictly adhere to the frozen business rules from Tier 3, utilizing explicit DTO boundaries and secure actor identification.

**Build**: ✅ 0 errors, 0 warnings  
**QA Review**: PASSED  
**PM Decision**: GO

---

## API-BC-01: DTO Contracts & Validators

### Explicit Contracts
Implemented 21+ DTO classes to maintain an absolute barrier between the database entities and the network output.
- **Requests**: `CreateBookingRequest`, `PublicCreateCrmLeadRequest`, `AssignBookingRequest`, `AddBookingNoteRequest`, etc.
- **Responses**: `BookingDetailsResponse`, `CrmLeadDetailsResponse`, `CrmNoteResponse`, `CrmAssignmentResponse`, etc.

### Validation Engine
Integrated **FluentValidation** with automatic discovery in `Program.cs`. 
- **Safety**: Every incoming request is validated for string length, date logic, and domain-specific bounds before reaching the controller logic.

---

## API-BC-02: BookingsController (Internal Management)

**Endpoint Group**: `/api/internal/bookings`

| Action | Route | Authorization | Behavior |
|--------|-------|---------------|----------|
| **List** | `GET /` | `InternalAdminRead` | Paginated listing with status/owner filters. |
| **Detail** | `GET /{id}` | `InternalAdminRead` | Full booking details. |
| **History** | `GET /{id}/status-history` | `InternalAdminRead` | Retrieval of the audit audit status changes. |
| **Create** | `POST /` | `SalesOrSuperAdmin` | Manual internal booking creation. |
| **Update** | `PUT /{id}` | `SalesOrSuperAdmin` | Limited updates for `pending` bookings only. |

---

## API-ACC-03: BookingLifecycleController (Atomic Transitions)

**Endpoint Group**: `/api/internal/booking-lifecycle`

This controller isolates high-impact status mutations from standard CRUD.

- **POST `/confirm`**: Transitions `pending/inquiry` to `confirmed`.
- **POST `/cancel`**: Transitions to `cancelled`.
- **POST `/complete`**: Transitions `confirmed` to `completed`.

**Security**: The `AdminId` for these actions is automatically extracted from the authenticated JWT claims (`NameIdentifier`), preventing identity spoofing in the request body.

---

## API-BC-04: CrmLeadsController (Public & Internal)

### Public Surface
- **POST `/api/crm/leads`**: `AllowAnonymous` endpoint for website inquiries. 
- **Safety**: Strictly nullifies any caller-provided `AssignedAdminUserId` to prevent unauthorized internal assignments.

### Internal Surface
- **Status Patch**: `PATCH /api/internal/crm/leads/{id}/status` for funnel progression.
- **Conversion**: `POST /api/internal/crm/leads/{id}/convert-to-booking` — an atomic action that creates a booking and transitions the lead status to `converted`. Returns `BookingDetailsResponse`.

---

## API-BC-05: CrmNotesController

**Endpoint Group**: `/api/internal/crm/notes` and nested routes.

- **Nested Access**: `/api/internal/bookings/{bookingId}/notes` and `/api/internal/crm/leads/{leadId}/notes`.
- **Operations**: Internal support for Adding, Retrieving, Updating, and Deleting (physical) notes.
- **Audit**: Note creator is automatically tracked via JWT context.

---

## API-BC-06: CrmAssignmentsController

**Endpoint Group**: `/api/internal/bookings/{bookingId}/assignment` and nested routes.

- **Ownership Management**: Dedicated endpoints for `GET`, `POST` (Assign), and `DELETE` (Clear).
- **Semantics**: Strictly enforces the "one-active-assignment" rule via the `ICrmAssignmentService`.

---

## Final Verification Summary

| Check | Result |
|-------|--------|
| **Solution Builds** | ✅ 0 errors, 0 warnings |
| **DTO Boundary** | ✅ 0 Entities leaked |
| **Authorized Roles** | ✅ Finance read-only; Sales/SA mutation |
| **Lifecycle Actor** | ✅ Claims-derived AdminId |
| **Public Anonymity** | ✅ Lead capture verified |
| **Lead Conversion** | ✅ Valid Booking response returned |
| **PM GO Decision** | ✅ |

---
