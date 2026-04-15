# Tier 2 Review Follow-Ups

**Document Status:** Active — Tracked  
**Created:** 2026-04-15  
**Last Updated:** 2026-04-15  
**Tier 2 Review Result:** PASS — READY FOR TIER 3 = YES  
**Tickets Covered:** DA-MD-01 through DA-MD-08, HF-T2-01, HF-T2-02

---

## Purpose

This document tracks all follow-up items identified during the Tier 2 (Data Access / Master Data) review, including two critical hotfixes that were required before granting Tier 3 readiness. Items marked as resolved were fixed in-tier. Items marked as pending carry forward into Tier 3 scope.

---

## A. AdminRole Enum-to-String Mapping Mismatch

### Status: 🟢 RESOLVED — Fixed via HF-T2-01

### Problem

The original `AdminUserConfiguration` used `HasConversion<string>()`, which serializes C# enum values using their member names:

```
SuperAdmin → "SuperAdmin"
Sales      → "Sales"
Finance    → "Finance"
Tech       → "Tech"
```

However, the frozen PostgreSQL `CHECK` constraint on `admin_users.role` only accepts:

```sql
CHECK (role IN ('super_admin', 'sales', 'finance', 'tech'))
```

Any `INSERT` or `UPDATE` on `admin_users` would fail at runtime with a CHECK constraint violation.

### Resolution

| Action | Detail |
|--------|--------|
| Created custom converter | `RentalPlatform.Data/Converters/AdminRoleValueConverter.cs` |
| Mapping direction (write) | `SuperAdmin → "super_admin"`, `Sales → "sales"`, `Finance → "finance"`, `Tech → "tech"` |
| Mapping direction (read) | `"super_admin" → SuperAdmin`, etc. Unknown values throw `ArgumentException` |
| Updated configuration | `AdminUserConfiguration.cs` now uses `.HasConversion(new AdminRoleValueConverter())` |
| Added max length | `.HasMaxLength(50)` on role column |

> [!IMPORTANT]
> Any future enum-to-DB mappings must use explicit `ValueConverter` classes. Never rely on `HasConversion<string>()` when the DB contract uses snake_case or non-PascalCase values.

### Cross-References

- Hotfix ticket: HF-T2-01
- Converter: [AdminRoleValueConverter.cs](../../RentalPlatform.Data/Converters/AdminRoleValueConverter.cs)
- Configuration: [AdminUserConfiguration.cs](../../RentalPlatform.Data/Configurations/AdminUserConfiguration.cs)
- DB constraint: [0004_create_admin_users.sql](../../db/migrations/0004_create_admin_users.sql)

---

## B. Owner `password_hash` Column Missing from DB Schema

### Status: 🟢 RESOLVED — Fixed via HF-T2-02

### Problem

The `Owner` entity in the Data Access layer included a `PasswordHash` property, and `OwnerConfiguration` mapped it to `password_hash`. However, the original `0006_create_owners.sql` migration did **not** include this column.

This meant any EF Core query or insert touching `Owner` would fail at runtime with a "column does not exist" error from PostgreSQL.

### Resolution

| Action | Detail |
|--------|--------|
| New migration created | `0009_add_owner_password_hash_to_owners.sql` |
| Column spec | `VARCHAR(255) NOT NULL` |
| Backfill strategy | Temporary `DEFAULT` placeholder hash applied, then default dropped immediately |
| Rollback script | `0009_..._rollback.sql` — `DROP COLUMN IF EXISTS password_hash` |
| Verify script | `0009_..._verify.sql` — checks type, length, nullability via `information_schema` |

> [!NOTE]
> The backfill strategy uses a dev-safe placeholder hash (`$2a$11$devplaceholder...`) to satisfy `NOT NULL` for any pre-existing seeded rows. This placeholder must **never** be treated as a valid credential in auth flows. Tier 3 `AuthService` must enforce that owners set real passwords before login is permitted.

### Cross-References

- Hotfix ticket: HF-T2-02
- Migration: [0009_add_owner_password_hash_to_owners.sql](../../db/migrations/0009_add_owner_password_hash_to_owners.sql)
- Rollback: [0009_add_owner_password_hash_to_owners_rollback.sql](../../db/migrations/0009_add_owner_password_hash_to_owners_rollback.sql)
- Verify: [0009_add_owner_password_hash_to_owners_verify.sql](../../db/migrations/0009_add_owner_password_hash_to_owners_verify.sql)
- Entity: [Owner.cs](../../RentalPlatform.Data/Entities/Owner.cs)
- Configuration: [OwnerConfiguration.cs](../../RentalPlatform.Data/Configurations/OwnerConfiguration.cs)
- Tier 1 follow-up resolved: [tier1_followups.md §A](tier1_followups.md) — Owner Authentication Schema Gap

---

## C. Root `Program.cs` Orphaned After Solution Restructure

### Status: 🟡 ADVISORY — Cleanup Recommended

### Problem

During early Tier 2 development, the root `Program.cs` (at `d:\Clinets\Remal\REMAL\Program.cs`) was used as a verification harness for smoke-testing entity mappings, soft-delete behavior, and repository operations. After the solution was restructured into the 4-project layout (`RentalPlatform.API`, `.Business`, `.Data`, `.Shared`), this root file became orphaned — it does not belong to any `.csproj`.

### Current State

The file currently contains only a comment indicating it is obsolete. It is not compiled and has no runtime impact.

### Recommended Action

| Option | Risk | Recommendation |
|--------|------|----------------|
| Delete the file | None | ✅ **Preferred** — remove dead artifact |
| Keep as-is | Low (confusion) | Acceptable if team prefers to retain history |

> [!TIP]
> If deleted, ensure version control retains the history. The verification logic it previously contained has been documented in the walkthrough and is no longer needed.

---

## D. Soft Delete Scope Boundary

### Status: 🟢 CONFIRMED — No Action Required

### Context

Soft delete behavior (converting `EntityState.Deleted` into a `DeletedAt` timestamp update) is intentionally limited to **two entities only**:

| Entity | Soft Delete | Query Filter |
|--------|-------------|--------------|
| Amenity | ❌ No | ❌ No |
| Area | ❌ No | ❌ No |
| AdminUser | ❌ No | ❌ No |
| Client | ✅ Yes | ✅ `DeletedAt == null` |
| Owner | ✅ Yes | ✅ `DeletedAt == null` |

### Why This Matters for Tier 3

- Business services for `Client` and `Owner` must account for the query filter. Use `.IgnoreQueryFilters()` explicitly when needing to access soft-deleted records (e.g., admin audit views).
- Business services for `Amenity`, `Area`, and `AdminUser` will perform **hard deletes** through `DbSet.Remove()`. If soft delete is ever needed for these entities, a new DB migration and configuration change must be created first.

> [!WARNING]
> Do **not** add soft-delete logic to `Amenity`, `Area`, or `AdminUser` in Tier 3 without a dedicated ticket and DB migration. The current schema does not include `deleted_at` columns for these tables.

---

## E. Repository / UnitOfWork Scope Boundary

### Status: 🟢 CONFIRMED — No Action Required

### Current Contract

The `UnitOfWork` exposes exactly five repositories:

```csharp
IRepository<Amenity>   Amenities
IRepository<Area>      Areas
IRepository<AdminUser> AdminUsers
IRepository<Client>    Clients
IRepository<Owner>     Owners
```

### Rules for Tier 3

| Rule | Detail |
|------|--------|
| No `SaveChanges` in Repository | All persistence is delegated via `UnitOfWork.SaveChangesAsync()` |
| No specialized repositories | Do not create `IClientRepository`, `IOwnerRepository`, etc. for master data |
| No future-tier repos in UnitOfWork | `Unit`, `Booking`, `Payment` repositories must **not** be added until their respective DA tickets are implemented |
| No business logic in Repository | Filtering, validation, and orchestration belong in `RentalPlatform.Business` services |

> [!CAUTION]
> When Tier 3 services need complex queries (e.g., filtered lists, joins), use `IRepository<T>.Query()` to build `IQueryable<T>` chains in the service layer. Do **not** add domain-specific methods to the generic `Repository<T>`.

---

## F. Enum Mapping Convention Established

### Status: 🟢 DOCUMENTED — Convention for Future Tiers

### Convention

Following the HF-T2-01 resolution, the project now follows this convention for all enum-to-DB string mappings:

1. Create a dedicated `ValueConverter` class in `RentalPlatform.Data/Converters/`
2. Map each enum member explicitly with a `switch` expression (both directions)
3. Throw on unknown values — no silent fallback
4. Apply via `.HasConversion(new XxxValueConverter())` in Fluent API configuration
5. Always add `.HasMaxLength()` matching the DB column constraint

**Do not use:**
- `HasConversion<string>()` — produces PascalCase, not snake_case
- `enum.ToString()` — same problem
- Attribute-based mapping — Fluent API is the canonical mechanism

### Applies To (Current)

| Enum | Converter | Entity |
|------|-----------|--------|
| `AdminRole` | `AdminRoleValueConverter` | `AdminUser.Role` |

### Applies To (Future — When Implemented)

Any future enums stored as `VARCHAR` in the DB must follow this same pattern.

---

## Summary — Impact Matrix

| Follow-Up | Severity | Status | Resolution |
|-----------|----------|--------|------------|
| AdminRole enum mapping | 🔴 Blocker | 🟢 Resolved | HF-T2-01 — custom ValueConverter |
| Owner password_hash missing | 🔴 Blocker | 🟢 Resolved | HF-T2-02 — supplemental migration 0009 |
| Orphaned root Program.cs | 🟡 Minor | 🟡 Advisory | Delete recommended |
| Soft delete scope | 🟢 Info | 🟢 Confirmed | Client + Owner only |
| Repository/UoW scope | 🟢 Info | 🟢 Confirmed | 5 master-data repos, no SaveChanges in repo |
| Enum mapping convention | 🟢 Info | 🟢 Documented | Explicit ValueConverter pattern |

---

## Rules for Tier 3 Implementation

> [!CAUTION]
> **The following rules carry forward from Tier 2 into all Tier 3 (Business) tickets:**
>
> 1. **USE** explicit `ValueConverter` classes for any enum stored as string in DB — never `HasConversion<string>()`
> 2. **DO NOT** add repositories for `Unit`, `Booking`, `Payment`, or other future entities to `UnitOfWork` until their DA tickets exist
> 3. **DO NOT** add `SaveChanges` calls inside `Repository<T>` — always go through `UnitOfWork`
> 4. **DO NOT** add soft-delete behavior to `Amenity`, `Area`, or `AdminUser` without a dedicated migration
> 5. **DO NOT** treat the placeholder `password_hash` on seeded owners as valid credentials — enforce real password creation
> 6. **ALWAYS** use `.IgnoreQueryFilters()` when business logic needs to access soft-deleted `Client` or `Owner` records
> 7. **DELETE** the orphaned root `Program.cs` before or during Tier 3 scaffolding

---

*This document is the single authoritative source for Tier 2 review follow-ups. All Tier 3 tickets must reference this document when touching enum mappings, repositories, soft-delete behavior, or owner authentication.*
