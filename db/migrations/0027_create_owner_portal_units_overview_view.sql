-- ============================================================================
-- Migration:   0027_create_owner_portal_units_overview_view
-- Ticket:      DB-OP-02
-- Title:       Create owner_portal_units_overview SQL view for owner-facing
--              unit inventory reads
-- Database:    PostgreSQL 16
-- Depends on:  0010_create_units (units table)
--              0009_owner_portal_db_scope decision (read-model-first freeze)
-- Created:     2026-04-21
-- ============================================================================
--
-- PURPOSE:
--   Create a read-model view that exposes owner-facing unit inventory data
--   for the Owner Portal without duplicating transactional unit data.
--   Downstream layers (Data Access, Business, API) query this view instead
--   of constructing ad-hoc joins against the raw units table.
--
-- VIEW CONTRACT:
--   owner_id               UUID        — owner of the unit
--   unit_id                UUID        — unit primary key
--   area_id                UUID        — area the unit belongs to
--   unit_name              VARCHAR     — display name of the unit
--   unit_type              VARCHAR     — apartment | villa | chalet | studio
--   is_active              BOOLEAN     — whether unit is currently active
--   bedrooms               INT         — number of bedrooms
--   bathrooms              INT         — number of bathrooms
--   max_guests             INT         — maximum guest capacity
--   base_price_per_night   DECIMAL(12,2) — base nightly rate
--   created_at             TIMESTAMP   — when the unit record was created
--   updated_at             TIMESTAMP   — when the unit record was last updated
--
-- SCOPE RULES (per DB-OP-01 freeze):
--   ✓ Read-only view — no table created
--   ✓ Source table: units only
--   ✓ Soft-deleted units (deleted_at IS NOT NULL) are excluded
--   ✗ No availability fields
--   ✗ No booking counts or aggregation
--   ✗ No cover image fields
--   ✗ No seasonal pricing data
--   ✗ No materialized view
-- ============================================================================

CREATE OR REPLACE VIEW owner_portal_units_overview AS
SELECT
    u.owner_id                  AS owner_id,
    u.id                        AS unit_id,
    u.area_id                   AS area_id,
    u.name                      AS unit_name,
    u.unit_type                 AS unit_type,
    u.is_active                 AS is_active,
    u.bedrooms                  AS bedrooms,
    u.bathrooms                 AS bathrooms,
    u.max_guests                AS max_guests,
    u.base_price_per_night      AS base_price_per_night,
    u.created_at                AS created_at,
    u.updated_at                AS updated_at
FROM units u
WHERE u.deleted_at IS NULL;

COMMENT ON VIEW owner_portal_units_overview IS
    'Owner Portal read model: non-deleted unit inventory per owner. '
    'Tier 1 read-only view — no availability, booking, or finance data. '
    'Source: units. Scope frozen per DB-OP-01.';
