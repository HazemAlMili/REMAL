# ADR-0004: Index Ownership Strategy (Raw SQL vs EF Metadata)

**Status:** APPROVED — Enforceable for all Tier 4+ tickets  
**Created:** 2026-04-15  
**Ticket:** PRE-T4-05  
**Applies to:** Database indices, Constraints, Entity Framework Core Metadata  

---

## Context

Entity Framework Core (EF Core) allows configuring database indexes via its fluent API. However, PostgreSQL supports advanced indexing capabilities that EF Core metadata cannot natively or cleanly map without complex workarounds or provider-specific hacks. These include:

- **Functional indexes** (e.g., `LOWER(email)`)
- **Partial indexes** (e.g., `WHERE email IS NOT NULL`)

During Tier 1's raw DB migration and schema design, critical business rules were enforced effectively using these SQL features. Consequently, these indexes exist in the database but are not fully represented in the EF Core `EntityTypeConfiguration` classes.

## Decision: Source of Truth

**Raw SQL migrations (`db/migrations/*.sql`) remain the authoritative Source of Truth for functional and partial unique indexes.**

EF Core metadata (`RentalPlatform.Data/Configurations/*.cs`) exists to instruct the ORM object mapping and basic constraints. It is **not** required to completely mirror advanced physical indices. 

### Core Policies

1. **Do not create misleading or incomplete EF mappings**: Attempting to loosely document a Postgres partial index via a simple EF Core `HasIndex(x => x.Email)` creates a misleading constraint. For example, EF would mistakenly believe `NULL`s must be unique. 
2. **Accept missing EF metadata intentionally**: The absence of an advanced index definition inside the EF `EntityTypeBuilder` is expected behavior for functional/partial indexes.
3. **Database first for reviews**: When reviewing API endpoints, query behaviors, or validation rules that depend on uniqueness, reviewers must validate the behavior against the `db/migrations` SQL scripts, not just EF classes.

---

## Current Known Examples (DB-Only Advanced Indexes)

The following advanced indexes are managed exclusively by raw SQL migrations and purposely omitted/limited in EF metadata:

| Entity | Index Type | SQL Constraint Definition | DB Source Migration |
|--------|------------|---------------------------|---------------------|
| `AdminUser` | Functional | `CREATE UNIQUE INDEX ux_admin_users_email ON admin_users (LOWER(email))` | `0004_create_admin_users.sql` |
| `Client` | Partial + Functional | `CREATE UNIQUE INDEX ux_clients_email ON clients (LOWER(email)) WHERE email IS NOT NULL` | `0005_create_clients.sql` |
| `Owner` | Partial + Functional | `CREATE UNIQUE INDEX ux_owners_email ON owners (LOWER(email)) WHERE email IS NOT NULL` | `0006_create_owners.sql` |

Adding `builder.HasIndex(x => x.Email).IsUnique()` to any of the above EF Configurations is strictly **forbidden**, as it mischaracterizes the schema and breaks multi-null support.

---

## Future Ticket Writing Guidance

To prevent migration drift, missing validations, or silent overrides by future modifications (by developers or AI), any ticket touching database constraints must follow these rules:

1. **State the Index Scope**: If a future ticket designs a new table or constraint, the ticket MUST explicitly state whether the index will be "EF-Represented" (standard B-Tree, non-conditional) or "DB-Only" (functional/partial logic).
2. **Reference the SQL**: Any modifications or queries interacting with existing uniqueness rules must explicitly reference the DB source-of-truth migration script, rather than EF C# classes.
3. **Forbid Blind Resyncs**: Do not attempt to "fix" or "resync" EF Core metadata to match these advanced DB indexes. Doing so violates this ADR, creates migration drift, and pollutes EF snapshots.

---

*This document serves to cleanly sever false expectations of a 1:1 mirroring between EF Core index metadata and PostgreSQL schema optimization. It protects from unnecessary code churn aiming to "fix" something that is optimally established by design.*
