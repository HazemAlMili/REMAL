-- ============================================================================
-- Migration:   0028_create_owner_portal_bookings_overview_view
-- Ticket:      DB-OP-03
-- Title:       Create owner_portal_bookings_overview SQL view for owner-facing
--              booking reads
-- Database:    PostgreSQL 16
-- Depends on:  0016_create_bookings (bookings table)
--              0027_create_owner_portal_units_overview_view (DB-OP-02)
--              0009_owner_portal_db_scope decision (read-model-first freeze)
-- Created:     2026-04-21
-- ============================================================================
--
-- PURPOSE:
--   Create a read-model view that exposes owner-facing booking data for the
--   Owner Portal without duplicating transactional booking records.
--   Downstream layers query this view instead of constructing ad-hoc joins
--   or applying status filters directly against the raw bookings table.
--
-- VIEW CONTRACT:
--   owner_id                  UUID        — owner of the booked unit
--   booking_id                UUID        — booking primary key
--   unit_id                   UUID        — unit that was booked
--   client_id                 UUID        — client who made the booking
--   assigned_admin_user_id    UUID NULL   — admin user assigned to this booking
--   booking_status            VARCHAR     — current booking status
--   check_in_date             DATE        — check-in date
--   check_out_date            DATE        — check-out date
--   guest_count               INT         — number of guests
--   final_amount              DECIMAL(12,2) — final settled booking amount
--   source                    VARCHAR     — booking origin channel
--   created_at                TIMESTAMP   — when the booking record was created
--   updated_at                TIMESTAMP   — when the booking record was last updated
--
-- SCOPE RULES (per DB-OP-01 freeze):
--   ✓ Read-only view — no table created
--   ✓ Source table: bookings only
--   ✗ No CRM notes, CRM assignment history fields
--   ✗ No invoice/payment balance or derived finance fields
--   ✗ No client PII (name, email, phone) beyond client_id linkage
--   ✗ No materialized view
-- ============================================================================

CREATE OR REPLACE VIEW owner_portal_bookings_overview AS
SELECT
    b.owner_id                  AS owner_id,
    b.id                        AS booking_id,
    b.unit_id                   AS unit_id,
    b.client_id                 AS client_id,
    b.assigned_admin_user_id    AS assigned_admin_user_id,
    b.booking_status            AS booking_status,
    b.check_in_date             AS check_in_date,
    b.check_out_date            AS check_out_date,
    b.guest_count               AS guest_count,
    b.final_amount              AS final_amount,
    b.source                    AS source,
    b.created_at                AS created_at,
    b.updated_at                AS updated_at
FROM bookings b;

COMMENT ON VIEW owner_portal_bookings_overview IS
    'Owner Portal read model: booking list per owner. '
    'No CRM notes, no invoice/payment balance, no client PII beyond ID. '
    'Source: bookings. Scope frozen per DB-OP-01.';
