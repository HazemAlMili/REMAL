-- ============================================================================
-- Rollback:    0027_create_owner_portal_units_overview_view_rollback
-- Ticket:      DB-OP-02
-- Reverts:     0027_create_owner_portal_units_overview_view.sql
-- ============================================================================

DROP VIEW IF EXISTS owner_portal_units_overview;
