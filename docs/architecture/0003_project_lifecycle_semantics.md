# ADR-0003: Project Lifecycle Semantics — Activation, Not Deletion

**Status:** APPROVED — Enforceable from Tier 4 onward  
**Created:** 2026-04-15  
**Ticket:** PRE-T4-02  
**Applies to:** `ProjectsController` and all Project-related API endpoints
**Supersedes:** Ambiguous "Soft delete" reference in `technical_req.md` §4 endpoint table

---

## The Ambiguity

The technical requirements document (§4, API endpoint table) lists:

```
DELETE  /api/projects/{id}  SuperAdmin  Soft delete
```

However, the **actual implementation** across all tiers tells a different story:

| Layer | Evidence | Supports Soft Delete? |
|-------|----------|-----------------------|
| **DB Schema** (`0003_create_projects.sql`) | `projects` table has **no `deleted_at` column** | ❌ No |
| **Entity** (`Project.cs`) | Fields: `Id`, `Name`, `Description`, `IsActive`, `CreatedAt`, `UpdatedAt` — **no `DeletedAt`** | ❌ No |
| **EF Configuration** (`ProjectConfiguration.cs`) | No global query filter for soft delete | ❌ No |
| **Business Interface** (`IProjectService.cs`) | Exposes `SetActiveAsync(id, isActive)` — no `DeleteAsync` method | ❌ No |
| **Business Service** (`ProjectService.cs`) | `SetActiveAsync` toggles `IsActive` flag — no delete logic exists | ❌ No |

**Conclusion:** The "Soft delete" label in the endpoint table is a spec-level shorthand that does not match the implemented architecture. Project lifecycle is governed by **activation/deactivation**, not deletion.

---

## Decision

### Project uses activation/deactivation — not soft delete, not physical delete.

"Removing" a project from active use means **setting `IsActive = false`**. The project record remains in the database with full historical integrity. There is no `DeletedAt` timestamp, no global query filter, and no delete operation.

### API Endpoint Semantics

The Tier 4 `ProjectsController` **must** expose an explicit activation/deactivation endpoint instead of a misleading `DELETE` endpoint:

```
PATCH  /api/projects/{id}/status    SuperAdmin    Activate or deactivate a project
```

**Request body:**
```json
{
  "isActive": false
}
```

**This replaces** the ambiguous `DELETE /api/projects/{id}` from the original endpoint table.

### Why PATCH /status instead of DELETE

| Approach | Problem |
|----------|---------|
| `DELETE /api/projects/{id}` that deactivates | Misleading — HTTP DELETE implies resource removal; consumers expect 404 after deletion |
| `DELETE /api/projects/{id}` that physically deletes | Destructive — destroys historical data; breaks FK integrity with units |
| `DELETE /api/projects/{id}` that soft deletes | Requires `DeletedAt` column that doesn't exist; requires global query filter that doesn't exist |
| **`PATCH /api/projects/{id}/status`** | **Honest** — communicates exactly what happens: a status change. Reversible. No ambiguity. |

---

## Established Facts

These facts are confirmed across all implemented tiers and are **not open for reinterpretation** in Tier 4:

1. **Project has no `DeletedAt`** — not in the DB schema, not in the entity, not in the EF configuration
2. **Business layer uses `IsActive`** — `ProjectService.SetActiveAsync(id, isActive)` is the only lifecycle toggle
3. **Deactivating a project does not erase it** — the project record, its name, description, and timestamps remain intact
4. **Deactivated projects are excluded from public listings by default** — `GetAllAsync(includeInactive: false)` filters them out
5. **Admin users can view deactivated projects** — `GetAllAsync(includeInactive: true)` returns everything
6. **Public API documentation in Tier 4 must reflect activation semantics** — no mention of "delete" in consumer-facing docs

---

## Tier 4 Endpoint Contract for Projects

Based on this decision, the complete Project endpoint set for Tier 4 is:

| Method | Endpoint | Role | Behavior |
|--------|----------|------|----------|
| `GET` | `/api/projects` | Public | List active projects (default); admin can include inactive via query param |
| `GET` | `/api/projects/{id}` | Public | Project details (returns 404 only if ID doesn't exist, not if inactive) |
| `POST` | `/api/projects` | SuperAdmin | Create project |
| `PUT` | `/api/projects/{id}` | SuperAdmin | Update project name/description/status |
| `PATCH` | `/api/projects/{id}/status` | SuperAdmin | Activate or deactivate project |

> **Note:** There is **no `DELETE /api/projects/{id}` endpoint**. Deactivation is the only supported "removal" mechanism.

---

## Do Not Do — Tier 4 Prohibitions

The following actions are **forbidden** during Tier 4 Project controller implementation:

### ❌ Do not add soft delete to Project

Do not add a `DeletedAt` property to the `Project` entity. Do not add a `deleted_at` column to the `projects` table. Do not add a global query filter for Project. The soft-delete mechanism is intentionally absent for master-data entities like Project.

### ❌ Do not perform physical delete in the Project controller

Do not call `_context.Projects.Remove()` or any equivalent. Physical deletion destroys referential integrity — units reference projects via FK, and historical bookings depend on project existence.

### ❌ Do not implement DELETE /api/projects/{id}

Do not create a `[HttpDelete]` endpoint for projects. Use `PATCH /api/projects/{id}/status` with `{ "isActive": false }` instead.

### ❌ Do not invent hidden lifecycle states

Project has exactly two states: **Active** and **Inactive**. Do not introduce "archived", "suspended", "pending approval", or any other intermediate state without a formal amendment to this decision.

### ❌ Do not reinterpret the tech spec DELETE line

The `DELETE /api/projects/{id} → Soft delete` line in `technical_req.md` §4 is superseded by this ADR. It was a spec-level shorthand that predates the implementation decisions made in Tier 1–3.

---

## Impact on Related Entities

This decision applies only to **Project**. Other entities have different lifecycle semantics:

| Entity | Lifecycle Mechanism | Has `DeletedAt`? |
|--------|-------------------|-----------------|
| **Project** | `IsActive` toggle (this ADR) | ❌ No |
| **Amenity** | `IsActive` toggle (same pattern) | ❌ No |
| **Owner** | Soft delete (`DeletedAt`) + `Status` field | ✅ Yes |
| **Client** | Soft delete (`DeletedAt`) + `IsActive` | ✅ Yes |
| **AdminUser** | `IsActive` toggle | ❌ No |

Master-data entities (Project, Amenity) use activation. User-facing entities with legal/financial history (Owner, Client) use soft delete. This distinction is intentional.

---

## Cross-References

- [ADR-0002: API Response Boundary](./0002_api_response_boundary.md) — Response DTO rules for Project endpoints
- [Tier 1 Follow-Ups](../review-followups/tier1_followups.md) — Project alignment tracking
- DB Migration: `0003_create_projects.sql` — Project table schema (no `deleted_at`)
- Entity: [Project.cs](file:///d:/Clinets/Kaza Booking/Kaza Booking/RentalPlatform.Data/Entities/Project.cs) — `IsActive` field, no `DeletedAt`
- Service: [ProjectService.cs](file:///d:/Clinets/Kaza Booking/Kaza Booking/RentalPlatform.Business/Services/ProjectService.cs) — `SetActiveAsync` method
- Interface: [IProjectService.cs](file:///d:/Clinets/Kaza Booking/Kaza Booking/RentalPlatform.Business/Interfaces/IProjectService.cs) — No delete method in contract
- Technical Spec: `technical_req.md` §4 — Original endpoint table (superseded for Project DELETE)

---

*This document is the authoritative source for Project lifecycle semantics. All Tier 4 Project endpoints must comply with this decision. The ambiguous "Soft delete" reference in the tech spec endpoint table is formally resolved by this ADR.*
