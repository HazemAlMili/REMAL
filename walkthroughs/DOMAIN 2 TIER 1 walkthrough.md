# DB-UA-01: Create units table — Walkthrough

## Ticket Summary
Created the `units` table as the **inventory anchor** for Domain 2 (Units & Availability). This is the core entity that all subsequent tiers — images, amenities linking, seasonal pricing, date blocks, availability, and bookings — depend on.

## Files Created / Modified

### [NEW] [0010_create_units.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0010_create_units.sql)
Up migration creating the `units` table with:
- 15 columns matching the exact schema contract
- 2 foreign keys (`fk_units_owner_id`, `fk_units_area_id`) with `ON DELETE RESTRICT`
- 5 check constraints (unit_type, bedrooms, bathrooms, max_guests, base_price)
- 2 indexes (`ix_units_owner_id`, `ix_units_area_id`)

### [NEW] [0010_create_units_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0010_create_units_rollback.sql)
Rollback drops indexes first, then the table.

### [NEW] [0010_create_units_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0010_create_units_verify.sql)
Comprehensive verification with 19 checks covering both static and runtime validation.

### [MODIFY] [init.sql](file:///d:/Clinets/Remal/REMAL/db/init.sql)
Added migration 0010 entry for fresh DB provisioning.

---

## Schema Contract Compliance

| Column | Type | Nullable | Constraint | ✓ |
|---|---|---|---|---|
| `id` | UUID PK | NO | `DEFAULT gen_random_uuid()` | ✅ |
| `owner_id` | UUID FK | NO | `fk_units_owner_id` → owners(id) RESTRICT | ✅ |
| `area_id` | UUID FK | NO | `fk_units_area_id` → areas(id) RESTRICT | ✅ |
| `name` | VARCHAR(150) | NO | — | ✅ |
| `description` | TEXT | YES | — | ✅ |
| `address` | VARCHAR(255) | YES | — | ✅ |
| `unit_type` | VARCHAR(50) | NO | `ck_units_unit_type` (apartment, villa, chalet, studio) | ✅ |
| `bedrooms` | INT | NO | `ck_units_bedrooms_non_negative` (≥ 0) | ✅ |
| `bathrooms` | INT | NO | `ck_units_bathrooms_non_negative` (≥ 0) | ✅ |
| `max_guests` | INT | NO | `ck_units_max_guests_positive` (> 0) | ✅ |
| `base_price_per_night` | DECIMAL(12,2) | NO | `ck_units_base_price_non_negative` (≥ 0) | ✅ |
| `is_active` | BOOLEAN | NO | `DEFAULT TRUE` | ✅ |
| `created_at` | TIMESTAMP | NO | — | ✅ |
| `updated_at` | TIMESTAMP | NO | — | ✅ |
| `deleted_at` | TIMESTAMP | YES | soft delete | ✅ |

---

## Verification Results (All 19 PASS)

### Static Verification
| # | Check | Result |
|---|---|---|
| 1 | Table has exactly 15 columns | ✅ PASS |
| 2 | No availability storage columns exist | ✅ PASS |
| 3 | 5 check constraints present | ✅ PASS |
| 4 | 2 foreign keys with correct names | ✅ PASS |
| 5 | 2 indexes with correct names | ✅ PASS |
| 6 | `deleted_at` is nullable | ✅ PASS |

### Runtime Verification
| # | Check | Result |
|---|---|---|
| 7 | Valid unit row inserts successfully | ✅ PASS |
| 8 | Negative bedrooms → rejected | ✅ PASS |
| 9 | Negative bathrooms → rejected | ✅ PASS |
| 10 | `max_guests = 0` → rejected | ✅ PASS |
| 11 | Negative base_price → rejected | ✅ PASS |
| 12 | Invalid unit_type `'penthouse'` → rejected | ✅ PASS |
| 13 | Non-existing owner_id → FK violation | ✅ PASS |
| 14 | Non-existing area_id → FK violation | ✅ PASS |
| 15 | Owner deletion restricted when linked | ✅ PASS |
| 16 | Area deletion restricted when linked | ✅ PASS |
| 17 | Soft delete works (deleted_at set) | ✅ PASS |
| 18 | `is_active` defaults to TRUE | ✅ PASS |
| 19 | All 4 unit_type values accepted | ✅ PASS |

### Migration Lifecycle
| Step | Result |
|---|---|
| Migration applied | ✅ `CREATE TABLE` + 2x `CREATE INDEX` |
| Rollback applied | ✅ `DROP INDEX` x2 + `DROP TABLE` |
| Re-apply after rollback | ✅ Clean re-creation |
| Full verify after re-apply | ✅ All 19 checks passed |

---

## Scope Discipline — Not Added
- ❌ No `is_available` / `availability_status` / `blocked_until` columns
- ❌ No `booking_count`, `rating_average`, or analytics counters
- ❌ No `slug`, `unit_code`, `created_by`, `updated_by`
- ❌ No `lat`/`long` or geo fields
- ❌ No cloud upload metadata
- ❌ No modifications to `owners` or `areas` tables
- ❌ No EF Core entities, configurations, services, or controllers

---
---

# DB-UA-02: Create unit_images table — Walkthrough

## Ticket Summary
Created the `unit_images` table to store ordered media references for units. Supports cover-image flagging, display ordering, and storage-key based lookup — no provider-specific overengineering.

## Files Created / Modified

### [NEW] [0011_create_unit_images.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0011_create_unit_images.sql)
Up migration creating the `unit_images` table with:
- 7 columns matching the exact schema contract
- 1 foreign key (`fk_unit_images_unit_id`) with `ON DELETE CASCADE`
- 1 check constraint (`ck_unit_images_display_order_non_negative`)
- 2 indexes (`ix_unit_images_unit_id`, `ix_unit_images_unit_id_display_order`)

### [NEW] [0011_create_unit_images_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0011_create_unit_images_rollback.sql)
Rollback drops indexes then table.

### [NEW] [0011_create_unit_images_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0011_create_unit_images_verify.sql)
12 verification checks covering static schema, speculative column guard, runtime constraints, defaults, and CASCADE behavior.

### [MODIFY] [init.sql](file:///d:/Clinets/Remal/REMAL/db/init.sql)
Added migration 0011 entry.

---

## Schema Contract Compliance

| Column | Type | Nullable | Constraint | ✓ |
|---|---|---|---|---|
| `id` | UUID PK | NO | `DEFAULT gen_random_uuid()` | ✅ |
| `unit_id` | UUID FK | NO | `fk_unit_images_unit_id` → units(id) CASCADE | ✅ |
| `file_key` | VARCHAR(500) | NO | — | ✅ |
| `is_cover` | BOOLEAN | NO | `DEFAULT FALSE` | ✅ |
| `display_order` | INT | NO | `DEFAULT 0`, `ck_unit_images_display_order_non_negative` (≥ 0) | ✅ |
| `created_at` | TIMESTAMP | NO | — | ✅ |
| `updated_at` | TIMESTAMP | NO | — | ✅ |

---

## Verification Results (All 12 PASS)

### Static Verification
| # | Check | Result |
|---|---|---|
| 1 | Table has exactly 7 columns | ✅ PASS |
| 2 | No speculative media columns | ✅ PASS |
| 3 | Check constraint present | ✅ PASS |
| 4 | FK with ON DELETE CASCADE | ✅ PASS |
| 5 | 2 indexes with correct names | ✅ PASS |

### Runtime Verification
| # | Check | Result |
|---|---|---|
| 6 | Valid image inserts successfully | ✅ PASS |
| 7 | Second image with order=1 | ✅ PASS |
| 8 | Non-existing unit_id → FK violation | ✅ PASS |
| 9 | Negative display_order → rejected | ✅ PASS |
| 10 | is_cover defaults to FALSE | ✅ PASS |
| 11 | display_order defaults to 0 | ✅ PASS |
| 12 | ON DELETE CASCADE — images removed with unit | ✅ PASS |

### Migration Lifecycle
| Step | Result |
|---|---|
| Migration applied | ✅ `CREATE TABLE` + 2x `CREATE INDEX` |
| Rollback applied | ✅ `DROP INDEX` x2 + `DROP TABLE` |
| Re-apply after rollback | ✅ Clean re-creation |
| Full verify after re-apply | ✅ All 12 checks passed |

---

## Scope Discipline — Not Added
- ❌ No `public_url`, `thumbnail_url`, `mime_type`, `file_size` columns
- ❌ No `alt_text` or localization fields
- ❌ No `deleted_at` / soft delete
- ❌ No binary/blob columns
- ❌ No upload flow or CDN logic
- ❌ No uniqueness rule on `is_cover`
- ❌ No EF Core entities, configurations, services, or controllers

---
---

# DB-UA-03: Create unit_amenities join table — Walkthrough

## Ticket Summary
Created the `unit_amenities` join table linking units and amenities through a **composite-key many-to-many** contract. No surrogate ID — the PK `(unit_id, amenity_id)` prevents duplicates by design. Uses correct `unit_amenities` naming (not the obsolete `guest`/`unit_guest`).

## Files Created / Modified

### [NEW] [0012_create_unit_amenities.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0012_create_unit_amenities.sql)
Up migration with composite PK, dual CASCADE FKs, and reverse-lookup index.

### [NEW] [0012_create_unit_amenities_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0012_create_unit_amenities_rollback.sql)
Rollback drops index then table.

### [NEW] [0012_create_unit_amenities_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0012_create_unit_amenities_verify.sql)
13 verification checks covering static schema, no-surrogate-id guard, composite PK, FK validation, duplicate rejection, and CASCADE on both sides.

### [MODIFY] [init.sql](file:///d:/Clinets/Remal/REMAL/db/init.sql)
Added migration 0012 entry.

---

## Schema Contract Compliance

| Column | Type | Nullable | Constraint | ✓ |
|---|---|---|---|---|
| `unit_id` | UUID FK | NO | `fk_unit_amenities_unit_id` → units(id) CASCADE | ✅ |
| `amenity_id` | UUID FK | NO | `fk_unit_amenities_amenity_id` → amenities(id) CASCADE | ✅ |
| `created_at` | TIMESTAMP | NO | — | ✅ |
| — | — | — | `pk_unit_amenities` PRIMARY KEY (unit_id, amenity_id) | ✅ |

---

## Verification Results (All 13 PASS)

### Static Verification
| # | Check | Result |
|---|---|---|
| 1 | Table has exactly 3 columns | ✅ PASS |
| 2 | No surrogate id column | ✅ PASS |
| 3 | Composite PK `pk_unit_amenities` present | ✅ PASS |
| 4 | 2 FKs with correct names and CASCADE | ✅ PASS |
| 5 | Reverse-lookup index on amenity_id | ✅ PASS |
| 6 | No obsolete guest/unit_guest tables | ✅ PASS |

### Runtime Verification
| # | Check | Result |
|---|---|---|
| 7 | Valid link inserts successfully | ✅ PASS |
| 8 | Second link (same unit, diff amenity) | ✅ PASS |
| 9 | Duplicate pair → unique_violation | ✅ PASS |
| 10 | Non-existing unit_id → FK violation | ✅ PASS |
| 11 | Non-existing amenity_id → FK violation | ✅ PASS |
| 12 | CASCADE (unit side) — links removed | ✅ PASS |
| 13 | CASCADE (amenity side) — links removed | ✅ PASS |

### Migration Lifecycle
| Step | Result |
|---|---|
| Migration applied | ✅ `CREATE TABLE` + `CREATE INDEX` |
| Rollback applied | ✅ `DROP INDEX` + `DROP TABLE` |
| Re-apply after rollback | ✅ Clean re-creation |

---

## Scope Discipline — Not Added
- ❌ No surrogate `id` column
- ❌ No `notes`, `is_featured`, or extra metadata
- ❌ No ranking/weight columns
- ❌ No `deleted_at` / soft delete
- ❌ No trigger logic
- ❌ No EF Core entities, configurations, services, or controllers

---
---

# DB-UA-04: Create seasonal_pricing table — Walkthrough

## Ticket Summary
Created the `seasonal_pricing` table for per-unit nightly price overrides over bounded date ranges. Stores only the override `price_per_night` — no derived totals, no overlap exclusion constraints at DB level (deferred to Business tier).

## Files Created / Modified

### [NEW] [0013_create_seasonal_pricing.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0013_create_seasonal_pricing.sql)
Up migration with FK, 2 indexes, and 2 check constraints (date range validity, non-negative price).

### [NEW] [0013_create_seasonal_pricing_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0013_create_seasonal_pricing_rollback.sql)
Rollback drops indexes then table.

### [NEW] [0013_create_seasonal_pricing_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0013_create_seasonal_pricing_verify.sql)
13 verification checks: static schema, no-derived-columns guard, no-exclusion-constraint guard, runtime date/price/FK validation, and CASCADE test.

### [MODIFY] [init.sql](file:///d:/Clinets/Remal/REMAL/db/init.sql)
Added migration 0013 entry.

---

## Schema Contract Compliance

| Column | Type | Nullable | Constraint | ✓ |
|---|---|---|---|---|
| `id` | UUID PK | NO | `DEFAULT gen_random_uuid()` | ✅ |
| `unit_id` | UUID FK | NO | `fk_seasonal_pricing_unit_id` → units(id) CASCADE | ✅ |
| `start_date` | DATE | NO | `ck_seasonal_pricing_valid_date_range` (start ≤ end) | ✅ |
| `end_date` | DATE | NO | (same check) | ✅ |
| `price_per_night` | DECIMAL(12,2) | NO | `ck_seasonal_pricing_price_non_negative` (≥ 0) | ✅ |
| `created_at` | TIMESTAMP | NO | — | ✅ |
| `updated_at` | TIMESTAMP | NO | — | ✅ |

---

## Verification Results (All 13 PASS)

### Static Verification
| # | Check | Result |
|---|---|---|
| 1 | Table has exactly 7 columns | ✅ PASS |
| 2 | No derived pricing columns | ✅ PASS |
| 3 | 2 check constraints present | ✅ PASS |
| 4 | FK with ON DELETE CASCADE | ✅ PASS |
| 5 | 2 indexes with correct names | ✅ PASS |
| 6 | No exclusion constraint (deferred) | ✅ PASS |

### Runtime Verification
| # | Check | Result |
|---|---|---|
| 7 | Valid seasonal pricing inserts | ✅ PASS |
| 8 | Single-day range (start=end) | ✅ PASS |
| 9 | end_date before start_date → rejected | ✅ PASS |
| 10 | Negative price → rejected | ✅ PASS |
| 11 | Zero price (free promo) → accepted | ✅ PASS |
| 12 | Non-existing unit_id → FK violation | ✅ PASS |
| 13 | CASCADE — pricing removed with unit | ✅ PASS |

### Migration Lifecycle
| Step | Result |
|---|---|
| Migration applied | ✅ `CREATE TABLE` + 2x `CREATE INDEX` |
| Rollback applied | ✅ `DROP INDEX` x2 + `DROP TABLE` |
| Re-apply after rollback | ✅ Clean re-creation |

---

## Scope Discipline — Not Added
- ❌ No `total_price`, `booking_total`, `tax_amount`, `discount_amount`
- ❌ No `currency` column
- ❌ No `label` column
- ❌ No overlap/exclusion constraint (deferred to Business tier)
- ❌ No soft delete
- ❌ No EF Core entities, configurations, services, or controllers

---
---

# DB-UA-05: Create date_blocks table — Walkthrough

## Ticket Summary
Created the `date_blocks` table as the **non-booking availability blocker source**. This is the second input for availability computation (alongside confirmed bookings which come later). Supports operational blocks for maintenance, owner personal use, and manual admin blocks.

## Files Created / Modified

### [NEW] [0014_create_date_blocks.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0014_create_date_blocks.sql)
Up migration with FK, 2 indexes, and date-range check constraint.

### [NEW] [0014_create_date_blocks_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0014_create_date_blocks_rollback.sql)
Rollback drops indexes then table.

### [NEW] [0014_create_date_blocks_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0014_create_date_blocks_verify.sql)
11 verification checks: static schema, no-speculative-columns guard, runtime date-range/FK tests, NULL reason, single-day block, and CASCADE.

### [MODIFY] [init.sql](file:///d:/Clinets/Remal/REMAL/db/init.sql)
Added migration 0014 entry.

---

## Schema Contract Compliance

| Column | Type | Nullable | Constraint | ✓ |
|---|---|---|---|---|
| `id` | UUID PK | NO | `DEFAULT gen_random_uuid()` | ✅ |
| `unit_id` | UUID FK | NO | `fk_date_blocks_unit_id` → units(id) CASCADE | ✅ |
| `start_date` | DATE | NO | `ck_date_blocks_valid_date_range` (start ≤ end) | ✅ |
| `end_date` | DATE | NO | (same check) | ✅ |
| `reason` | VARCHAR(100) | YES | — | ✅ |
| `notes` | TEXT | YES | — | ✅ |
| `created_at` | TIMESTAMP | NO | — | ✅ |
| `updated_at` | TIMESTAMP | NO | — | ✅ |

---

## Verification Results (All 11 PASS)

### Static Verification
| # | Check | Result |
|---|---|---|
| 1 | Table has exactly 8 columns | ✅ PASS |
| 2 | No booking/availability/audit columns | ✅ PASS |
| 3 | Check constraint present | ✅ PASS |
| 4 | FK with ON DELETE CASCADE | ✅ PASS |
| 5 | 2 indexes with correct names | ✅ PASS |

### Runtime Verification
| # | Check | Result |
|---|---|---|
| 6 | Valid date block with reason | ✅ PASS |
| 7 | Date block with NULL reason | ✅ PASS |
| 8 | Single-day block (start=end) | ✅ PASS |
| 9 | end_date before start_date → rejected | ✅ PASS |
| 10 | Non-existing unit_id → FK violation | ✅ PASS |
| 11 | CASCADE — blocks removed with unit | ✅ PASS |

### Migration Lifecycle
| Step | Result |
|---|---|
| Migration applied | ✅ `CREATE TABLE` + 2x `CREATE INDEX` |
| Rollback applied | ✅ `DROP INDEX` x2 + `DROP TABLE` |
| Re-apply after rollback | ✅ Clean re-creation |

---

## Scope Discipline — Not Added
- ❌ No `booking_id` linkage
- ❌ No `availability_status` or `is_available` fields
- ❌ No `approved_by` or `created_by_admin_id`
- ❌ No overlap/exclusion constraint (deferred to Business tier)
- ❌ No soft delete
- ❌ No EF Core entities, configurations, services, or controllers

---
---

# DB-UA-06: Units & Availability Schema Integrity Cleanup

## Ticket Summary
A final checkpoint pass over the newly created `Units & Availability` tables to prove cross-table alignment, explicitly verifying no booking constraints or speculative availability state leakage before migrating to the Data Access tier.

## Files Created / Modified

### [NEW] [0015_units_availability_integrity_cleanup.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0015_units_availability_integrity_cleanup.sql)
Creates table-level documentation comments and refreshes table statistics. Does not modify structural schema since the initial migrations were clean.

### [NEW] [0015_units_availability_integrity_cleanup_rollback.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0015_units_availability_integrity_cleanup_rollback.sql)
Removes the table comments.

### [NEW] [0015_units_availability_integrity_cleanup_verify.sql](file:///d:/Clinets/Remal/REMAL/db/migrations/0015_units_availability_integrity_cleanup_verify.sql)
Cross-table domain script. Executes 6 categories of checks ensuring exact constraint/column matching while explicitly failing if ANY table has an `availability_status`, `booking_id`, or floating-point price column.

### [MODIFY] [init.sql](file:///d:/Clinets/Remal/REMAL/db/init.sql)
Added migration 0015 entry.

---

## Post-Verification State Complete
Domain is clean. Tables established and frozen:
- `units`
- `unit_images`
- `unit_amenities`
- `seasonal_pricing`
- `date_blocks`

Ready for Domain 2 Tier 2 (Data Access Layer - EF Core configuration).
