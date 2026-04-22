-- ============================================================================
-- Rollback:    0029_create_owner_portal_finance_overview_view_rollback
-- Ticket:      DB-OP-04
-- Reverts:     0029_create_owner_portal_finance_overview_view.sql
-- ============================================================================

DROP VIEW IF EXISTS owner_portal_finance_overview;
