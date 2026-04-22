-- ============================================================================
-- Rollback:    0028_create_owner_portal_bookings_overview_view_rollback
-- Ticket:      DB-OP-03
-- Reverts:     0028_create_owner_portal_bookings_overview_view.sql
-- ============================================================================

DROP VIEW IF EXISTS owner_portal_bookings_overview;
