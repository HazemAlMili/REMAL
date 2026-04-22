-- ============================================================================
-- Migration:   0036_create_notification_templates (ROLLBACK)
-- Ticket:      DB-NA-01
-- Title:       Rollback — Create notification_templates table
-- Database:    PostgreSQL 16
-- Created:     2026-04-22
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

DROP INDEX IF EXISTS ix_notification_templates_is_active;
DROP INDEX IF EXISTS ix_notification_templates_recipient_role;
DROP INDEX IF EXISTS ix_notification_templates_channel;
DROP INDEX IF EXISTS ux_notification_templates_code_channel_role;

DROP TABLE IF EXISTS notification_templates;
