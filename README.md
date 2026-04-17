# Rental Platform — Comprehensive Development Walkthroughs

This README serves as the master compilation of all architectural phases, database migrations, data access layers, business logic boundaries, and API integrations developed for the Rental Platform. It is divided into two primary domains: **Domain 1 (Master Data & Authentication)** and **Domain 2 (Units & Availability)**.

---

## Table of Contents

### Domain 1: Master Data & Authentication
1. [Tier 1: Database Migrations](#domain-1-tier-1-database-migrations)
2. [Tier 2: Data Access (EF Core)](#domain-1-tier-2-data-access-ef-core)
3. [Tier 3: Business Logic](#domain-1-tier-3-business-logic)
4. [Pre-Tier 4: Architecture Decisions](#pre-tier-4-architecture-decisions)
5. [Tier 4: API & JWT Authentication](#domain-1-tier-4-api--jwt-authentication)

### Domain 2: Units & Availability
6. [Tier 1: Database Migrations](#domain-2-tier-1-database-migrations)
7. [Tier 2: Data Access (EF Core)](#domain-2-tier-2-data-access-ef-core)
8. [Tier 3: Business Logic](#domain-2-tier-3-business-logic)
9. [Tier 4: API Layer](#domain-2-tier-4-api-layer)

---

## Domain 1, Tier 1: Database Migrations

### DB-MD-01: Initialize PostgreSQL Base Conventions
Foundational migration to enable `pgcrypto` extension and document all frozen DB conventions for the Rental Platform's master data tier.
- **Primary Keys:** `UUID DEFAULT gen_random_uuid()`
- **Naming:** `snake_case` for tables, columns, constraints
- **Timestamps:** No DB triggers. Managed by application.
- **Money:** `DECIMAL(12,2)`

### DB-MD-02 to DB-MD-06: Core Master Tables
Created the primary master tables enforcing rigorous constraints, unique partial indexes for emails, and strict domain boundaries (no soft delete for admins, explicit soft deletes for clients/owners):
- `amenities` (Unique names)
- `areas` (Unique names, Activation flags)
- `admin_users` (Role check constraints, Case-insensitive unique emails)
- `clients` (Unique phones, Soft delete limits)
- `owners` (Commission rate boundaries 0-100%, Soft limits)

### DB-MD-07 & DB-MD-08: Integrity & Seeding
- Validated primary key normalization (`pk_{table}`).
- Seeded minimal secure dev data natively utilizing BCrypt factor 12 strings, safely allowing idempotency on duplicate executions.

---

## Domain 1, Tier 2: Data Access (EF Core)

### DA-MD-01: AppDbContext Foundation
Configured `AppDbContext` injecting automated Timestamp & Soft-delete interception cleanly inside `SaveChanges()` translating natively toward Database limits.

### DA-MD-02 to DA-MD-06: Entity Configurations
- Bound strict schema settings generating `HasMaxLength`, `IsUnique` definitions.
- Configured Global Query Filters (`.HasQueryFilter(x => x.DeletedAt == null)`) for Client and Owner visibility isolation.
- Decoupled Enums by injecting `.HasConversion<string>()`.

### DA-MD-07 & DA-MD-08: Generic Repositories & UnitOfWork
- Implemented pure `IRepository<T>` abstractions handling `Get`, `Add`, `Delete` actions safely.
- Wrapped operations purely inside `UnitOfWork` preventing context leaking avoiding disparate generic context updates effectively limiting execution logic correctly.

---

## Domain 1, Tier 3: Business Logic

### BZ-MD-01: Contracts and Exceptions
Unified exceptions mapping natively to Domain expectations (`BusinessValidationException`, `NotFoundException`, `ConflictException`, `UnauthorizedBusinessException`).

### BZ-MD-02 to BZ-MD-05: Service Implementations
Engineered strictly bounded master logic:
- Blocked spaces and casing duplicates effectively mapping unique boundaries safely.
- Implemented soft-deletion safely via standard visibility toggles.
- Executed BCrypt masking securely over Client and Owner validations shielding hash persistence completely mapping configurations independently.

### BZ-MD-06: AuthService Validation Logic
Processed native credential integrations cleanly returning structured `AuthenticatedSubject` outputs avoiding premature token generation logic explicitly.

---

## Pre-Tier 4: Architecture Decisions

Established key governance checks prior to opening external network ports:
- **API Response Boundary:** Banned raw Database Entities leaving controllers, restricted `PasswordHash` definitively, structured `DTO` mappings.
- **Area Lifecycle:** Swapped soft-deletions conceptually out for standard `.IsActive` activation toggles preventing missing constraint chains definitively.
- **UnitOfWork Interfaces:** Bound abstraction boundaries solidly eliminating raw EF structures bleeding into domain logics.
- **Index Ownership:** Officially delegated heavy uniqueness checks to DB SQL scripts avoiding soft EF Core emulation risks purely.

---

## Domain 1, Tier 4: API & JWT Authentication

### API Foundation
Created standardized `ApiResponse<T>` envelopes wrapping structures cleanly across validation boundaries automating error catching efficiently inside `ExceptionHandlingMiddleware`. 

### Auth & Token Management
Generated generic `JwtTokenService` generating HS256 JWTs alongside strictly locked (`HttpOnly`, `SameSite=Strict`) refresh variables securing browser execution streams cleanly across Endpoints (`/api/auth/`).

### Resource Controllers
Constructed endpoint clusters enforcing `[Authorize]` mappings securely shielding resources properly allowing strictly constrained RBAC rules (Roles: `Sales`, `Finance`, `SuperAdmin`).

---

## Domain 2, Tier 1: Database Migrations

### DB-UA-01 & DB-UA-02: Units & Unit Images
Created the inventory anchor `units` applying foreign constraints scaling properly mapping relationships to owners and areas structurally. Ensured relational media blocks dynamically matching cascades across `unit_images`.

### DB-UA-03: Unit Amenities
Applied strict many-to-many composites avoiding surrogate identity wrappers securing database unique linkings natively via composite primary key constraints.

### DB-UA-04 & DB-UA-05: Operational Seasonal Configurations
Secured explicitly mapped pricing arrays bounding ranges logically. Maintained structural configurations across `seasonal_pricing` and `date_blocks` explicitly deferring complex chronological overlap validations intentionally to the Business Logic algorithms avoiding trigger bloat inside the database tier.

---

## Domain 2, Tier 2: Data Access (EF Core)

Extended `AppDbContext` allocating `DbSets` wrapping constraints matching Schema arrays identically:
- Restricted `UnitType` and monetary limits utilizing `.HasColumnType("decimal(12,2)")`.
- Established `DeleteBehavior.Cascade` matching relationships mapped by tier exactly preventing orphan states.
- Bound composite endpoints cleanly over `UnitAmenities` mapping EF safely.

---

## Domain 2, Tier 3: Business Logic

### Unit, Media, & Links 
Engineered exact data operations providing relational checking efficiently throwing `NotFoundException`s against blind IDs natively tracking states safely tracking single-cover implementations eliminating CDN configurations actively.
- Native `ReplaceAllAsync` algorithms check delta arrays seamlessly intersecting `UnitAmenities` independently natively.

### Deterministic Overlap Preventions
Bounded configurations verifying overlapping limits natively across:
- **`SeasonalPricingService`**
- **`DateBlockService`**
Blocking identically checking explicit combinations natively generating bounds safely preventing chronological collisions exactly (`startDate <= DB.EndDate && endDate >= DB.StartDate`).

### Agnostic Availability Queries (`UnitAvailabilityService`)
Calculated operational representations filtering `DateBlock`s computing structural constraints resolving nightly sequences seamlessly bypassing booking metrics extracting arrays formatted accurately into Base vs Seasonal structures calculating exact total representations dynamically natively securely!

---

## Domain 2, Tier 4: API Layer

### API-UA-01: DTO Contracts & Validators
Constructed explicitly mapped Request and Response shapes (e.g., `UnitListItemResponse`, `UnitPricingResponse`) to maintain an absolute barrier against EF Core entities bleeding into HTTP outputs. Implemented rigorous `FluentValidation` patterns enforcing string safety, positive numbers, and correct data combinations across the domain.

### API-UA-02: UnitsController
Formed distinct operational read paths partitioning unauthenticated Public queries (filtering down exclusively to active units) apart from authentic `Sales` analytics and `SuperAdmin` structural mapping functions (`POST`, `PATCH /status`), natively preventing unauthorized mutations.

### API-UA-03: UnitImagesController
Safely isolated ordinal display tracking and metadata tagging (like `isCover`) avoiding complex raw binary upload logic bleeding into the metadata pipeline loops. Provided safe 404 blockades preventing offline-unit access visually.

### API-UA-04: UnitAmenitiesController
Simplified relation assignments (`AssignAsync`, `ReplaceAllAsync`) mapping directly between explicit ID vectors ensuring clean assignment without convoluting the pipeline natively using broader index or categorical searches prematurely. 

### API-UA-05: Scheduling (SeasonalPricingController & DateBlocksController)
Executed strict `SuperAdminOnly` structural modifiers projecting accurate chronologies without allowing scheduling payloads to falsely trigger real Booking logic evaluations prematurely. Heavily relies natively upon Tier 3 business validation intercepts to resolve overlapping issues intuitively.

### API-UA-06: UnitAvailabilityController
Explicitly configured public-facing operational endpoints `operational-check` and `pricing/calculate` retrieving dynamic arrays mapping operational limits accurately securely avoiding semantic "booking confirmation" promises perfectly closing the layer!
