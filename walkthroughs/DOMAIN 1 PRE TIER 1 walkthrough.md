# PRE-T4-01: API Response Boundary & Sensitive-Field Exclusion Policy

## What Was Done

Created the architecture decision note [0002_api_response_boundary.md](file:///d:/Clinets/Remal/REMAL/docs/architecture/0002_api_response_boundary.md) as a mandatory pre-Tier 4 policy document.

## Document Contents

The note establishes **6 enforceable rules**:

| Rule | Summary |
|------|---------|
| **Rule 1** | Controllers MUST NOT return Data entities directly |
| **Rule 2** | Controllers MUST NOT serialize entity graphs directly |
| **Rule 3** | `PasswordHash` MUST NEVER appear in any Response DTO (zero exceptions) |
| **Rule 4** | `DeletedAt` is internal by default — admin exception only |
| **Rule 5** | `CreatedAt`/`UpdatedAt` exposure must be intentional per endpoint |
| **Rule 6** | Mapping responsibility belongs to the API layer, not Business layer |

### Sensitive Fields Inventoried

Based on analysis of all 5 current entities (`AdminUser`, `Client`, `Owner`, `Area`, `Amenity`):

- **Category A (NEVER exposed):** `PasswordHash` — found in `AdminUser`, `Client`, `Owner`
- **Category B (Internal by default):** `DeletedAt` — found in `Client`, `Owner`
- **Category C (Intentional only):** `CreatedAt`, `UpdatedAt` — found in all entities

### Additional Sections

- DTO naming convention: `{Action}{Entity}Request` / `{Entity}Response`
- DTO folder structure: `DTOs/Requests/` and `DTOs/Responses/`
- Tier 4 controller compliance checklist
- PR review checklist (7 verification points)
- Code examples showing forbidden vs. required patterns
- Cross-references to `tier1_followups.md` and technical spec

## Verification

| Criteria | Status |
|----------|--------|
| Document exists at `docs/architecture/0002_api_response_boundary.md` | ✅ |
| Explicitly forbids entity-returning controllers | ✅ Rule 1+2 |
| Explicitly forbids `PasswordHash` exposure | ✅ Rule 3 |
| Assigns DTO shaping responsibility to API layer | ✅ Rule 6 |
| Concise, enforceable, and actionable language | ✅ Uses "must"/"forbidden", not "prefer"/"should" |
| No code changes made | ✅ Documentation only |
| No DTO classes created | ✅ Out of scope |
| No Business service signatures modified | ✅ Out of scope |

## Files Changed

| File | Action |
|------|--------|
| [0002_api_response_boundary.md](file:///d:/Clinets/Remal/REMAL/docs/architecture/0002_api_response_boundary.md) | **Created** — 227 lines |

---

# PRE-T4-02: Area Lifecycle Semantics — Activation, Not Deletion

## What Was Done

Created the architecture decision note [0003_area_lifecycle_semantics.md](file:///d:/Clinets/Remal/REMAL/docs/architecture/0003_area_lifecycle_semantics.md) to resolve the ambiguity between the tech spec's `DELETE /api/areas/{id} → Soft delete` line and the actual implementation which uses `IsActive` toggling with no `DeletedAt` column.

## Key Decision

**Area uses activation/deactivation — not soft delete, not physical delete.**

| Aspect | Decision |
|--------|----------|
| Lifecycle mechanism | `IsActive` boolean toggle |
| API endpoint | `PATCH /api/areas/{id}/status` (replaces `DELETE`) |
| `DeletedAt` column | Does not exist — must not be added |
| Physical delete | Forbidden — breaks FK integrity |
| `DELETE /api/areas/{id}` | Not implemented — superseded by this ADR |

## Evidence Reviewed

All layers confirmed no soft-delete support for Area:

- **DB**: `0003_create_areas.sql` — no `deleted_at` column
- **Entity**: `Area.cs` — `IsActive` field, no `DeletedAt`
- **EF Config**: `AreaConfiguration.cs` — no global query filter
- **Service**: `AreaService.SetActiveAsync()` — activation toggle, no delete method
- **Interface**: `IAreaService` — no `DeleteAsync` in contract

## Verification

| Criteria | Status |
|----------|--------|
| Document exists at `docs/architecture/0003_area_lifecycle_semantics.md` | ✅ |
| Explicitly chooses one lifecycle behavior (activation) | ✅ |
| Aligned with current AreaService behavior | ✅ |
| Forbids hidden soft-delete reinterpretation | ✅ |
| Forbids physical delete | ✅ |
| Forbids inventing hidden lifecycle states | ✅ |
| No schema changes | ✅ |
| No service modifications | ✅ |

## Files Changed

| File | Action |
|------|--------|
| [0003_area_lifecycle_semantics.md](file:///d:/Clinets/Remal/REMAL/docs/architecture/0003_area_lifecycle_semantics.md) | **Created** — 147 lines |

---

# PRE-T4-03: IUnitOfWork Abstraction

## What Was Done

Introduced a minimal `IUnitOfWork` interface and updated all 6 Business services to depend on the abstraction instead of the concrete `UnitOfWork` class.

## Changes

### New File
- [IUnitOfWork.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Data/IUnitOfWork.cs) — Interface exposing 5 repository properties + `SaveChanges`/`SaveChangesAsync`

### Modified Files (1 Data + 6 Business)

| File | Change |
|------|--------|
| [UnitOfWork.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Data/UnitOfWork.cs) | Now implements `IUnitOfWork` |
| [AmenityService.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Services/AmenityService.cs) | `UnitOfWork` → `IUnitOfWork` |
| [AreaService.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Services/AreaService.cs) | `UnitOfWork` → `IUnitOfWork` |
| [AdminUserService.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Services/AdminUserService.cs) | `UnitOfWork` → `IUnitOfWork` |
| [AuthService.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Services/AuthService.cs) | `UnitOfWork` → `IUnitOfWork` |
| [ClientService.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Services/ClientService.cs) | `UnitOfWork` → `IUnitOfWork` |
| [OwnerService.cs](file:///d:/Clinets/Remal/REMAL/RentalPlatform.Business/Services/OwnerService.cs) | `UnitOfWork` → `IUnitOfWork` |

## Verification

| Criteria | Status |
|----------|--------|
| `IUnitOfWork.cs` exists | ✅ |
| `UnitOfWork` implements `IUnitOfWork` | ✅ |
| All 6 services depend on `IUnitOfWork` | ✅ |
| No concrete `UnitOfWork` references in Business services | ✅ |
| Build succeeded (0 errors, 0 warnings) | ✅ |
| No business logic changed | ✅ |

---

# PRE-T4-04: Solution Entrypoint Cleanup

## What Was Done

Cleaned up stale repository entrypoints to remove ambiguity and designated a single, official active solution document. Verified that legacy configurations (`REMAL.csproj`, `REMAL.sln`, a root `Program.cs`) do not exist or interfere with the current state.

## Key Actions

- Verified the exclusive presence of `RentalPlatform.slnx` as the primary cross-project solution.
- Confirmed the absence of stale or legacy `.sln` and `.csproj` misalignments at the repository root.
- Established `docs/setup/active_solution.md` to officially record build/run expectations and prevent AI or human reviewer confusion.

## Verification

| Criteria | Status |
|----------|--------|
| Only one active solution (`RentalPlatform.slnx`) remains | ✅ |
| `docs/setup/active_solution.md` describes the standard | ✅ |
| No misleading legacy entrypoints remain at the root | ✅ |
| Build using active solution (`dotnet build RentalPlatform.slnx`) | ✅ Succeeded |

---

# PRE-T4-05: Index Ownership Strategy (ADR-0004)

## What Was Done

Created the architecture decision note [0004_index_ownership_strategy.md](file:///d:/Clinets/Remal/REMAL/docs/architecture/0004_index_ownership_strategy.md) establishing clear rules regarding functional and partial unique indexes, eliminating future mismatches between source-of-truth SQL migrations and Entity Framework Core metadata.

## Key Actions

- Formally established raw SQL migrations (`db/migrations/*.sql`) as the authoritative source of truth for advanced indexing limits.
- Banned attempting to emulate advanced constraints (e.g., partial nullable uniqueness maps) inside EF metadata.
- Documented 3 currently running advanced uniqueness constraints targeting `AdminUser`, `Client`, and `Owner` emails.
- Specified ticket writing rules for clarity in future feature PRs (stating whether logic is mapped physically in SQL or locally in EF).

## Verification

| Criteria | Status |
|----------|--------|
| `docs/architecture/0004_index_ownership_strategy.md` exists | ✅ |
| Clear distinction between DB source of truth and EF limits | ✅ |
| Known examples (`AdminUser`, `Client`, `Owner`) documented | ✅ |
| Ticket writing notes established for future reference | ✅ |
| Migration drift avoided; zero code alterations introduced | ✅ |



