-- ============================================================================
-- Migration:   0037_create_notifications (ROLLBACK)
-- Ticket:      DB-NA-02
-- Title:       Rollback — Create notifications table
-- Database:    PostgreSQL 16
-- Created:     2026-04-22
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_notifications_scheduled_at;
DROP INDEX IF EXISTS ix_notifications_created_at;
DROP INDEX IF EXISTS ix_notifications_channel;
DROP INDEX IF EXISTS ix_notifications_status;
DROP INDEX IF EXISTS ix_notifications_owner_id;
DROP INDEX IF EXISTS ix_notifications_client_id;
DROP INDEX IF EXISTS ix_notifications_admin_user_id;
DROP INDEX IF EXISTS ix_notifications_template_id;

DROP TABLE IF EXISTS notifications;
