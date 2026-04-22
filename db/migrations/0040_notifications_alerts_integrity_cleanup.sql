-- ============================================================================
-- Migration:   0040_notifications_alerts_integrity_cleanup
-- Ticket:      DB-NA-05
-- Title:       Notifications & Alerts schema integrity cleanup and
--              cross-table verification
-- Database:    PostgreSQL 16
-- Depends on:  DB-NA-01 through DB-NA-04
-- Created:     2026-04-22
-- ============================================================================
--
-- PURPOSE:
--   Quality-gate pass for Notifications & Alerts Tier 1 DB work.
--   1. Normalise primary key constraint names to the project-wide pk_*
--      pattern (PostgreSQL auto-generates "{table}_pkey"; this migration
--      aligns them with the convention established in
--      0007_master_data_integrity_cleanup).
--   2. Attach COMMENT ON TABLE documentation to all four new tables.
--
--   This migration introduces NO new columns, indexes, or data.
--   All DDL here is either a rename or a comment — fully reversible.
--
-- TABLES COVERED:
--   notification_templates        (DB-NA-01)
--   notifications                 (DB-NA-02)
--   notification_delivery_logs    (DB-NA-03)
--   notification_preferences      (DB-NA-04)
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

-- -----------------------------------------------------------------------
-- 1. Normalise primary key constraint names
-- -----------------------------------------------------------------------
ALTER TABLE notification_templates
    RENAME CONSTRAINT notification_templates_pkey TO pk_notification_templates;

ALTER TABLE notifications
    RENAME CONSTRAINT notifications_pkey TO pk_notifications;

ALTER TABLE notification_delivery_logs
    RENAME CONSTRAINT notification_delivery_logs_pkey TO pk_notification_delivery_logs;

ALTER TABLE notification_preferences
    RENAME CONSTRAINT notification_preferences_pkey TO pk_notification_preferences;


-- -----------------------------------------------------------------------
-- 2. Finalise table documentation
-- -----------------------------------------------------------------------
COMMENT ON TABLE notification_templates IS
    'DB-NA-01 | Source-of-truth for channel-specific notification text. '
    'Keyed by template_code + channel + recipient_role '
    '(ux_notification_templates_code_channel_role). '
    'channel: in_app|email|sms|whatsapp (ck_notification_templates_channel). '
    'recipient_role: admin|client|owner (ck_notification_templates_recipient_role). '
    'subject_template nullable (in_app has no subject). '
    'No localization, versioning, provider, or campaign fields in MVP.';

COMMENT ON TABLE notifications IS
    'DB-NA-02 | Core notification instance record. '
    'Links to a template (template_id NOT NULL FK). '
    'Exactly one recipient enforced: num_nonnulls(admin_user_id, client_id, owner_id) = 1 '
    '(ck_notifications_exactly_one_recipient). '
    'channel: in_app|email|sms|whatsapp (ck_notifications_channel). '
    'notification_status: pending|queued|sent|delivered|failed|read|cancelled. '
    'Rendered body stored directly; subject nullable. '
    'No recipient_type/recipient_id polymorphism, no provider payload, '
    'no webhook, no campaign, no deleted_at in MVP.';

COMMENT ON TABLE notification_delivery_logs IS
    'DB-NA-03 | Delivery attempt audit trail for notifications. '
    'One row per attempt: notification_id + attempt_number unique '
    '(ux_notification_delivery_logs_notification_id_attempt_number). '
    'attempt_number > 0 (ck_notification_delivery_logs_attempt_number_positive). '
    'delivery_status: queued|sent|delivered|failed '
    '(ck_notification_delivery_logs_status). '
    'provider_name/provider_message_id for lightweight traceability. '
    'No raw provider payloads, webhook events, or retry scheduler fields. '
    'ON DELETE CASCADE from notifications.';

COMMENT ON TABLE notification_preferences IS
    'DB-NA-04 | Per-recipient notification opt-in/opt-out preferences. '
    'Exactly one recipient enforced: num_nonnulls(admin_user_id, client_id, owner_id) = 1 '
    '(ck_notification_preferences_exactly_one_recipient). '
    'channel: in_app|email|sms|whatsapp (ck_notification_preferences_channel). '
    'preference_key is a non-blank slug (ck_notification_preferences_preference_key_not_blank). '
    'Uniqueness enforced per recipient type via partial indexes. '
    'No marketing consent, quiet-hours, topic hierarchy, or polymorphism in MVP. '
    'ON DELETE CASCADE from admin_users/clients/owners.';
