# Tier 1 Review Follow-Ups

**Document Status:** Active — Tracked  
**Created:** 2026-04-14  
**Last Updated:** 2026-04-14  
**Tier 1 Review Result:** PASS — READY FOR TIER 2 = YES  
**Ticket:** BZ-MD-RM-01

---

## Purpose

This document tracks all follow-up items identified during the Tier 1 (Database) review that can impact Tier 2 (Data Access) and Tier 3 (Business) implementation quality. These items are **not blockers** for Tier 3 startup but must be explicitly acknowledged and resolved before the relevant features are implemented.

---

## A. Owner Authentication Schema Gap

### Status: 🔴 BLOCKED — Pending Requirement / Schema Resolution

### Problem

The technical requirements document (`technical_req.md`) specifies:

- `POST /api/auth/owner/login` — a public endpoint for owner authentication (line 251)
- `OwnerPortalController.cs` — a dedicated controller for owner-facing portal (line 225)
- 3 separate JWT token types: `client_token / admin_token / owner_token` (line 326)

However, the **current `owners` table** (migration `0006_create_owners`) does **NOT** contain a `password_hash` column. The owners schema was designed as a CRM/finance entity, not an authenticated user entity:

```sql
-- Current owners columns:
id, name, phone, email, commission_rate, notes, status,
created_at, updated_at, deleted_at
-- ❌ password_hash is MISSING
```

In contrast, both `admin_users` and `clients` tables include `password_hash VARCHAR(255) NOT NULL`.

### Impact

| Component | Blocked? | Why |
|-----------|----------|-----|
| `AuthService.cs` — owner login flow | ✅ **YES** | No password_hash to verify against |
| `OwnerPortalController.cs` | ✅ **YES** | Cannot authenticate owners |
| Owner JWT token generation | ✅ **YES** | No login = no token |
| Owner CRUD (admin-managed) | ❌ No | Works without auth — admin creates owners |
| Owner earnings/payouts queries | ❌ No | Admin-facing, not owner-facing |

### Decision Required

> [!CAUTION]
> **Do NOT implement owner login/auth silently.** A separate DB migration ticket must be created and approved to add `password_hash` to the `owners` table before any owner authentication code is written.

**Options for resolution:**

1. **Add `password_hash`** to `owners` table via a new DB migration (e.g., `0009_add_owners_password_hash`)
2. **Defer owner portal** entirely to a later phase and remove `/api/auth/owner/login` from MVP scope
3. **Create a separate `owner_credentials`** table if owners should remain decoupled from auth concerns

**Current ruling:** Owner auth is **out of scope** for all Tier 3 business tickets until this follow-up is explicitly resolved with a dedicated DB ticket.

### Cross-References

- DB Migration: [0006_create_owners.sql](../db/migrations/0006_create_owners.sql) — no `password_hash`
- Tech Spec: `technical_req.md` line 251 — `POST /api/auth/owner/login`
- Tech Spec: `technical_req.md` line 326 — `owner_token` type
- Tech Spec: `technical_req.md` line 225 — `OwnerPortalController.cs`
- Business Spec: `business_req.md` line 29 — Owner persona: "يشوف بس: availability، حجوزاته، أرباحه"

---

## B. Amenities ERD Naming Mismatch

### Status: 🟢 RESOLVED — Canonical Source Documented

### Problem

In some early ERD/design drafts, the amenities entity was referred to using alternative names:

- `guest` / `unit_guest` (ERD draft artifact)

This creates potential confusion when future developers or AI agents reference different naming sources.

### Resolution

The **canonical naming** for the implementation is:

| Concept | Canonical Table Name | Canonical Entity Name |
|---------|---------------------|----------------------|
| Amenities master list | `amenities` | `Amenity` |
| Unit-amenity join table | `unit_amenities` (future) | `UnitAmenity` |

**Authoritative sources (in priority order):**

1. **DB migrations** (Tier 1) — `0002_create_amenities.sql` → table is `amenities`
2. **Technical requirements** — `technical_req.md` line 107-109 → entity is `Amenity.cs` / `UnitAmenity.cs`
3. **Migration order** — `technical_req.md` line 26 → `amenities (no deps)`, line 33 → `unit_amenities (→ units, amenities)`

> [!IMPORTANT]
> Any reference to `guest`, `unit_guest`, or `guest_amenity` in legacy ERD artifacts is **superseded** by the canonical names above. All future tickets must use `amenities` / `unit_amenities` exclusively.

---

## C. Scaffold Alignment

### Status: 🟡 PENDING — Alignment Required Before Tier 2

### Current State

| Aspect | Technical Spec (Frozen) | Current Reality |
|--------|------------------------|-----------------|
| Target Framework | .NET (implied latest stable) | `net10.0` ✅ |
| Project Type | 4-project solution | Single console app ❌ |
| Solution Name | `RentalPlatform.sln` | No `.sln` file ❌ |
| Project Names | `RentalPlatform.Shared`, `.Data`, `.Business`, `.API` | Single `REMAL.csproj` ❌ |
| SDK Type | `Microsoft.NET.Sdk.Web` (for API) | `Microsoft.NET.Sdk` (console) ❌ |

### Required 4-Project Layout (from `technical_req.md` §3)

```
RentalPlatform.sln
├── RentalPlatform.Shared/    → Enums, Constants, Helpers
├── RentalPlatform.Data/      → EF Core, Entities, Repositories, UnitOfWork
├── RentalPlatform.Business/  → Services, Validators, Interfaces
└── RentalPlatform.API/       → Controllers, DTOs, Middleware, Program.cs
```

### Decision Log

| Decision | Status | Notes |
|----------|--------|-------|
| Target framework = `net10.0` | ✅ Confirmed | Already set in `REMAL.csproj` |
| Solution rename to `RentalPlatform.sln` | 📋 Pending | Must occur before Tier 2 scaffolding |
| 4-project split | 📋 Pending | Must be executed as a dedicated scaffolding ticket |
| Current `REMAL.csproj` + `Program.cs` | 🔄 Will be replaced | These are placeholder artifacts from initial repo setup |

> [!WARNING]
> The current project structure (`REMAL.csproj` as a single console app) is **not aligned** with the frozen technical spec. A dedicated scaffolding ticket must restructure the solution into the 4-project layout **before** any Tier 2 (Data) or Tier 3 (Business) code is written. Writing EF entities or services into the current single-project structure will create migration debt.

---

## Summary — Impact Matrix

| Follow-Up | Severity | Blocks | Resolution Path |
|-----------|----------|--------|-----------------|
| Owner auth schema gap | 🔴 High | Owner login, portal, JWT | New DB migration ticket |
| Amenities naming | 🟢 Resolved | Nothing | Documented above |
| Scaffold alignment | 🟡 Medium | Tier 2/3 code placement | Scaffolding ticket |

---

## Rules for Tier 3 Implementation

> [!CAUTION]
> **The following rules are mandatory for all Tier 3 (Business) tickets:**
>
> 1. **NO** owner login/auth implementation until follow-up A is resolved with an approved DB ticket
> 2. **NO** silent `password_hash` addition to the owners entity or DB schema
> 3. **NO** workaround code in `AuthService` that skips owner password verification
> 4. **NO** use of `guest`/`unit_guest` naming — always use `amenities`/`unit_amenities`  
> 5. **NO** business services written into the current single-project structure — wait for scaffold alignment

---

*This document is the single authoritative source for Tier 1 review follow-ups. All Tier 3 tickets must reference this document when touching auth, amenities, or project structure.*
