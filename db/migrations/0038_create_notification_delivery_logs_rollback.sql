-- ============================================================================
-- Migration:   0038_create_notification_delivery_logs (ROLLBACK)
-- Ticket:      DB-NA-03
-- Title:       Rollback — Create notification_delivery_logs table
-- Database:    PostgreSQL 16
-- Created:     2026-04-22
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_notification_delivery_logs_provider_message_id;
DROP INDEX IF EXISTS ix_notification_delivery_logs_attempted_at;
DROP INDEX IF EXISTS ix_notification_delivery_logs_status;
DROP INDEX IF EXISTS ix_notification_delivery_logs_notification_id;
DROP INDEX IF EXISTS ux_notification_delivery_logs_notification_id_attempt_number;

DROP TABLE IF EXISTS notification_delivery_logs;
