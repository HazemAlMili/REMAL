-- ============================================================================
-- Rollback:    0030_owner_portal_integrity_cleanup_rollback
-- Ticket:      DB-OP-05
-- Reverts:     0030_owner_portal_integrity_cleanup.sql
-- ============================================================================
--
-- The cleanup migration only adds/updates COMMENT ON VIEW statements.
-- Rolling back resets those comments to NULL.
-- No tables, views, or indexes were created; nothing structural to drop.
-- ============================================================================

COMMENT ON VIEW owner_portal_units_overview     IS NULL;
COMMENT ON VIEW owner_portal_bookings_overview  IS NULL;
COMMENT ON VIEW owner_portal_finance_overview   IS NULL;
