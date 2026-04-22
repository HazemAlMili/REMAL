-- ============================================================================
-- Rollback:    0040_notifications_alerts_integrity_cleanup (ROLLBACK)
-- Ticket:      DB-NA-05
-- Reverts:     0040_notifications_alerts_integrity_cleanup.sql
-- Database:    PostgreSQL 16
-- Created:     2026-04-22
-- ============================================================================
--
-- Reverts PK renames back to PostgreSQL auto-generated names.
-- Clears COMMENT ON TABLE entries.
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

-- Revert table comments
COMMENT ON TABLE notification_preferences      IS NULL;
COMMENT ON TABLE notification_delivery_logs    IS NULL;
COMMENT ON TABLE notifications                 IS NULL;
COMMENT ON TABLE notification_templates        IS NULL;

-- Revert PK constraint renames
ALTER TABLE notification_preferences
    RENAME CONSTRAINT pk_notification_preferences TO notification_preferences_pkey;

ALTER TABLE notification_delivery_logs
    RENAME CONSTRAINT pk_notification_delivery_logs TO notification_delivery_logs_pkey;

ALTER TABLE notifications
    RENAME CONSTRAINT pk_notifications TO notifications_pkey;

ALTER TABLE notification_templates
    RENAME CONSTRAINT pk_notification_templates TO notification_templates_pkey;
