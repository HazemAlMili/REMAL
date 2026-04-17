# Database Migration Walkthrough

---

## DB-MD-01: Initialize PostgreSQL Base Conventions

### Ticket Summary
Foundational migration to enable `pgcrypto` extension and document all frozen DB conventions for the Rental Platform's master data tier.

### Files Created

| File | Purpose |
|------|---------|
| [0001_init_postgres_conventions.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0001_init_postgres_conventions.sql) | **UP** — enables pgcrypto + documents all conventions |
| [0001_init_postgres_conventions_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0001_init_postgres_conventions_rollback.sql) | **DOWN** — safely drops pgcrypto |
| [0001_init_postgres_conventions_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0001_init_postgres_conventions_verify.sql) | **Verify** — checks all 6 acceptance criteria |

### Frozen Conventions

| Convention | Decision |
|-----------|----------|
| Primary Keys | `UUID DEFAULT gen_random_uuid()` (via pgcrypto) |
| Naming | `snake_case` for tables, columns, indexes, constraints |
| Timestamps | `created_at` + `updated_at` on every table (NOT NULL) |
| Timestamp Ownership | EF Core application layer — **NO DB triggers** |
| Enums | Stored as `VARCHAR` — **NO PostgreSQL enum types** |
| Money | `DECIMAL(12,2)` — **NO FLOAT** |
| Soft Deletes | `deleted_at TIMESTAMP NULL` where specified |
| UUID Extension | `pgcrypto` only — **NO uuid-ossp** |

### Definition of Done

- [x] Migration created and applied on empty DB
- [x] Rollback succeeded
- [x] Re-apply stable
- [x] All conventions documented in migration comments

---

## DB-MD-02: Create Amenities Table

### Ticket Summary
Create the `amenities` master lookup table with UUID PK, timestamps, and unique name constraint.

### Files Created

| File | Purpose |
|------|---------|
| [0002_create_amenities.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0002_create_amenities.sql) | **UP** — creates amenities table + unique index |
| [0002_create_amenities_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0002_create_amenities_rollback.sql) | **DOWN** — drops index + table |
| [0002_create_amenities_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0002_create_amenities_verify.sql) | **Verify** — tests schema, uniqueness, inserts |

### Schema

```sql
CREATE TABLE amenities (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100)    NOT NULL,
    icon        VARCHAR(255)    NULL,
    created_at  TIMESTAMP       NOT NULL,
    updated_at  TIMESTAMP       NOT NULL
);
CREATE UNIQUE INDEX ux_amenities_name ON amenities (name);
```

### Verification Results

| # | Check | Result |
|---|-------|--------|
| 1 | Table has exactly 5 columns | ✅ id, name, icon, created_at, updated_at |
| 2 | Unique index `ux_amenities_name` exists | ✅ Confirmed |
| 3 | Insert `Pool` (icon NULL) | ✅ `INSERT 0 1` |
| 4 | Duplicate `Pool` rejected | ✅ `unique_violation` |
| 5 | Insert `Sea View` (icon set) | ✅ `INSERT 0 1` |
| 6 | Both rows returned correctly | ✅ 2 rows |
| 7 | Column count = 5 (no extras) | ✅ `5` |
| 8 | Rollback succeeded | ✅ `DROP INDEX` + `DROP TABLE` |
| 9 | Table gone after rollback | ✅ 0 rows |
| 10 | Re-apply after rollback | ✅ `CREATE TABLE` + `CREATE INDEX` |

### Scope Compliance

> [!IMPORTANT]
> - ❌ No `unit_amenities` join table
> - ❌ No seed data
> - ❌ No `deleted_at` / `is_active`
> - ❌ No FKs
> - ❌ No EF Core entities

### Definition of Done

- [x] Table created with exact schema contract
- [x] Unique name enforced (duplicate rejected)
- [x] Schema verified (5 columns only)
- [x] Rollback and re-apply succeeded
- [x] No artifacts outside scope

---

## DB-MD-03: Create Areas Table

### Ticket Summary
Create the `areas` master table representing geographic/resort zones with UUID PK, activation flag, timestamps, and unique name.

### Files Created

| File | Purpose |
|------|---------|
| [0003_create_areas.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0003_create_areas.sql) | **UP** — creates areas table + unique index |
| [0003_create_areas_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0003_create_areas_rollback.sql) | **DOWN** — drops index + table |
| [0003_create_areas_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0003_create_areas_verify.sql) | **Verify** — tests schema, uniqueness, defaults, inserts |

### Schema

```sql
CREATE TABLE areas (
    id           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(150)    NOT NULL,
    description  TEXT            NULL,
    is_active    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP       NOT NULL,
    updated_at   TIMESTAMP       NOT NULL
);
CREATE UNIQUE INDEX ux_areas_name ON areas (name);
```

### Verification Results

| # | Check | Result |
|---|-------|--------|
| 1 | Table has exactly 6 columns | ✅ id, name, description, is_active, created_at, updated_at |
| 2 | `is_active` default = `true` | ✅ Confirmed in column_default |
| 3 | Unique index `ux_areas_name` exists | ✅ Confirmed |
| 4 | Insert `Palm Hills` | ✅ `INSERT 0 1` |
| 5 | Insert `Abraj Al Alamein` | ✅ `INSERT 0 1` |
| 6 | Duplicate `Palm Hills` rejected | ✅ `unique_violation` |
| 7 | Insert without description (NULL) | ✅ `INSERT 0 1` |
| 8 | Insert with `is_active = false` | ✅ Stored as `f` |
| 9 | Column count = 6 (no extras) | ✅ `6` |
| 10 | Rollback succeeded | ✅ `DROP INDEX` + `DROP TABLE` |
| 11 | Re-apply after rollback | ✅ `CREATE TABLE` + `CREATE INDEX` |

### Definition of Done

- [x] Table created with exact schema contract
- [x] Unique name enforced (duplicate rejected)
- [x] `is_active` default TRUE verified
- [x] `description` nullable verified
- [x] Column count = 6 (no `deleted_at`, `slug`, `image_url`)
- [x] Rollback and re-apply succeeded
- [x] No artifacts outside scope

---

## DB-MD-04: Create Admin Users Table

### Ticket Summary
Create the `admin_users` table with role enforcement via CHECK constraint, case-insensitive unique email, and `is_active` flag. No `deleted_at` by design.

### Files Created

| File | Purpose |
|------|---------|
| [0004_create_admin_users.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0004_create_admin_users.sql) | **UP** — creates table + unique email index + role CHECK |
| [0004_create_admin_users_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0004_create_admin_users_rollback.sql) | **DOWN** — drops index + table |
| [0004_create_admin_users_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0004_create_admin_users_verify.sql) | **Verify** — tests schema, constraints, case-insensitive email |

### Schema

```sql
CREATE TABLE admin_users (
    id             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(150)    NOT NULL,
    email          VARCHAR(255)    NOT NULL,
    password_hash  VARCHAR(255)    NOT NULL,
    role           VARCHAR(50)     NOT NULL,
    is_active      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP       NOT NULL,
    updated_at     TIMESTAMP       NOT NULL,
    CONSTRAINT ck_admin_users_role CHECK (role IN ('super_admin','sales','finance','tech'))
);
CREATE UNIQUE INDEX ux_admin_users_email ON admin_users (LOWER(email));
```

### Verification Results

| # | Check | Result |
|---|-------|--------|
| 1 | Table has exactly 8 columns | ✅ Confirmed |
| 2 | Unique index on `LOWER(email)` | ✅ `ux_admin_users_email` |
| 3 | CHECK constraint `ck_admin_users_role` | ✅ 4 allowed values |
| 4 | Insert `role = sales` | ✅ `INSERT 0 1` |
| 5 | Insert `role = manager` (invalid) | ✅ `check_violation` |
| 6 | Insert `ADMIN@example.com` | ✅ `INSERT 0 1` |
| 7 | Insert `admin@example.com` (case dup) | ✅ `unique_violation` |
| 8 | All 4 valid roles accepted | ✅ Confirmed |
| 9 | `is_active` defaults to TRUE | ✅ `t` |
| 10 | Column count = 8 (no extras) | ✅ `8` |
| 11 | Rollback succeeded | ✅ `DROP INDEX` + `DROP TABLE` |
| 12 | Re-apply stable | ✅ `CREATE TABLE` + `CREATE INDEX` |

### Design Note
> [!NOTE]
> `admin_users` intentionally has **no `deleted_at`**. Deactivation is via `is_active = false` only. Historical admin records remain queryable.

### Definition of Done

- [x] Table created with exact schema contract
- [x] Invalid role rejected (CHECK constraint)
- [x] Case-insensitive email duplicate rejected
- [x] `is_active` default TRUE verified
- [x] Column count = 8 (no `deleted_at`, `username`, `permissions`)
- [x] Rollback and re-apply succeeded
- [x] No artifacts outside scope

---

## DB-MD-05: Create Clients Table

### Ticket Summary
Create the `clients` table with unique phone, nullable unique email (partial index), `is_active`, and `deleted_at` for soft delete.

### Files Created

| File | Purpose |
|------|---------|
| [0005_create_clients.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0005_create_clients.sql) | **UP** — creates table + phone unique + partial email unique |
| [0005_create_clients_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0005_create_clients_rollback.sql) | **DOWN** — drops indexes + table |
| [0005_create_clients_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0005_create_clients_verify.sql) | **Verify** — tests phone/email uniqueness, NULL emails, soft delete |

### Schema

```sql
CREATE TABLE clients (
    id             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(150)    NOT NULL,
    phone          VARCHAR(30)     NOT NULL,
    email          VARCHAR(255)    NULL,
    password_hash  VARCHAR(255)    NOT NULL,
    is_active      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP       NOT NULL,
    updated_at     TIMESTAMP       NOT NULL,
    deleted_at     TIMESTAMP       NULL
);
CREATE UNIQUE INDEX ux_clients_phone ON clients (phone);
CREATE UNIQUE INDEX ux_clients_email_not_null ON clients (LOWER(email)) WHERE email IS NOT NULL;
```

### Verification Results

| # | Check | Result |
|---|-------|--------|
| 1 | Table has exactly 9 columns | ✅ Confirmed |
| 2 | Both indexes exist | ✅ `ux_clients_phone` + `ux_clients_email_not_null` |
| 3 | Insert with phone, email=NULL | ✅ `INSERT 0 1` |
| 4 | Duplicate phone rejected | ✅ `unique_violation` |
| 5 | Two rows with email=NULL coexist | ✅ `null_email_count = 2` |
| 6 | Insert with email `test@example.com` | ✅ `INSERT 0 1` |
| 7 | Duplicate email `TEST@example.com` rejected | ✅ `unique_violation` |
| 8 | Soft delete (set `deleted_at`) | ✅ Record still in DB, `is_soft_deleted = t` |
| 9 | `is_active` defaults to TRUE | ✅ `t` |
| 10 | Column count = 9 | ✅ `9` |
| 11 | Rollback succeeded | ✅ `DROP INDEX` ×2 + `DROP TABLE` |
| 12 | Re-apply stable | ✅ `CREATE TABLE` + `CREATE INDEX` ×2 |

### Definition of Done

- [x] Table created with exact schema contract
- [x] Phone uniqueness enforced
- [x] Email partial uniqueness (NULL-safe, case-insensitive)
- [x] Soft delete column present and functional
- [x] `is_active` default TRUE verified
- [x] Rollback and re-apply succeeded
- [x] No artifacts outside scope

---

## DB-MD-06: Create Owners Table

### Ticket Summary
Create the `owners` table with unique phone, nullable unique email (partial index), commission rate constraint, status constraint, and soft delete.

### Files Created

| File | Purpose |
|------|---------|
| [0006_create_owners.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0006_create_owners.sql) | **UP** — creates table, phone unique, partial email unique, and check constraints |
| [0006_create_owners_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0006_create_owners_rollback.sql) | **DOWN** — drops indexes + table |
| [0006_create_owners_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0006_create_owners_verify.sql) | **Verify** — tests unique rules, checks validity of status and commission rate, tests NULL emails and soft delete |

### Schema

```sql
CREATE TABLE owners (
    id               UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(150)    NOT NULL,
    phone            VARCHAR(30)     NOT NULL,
    email            VARCHAR(255)    NULL,
    commission_rate  DECIMAL(5,2)    NOT NULL,
    notes            TEXT            NULL,
    status           VARCHAR(50)     NOT NULL,
    created_at       TIMESTAMP       NOT NULL,
    updated_at       TIMESTAMP       NOT NULL,
    deleted_at       TIMESTAMP       NULL,
    CONSTRAINT ck_owners_commission_rate CHECK (commission_rate >= 0.00 AND commission_rate <= 100.00),
    CONSTRAINT ck_owners_status CHECK (status IN ('active', 'inactive'))
);
CREATE UNIQUE INDEX ux_owners_phone ON owners (phone);
CREATE UNIQUE INDEX ux_owners_email_not_null ON owners (LOWER(email)) WHERE email IS NOT NULL;
```

### Verification Results

| # | Check | Result |
|---|-------|--------|
| 1 | Table has exactly 10 columns | ✅ Confirmed |
| 2 | Both indexes exist | ✅ `ux_owners_phone` + `ux_owners_email_not_null` |
| 3 | Both check constraints exist | ✅ `ck_owners_commission_rate` + `ck_owners_status` |
| 4 | Insert with valid status and commission_rate | ✅ `INSERT 0 1` |
| 5 | Negative commission_rate rejected | ✅ `check_violation` |
| 6 | Commission_rate > 100 rejected | ✅ `check_violation` |
| 7 | Invalid status `blocked` rejected | ✅ `check_violation` |
| 8 | Duplicate phone rejected | ✅ `unique_violation` |
| 9 | Duplicate email `OWNER1@example.com` rejected | ✅ `unique_violation` |
| 10 | Two rows with email=NULL coexist | ✅ `INSERT 0 1` |
| 11 | Soft delete (set `deleted_at`) | ✅ Record still in DB, `is_soft_deleted = t` |
| 12 | Column count = 10 | ✅ `10` |
| 13 | Rollback succeeded | ✅ `DROP INDEX` ×2 + `DROP TABLE` |
| 14 | Re-apply stable | ✅ `CREATE TABLE` + `CREATE INDEX` ×2 |

### Definition of Done

- [x] Table created with exact schema contract
- [x] Commission constraint tested (>= 0 and <= 100)
- [x] Status constraint tested ('active', 'inactive')
- [x] Uniqueness on phone and email tested
- [x] Soft delete tested
- [x] Rollback verified
- [x] No artifacts outside scope

---

## DB-MD-07: Master Data Integrity Cleanup

### Ticket Summary
Ensure master data purity. Validate existing structure exactly matches schema contracts, and explicitly rename Postgres-generated primary key constraints to standardized `pk_{table}` naming conventions.

### Files Created

| File | Purpose |
|------|---------|
| [0007_master_data_integrity_cleanup.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0007_master_data_integrity_cleanup.sql) | **UP** — renames PK constraints (`amenities_pkey` -> `pk_amenities`, etc.) |
| [0007_master_data_integrity_cleanup_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0007_master_data_integrity_cleanup_rollback.sql) | **DOWN** — reverts PK renames |
| [0007_master_data_integrity_cleanup_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0007_master_data_integrity_cleanup_verify.sql) | **Verify** — mega script that validates PK names, column counts across all 5 tables, ensures `deleted_at` scope is strictly respected, enforces missing FK/Triggers rules. |

### Schema Normalization

```sql
ALTER TABLE amenities RENAME CONSTRAINT amenities_pkey TO pk_amenities;
ALTER TABLE areas RENAME CONSTRAINT areas_pkey TO pk_areas;
ALTER TABLE admin_users RENAME CONSTRAINT admin_users_pkey TO pk_admin_users;
ALTER TABLE clients RENAME CONSTRAINT clients_pkey TO pk_clients;
ALTER TABLE owners RENAME CONSTRAINT owners_pkey TO pk_owners;
```

### Verification Results

| # | Check | Result |
|---|-------|--------|
| 1 | PKs normalized to `pk_{table}` via meta query | ✅ Validated |
| 2 | Exactly 5 Master Data tables detected | ✅ Validated |
| 3 | `id`, `created_at`, `updated_at` exist everywhere | ✅ 15/15 columns found |
| 4 | `deleted_at` exclusively exists in `clients`/`owners` | ✅ Confirmed |
| 5 | Master table `is_active` (`admin_users`) / `status` (`owners`) / `commission` flags checked | ✅ Confirmed |
| 6 | No unauthorized triggers/FK references | ✅ Validated (0 constraints, 0 triggers found) |
| 7 | Rollback reverted PK constraints successfully | ✅ Validated |

### Definition of Done

- [x] Primary keys completely normalized
- [x] Strict schema validation rules audited & verified via dynamic script
- [x] No unauthorized fields/types discovered
- [x] Migration logic safely re-applied
- [x] All 5 tables confirmed perfectly aligned with their technical briefs

---

## DB-MD-08: Seed Minimal Development Master Data

### Ticket Summary
Bootstrap minimal essential master data (admin users, amenities, areas) ensuring immediate local DB utility. Includes deterministic conflict-safe inserts (`ON CONFLICT DO NOTHING`) and strictly leverages secure B-Crypt hashes in place of plain-text passwords.

### Files Created

| File | Purpose |
|------|---------|
| [0008_seed_dev_master_data.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0008_seed_dev_master_data.sql) | **UP** — securely inserts deterministic dev entities utilizing conflict bypassing. |
| [0008_seed_dev_master_data_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0008_seed_dev_master_data_rollback.sql) | **DOWN** — explicitly removes seeded items by known identifiers (`email` / `name`). |
| [0008_seed_dev_master_data_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0008_seed_dev_master_data_verify.sql) | **Verify** — asserts record existence and actively sweeps rows for illegal "plaintext pass" security breaches. |

### Entities Seeded (Summary)

- **Admin Users (4):** `superadmin`, `sales`, `finance`, `tech`.
- **Amenities (5):** Pool, Parking, Sea View, Gym, Kitchen.
- **Areas (3):** Palm Hills, Abraj Al Alamein, Sample Area.
- **Password Scheme:** `Admin@1234` generated exclusively as BCrypt factor-12 (`$2a$12...`).

### Verification Results

| # | Check | Result |
|---|-------|--------|
| 1 | Amenities Seeded | ✅ 5 Expected. Confirmed |
| 2 | Areas Seeded | ✅ 3 Expected. Confirmed |
| 3 | Admin Users Seeded | ✅ 4 Expected. Confirmed |
| 4 | Plaintext Password Audit | ✅ ZERO illegal plaintext hits found |
| 5 | Deterministic BCrypt Integrity | ✅ All admin signatures assert correctly formatted hashing |
| 6 | Execution Idempotency Test | ✅ Passed (`INSERT 0 0` on duplicate run) |
| 7 | Rollback Targeted Cleanup | ✅ Exact match `DELETE` queries confirmed executing successfully |

### Definition of Done

- [x] Development environment bootstrap enabled
- [x] Core Master Data tables strictly initialized
- [x] Security-by-default applied (BCrypt)
- [x] Execution repeatedly proven safe (conflict-safe)
- [x] No over-seeding (no owners. no clients)
- [x] Clean down-migration rollback achieved
