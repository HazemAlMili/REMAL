-- ============================================================================
-- Migration:   0039_create_notification_preferences (ROLLBACK)
-- Ticket:      DB-NA-04
-- Title:       Rollback — Create notification_preferences table
-- Database:    PostgreSQL 16
-- Created:     2026-04-22
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_notification_preferences_preference_key;
DROP INDEX IF EXISTS ix_notification_preferences_channel;
DROP INDEX IF EXISTS ux_notification_preferences_owner_channel_key;
DROP INDEX IF EXISTS ux_notification_preferences_client_channel_key;
DROP INDEX IF EXISTS ux_notification_preferences_admin_channel_key;

DROP TABLE IF EXISTS notification_preferences;
