# ADR-0002: API Response Boundary & Sensitive-Field Exclusion Policy

**Status:** APPROVED — Enforceable from Tier 4 onward  
**Created:** 2026-04-15  
**Ticket:** PRE-T4-01  
**Applies to:** All `RentalPlatform.API` controllers and endpoints  
**Supersedes:** Nothing — this is the first API boundary policy

---

## Context

Tier 3 (Business layer) services return **full Data entities** (e.g., `Owner`, `Client`, `AdminUser`). This is by design — the Business layer operates on persistence models and should not be aware of API contracts.

However, multiple entities contain **security-critical fields** that must never reach an API consumer:

| Entity | Sensitive Field | Risk if Exposed |
|--------|----------------|-----------------|
| `AdminUser` | `PasswordHash` | Credential leak — attacker can brute-force offline |
| `Client` | `PasswordHash` | Credential leak — attacker can brute-force offline |
| `Owner` | `PasswordHash` | Credential leak — attacker can brute-force offline |
| `Client` | `DeletedAt` | Reveals soft-delete internals to public consumers |
| `Owner` | `DeletedAt` | Reveals soft-delete internals to public consumers |

If controllers return entities directly, **all of these fields will be serialized into JSON responses by default**. This is an unacceptable security risk and a public API contract violation.

---

## Decision

### Rule 1: Controllers MUST NOT return Data entities directly

Every controller action in `RentalPlatform.API` **must** return an explicit Response DTO class. Returning a `RentalPlatform.Data.Entities.*` object — or any object from the Business/Data layer — directly from a controller is **forbidden**.

```csharp
// ❌ FORBIDDEN — entity returned directly
[HttpGet("{id}")]
public async Task<ActionResult<Owner>> GetOwner(Guid id)
{
    var owner = await _ownerService.GetByIdAsync(id);
    return Ok(owner); // LEAKS PasswordHash, DeletedAt
}

// ✅ REQUIRED — explicit Response DTO
[HttpGet("{id}")]
public async Task<ActionResult<OwnerResponse>> GetOwner(Guid id)
{
    var owner = await _ownerService.GetByIdAsync(id);
    return Ok(MapToResponse(owner)); // Only approved fields
}
```

### Rule 2: Controllers MUST NOT serialize entity graphs directly

Returning an entity that has navigation properties (e.g., `Owner.Units`, `Client.Bookings`) will serialize the **entire object graph**, leaking nested entities and their sensitive fields. This is forbidden.

```csharp
// ❌ FORBIDDEN — entity graph serialization
return Ok(booking); // Serializes Booking → Client → PasswordHash

// ✅ REQUIRED — flat or explicitly shaped DTO
return Ok(new BookingDetailResponse { ... }); // Only declared fields
```

### Rule 3: PasswordHash MUST NEVER appear in any Response DTO

No Response DTO class may declare, include, or inherit a `PasswordHash` property. This rule has **zero exceptions**. There is no admin use-case, no debug endpoint, and no internal API that justifies exposing password hashes.

**Entities affected:**
- `AdminUser.PasswordHash`
- `Client.PasswordHash`
- `Owner.PasswordHash`

### Rule 4: DeletedAt is internal by default

`DeletedAt` must **not** appear in public-facing Response DTOs. It may only be exposed in an admin-facing DTO if a specific, documented use-case explicitly requires it (e.g., an admin "view deleted records" feature). In that case, the DTO must be a separate admin-scoped class, not the default response.

### Rule 5: CreatedAt / UpdatedAt exposure must be intentional

These timestamp fields must not be included in Response DTOs automatically. Each endpoint must make a deliberate decision:

| Scenario | Include `CreatedAt`? | Include `UpdatedAt`? |
|----------|---------------------|---------------------|
| Public listing (e.g., areas, units for end users) | No | No |
| Admin detail view (e.g., owner profile for admin) | Yes — useful for audit | Yes — useful for audit |
| Client-facing booking detail | Yes — when created | No — internal |

The decision must be made **per endpoint**, not per entity.

### Rule 6: Mapping responsibility belongs to the API layer

The Business layer returns entities. The API layer maps them to DTOs. This boundary is **non-negotiable**.

```
┌─────────────────────┐
│  RentalPlatform.API  │  ← Owns Response DTOs + Request DTOs
│                      │  ← Owns entity→DTO mapping
│  Controllers/        │  ← Maps entity to Response DTO before returning
│  DTOs/Requests/      │  ← Defines what comes IN
│  DTOs/Responses/     │  ← Defines what goes OUT
└──────────┬───────────┘
           │ calls
┌──────────▼───────────┐
│ RentalPlatform.Business │  ← Returns Data entities
│                          │  ← Does NOT know about DTOs
│  Services/               │  ← Does NOT shape API responses
└──────────┬───────────────┘
           │ uses
┌──────────▼───────────┐
│  RentalPlatform.Data  │  ← Entities, DbContext, Repositories
└───────────────────────┘
```

**Business services must NOT:**
- Reference any type from `RentalPlatform.API`
- Return DTOs, ViewModels, or API-shaped objects
- Be modified to "hide" fields — that is the API layer's job

---

## Forbidden Fields — Default Exclusion List

The following fields are **forbidden by default** from all outward-facing Response DTOs unless an explicit, documented exception exists:

### Category A: NEVER exposed (zero exceptions)

| Field | Entities | Reason |
|-------|----------|--------|
| `PasswordHash` | `AdminUser`, `Client`, `Owner` | Security — credential material |

### Category B: Internal by default (admin exception possible)

| Field | Entities | Reason |
|-------|----------|--------|
| `DeletedAt` | `Client`, `Owner` (and future soft-deletable entities) | Internal persistence mechanism |

### Category C: Intentional exposure only

| Field | Entities | Reason |
|-------|----------|--------|
| `CreatedAt` | All entities | Not useful for most public endpoints |
| `UpdatedAt` | All entities | Internal tracking — rarely needed by consumers |

---

## Tier 4 Controller Rules

Every controller and endpoint implemented in Tier 4 **must** comply with the following checklist:

### Mandatory

- [ ] **Never return an entity directly** — always return a Response DTO
- [ ] **Never serialize an entity graph** — always map to a flat or explicitly nested DTO
- [ ] **Always map to a Response DTO** — mapping happens in the controller or a dedicated mapping method
- [ ] **Verify no `PasswordHash`** exists in any Response DTO class
- [ ] **Verify no `DeletedAt`** in public-facing Response DTOs unless explicitly justified

### Request DTOs

- [ ] Request payloads must use explicit Request DTO classes
- [ ] Request DTOs must not accept `Id`, `CreatedAt`, `UpdatedAt`, `DeletedAt`, or `PasswordHash`
- [ ] Server-generated fields (Id, timestamps) are set by the service/repository, never accepted from the client

### Naming Convention

Response and Request DTOs must follow this naming pattern:

```
DTOs/
├── Requests/
│   ├── CreateOwnerRequest.cs
│   ├── UpdateOwnerRequest.cs
│   ├── CreateAreaRequest.cs
│   └── ...
└── Responses/
    ├── OwnerResponse.cs
    ├── OwnerListItemResponse.cs
    ├── AreaResponse.cs
    ├── ClientResponse.cs
    └── ...
```

**Pattern:**
- Request DTOs: `{Action}{Entity}Request`  — e.g., `CreateOwnerRequest`, `UpdateAreaRequest`, `LoginAdminRequest`
- Response DTOs: `{Entity}Response` — e.g., `OwnerResponse`, `AreaResponse`
- List-optimized DTOs: `{Entity}ListItemResponse` — e.g., `OwnerListItemResponse` (fewer fields for list endpoints)
- All DTOs live in `RentalPlatform.API/DTOs/Requests/` and `RentalPlatform.API/DTOs/Responses/`

---

## Review Checklist for Tier 4 PRs

Every Tier 4 pull request or code review must verify:

1. **No controller returns a type from `RentalPlatform.Data.Entities`**
2. **No controller returns a type from `RentalPlatform.Business`**
3. **No Response DTO contains `PasswordHash`**
4. **No public Response DTO contains `DeletedAt`**
5. **`CreatedAt`/`UpdatedAt` are only present when the endpoint explicitly needs them**
6. **No `[JsonIgnore]` used as a substitute for proper DTO design** — if you need to hide a field, you need a DTO that never had it
7. **Mapping code lives in the API layer**, not in Business services

---

## Rationale

| Without this policy | With this policy |
|---------------------|-----------------|
| `PasswordHash` leaked in JSON responses | `PasswordHash` never leaves the server |
| API contract mirrors persistence schema — breaks on DB refactor | API contract is decoupled — DB can evolve independently |
| Tight coupling between API consumers and internal models | Loose coupling — DTOs are the public contract |
| Accidental exposure of `DeletedAt`, soft-delete internals | Internal fields hidden by design |
| Navigation properties serialize full object graphs | Flat, intentional response shapes |

---

## Cross-References

- [Tier 1 Follow-Ups](../review-followups/tier1_followups.md) — Owner `PasswordHash` schema gap (now resolved via migration 0009)
- Technical Spec: `technical_req.md` §3 — Project structure defines `DTOs/Requests/` and `DTOs/Responses/` in `RentalPlatform.API`
- Technical Spec: `technical_req.md` §10 — Unified response envelope format
- Business Spec: `business_req.md` §2 — User personas and access restrictions

---

*This document is the authoritative source for API response boundary rules. All Tier 4 tickets must reference and comply with this policy. No exceptions without an explicit, approved amendment to this document.*
