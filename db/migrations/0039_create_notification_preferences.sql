-- ============================================================================
-- Migration:   0039_create_notification_preferences
-- Ticket:      DB-NA-04
-- Title:       Create notification_preferences table with exactly-one-recipient
--              enforcement and per-channel preference keys
-- Database:    PostgreSQL 16
-- Depends on:  admin_users, clients, owners
-- Created:     2026-04-22
-- ============================================================================
--
-- PURPOSE:
--   Create the notification_preferences table to store per-recipient
--   notification opt-in/opt-out state, keyed by channel and a
--   preference_key slug. Allows fine-grained disabling of notification
--   types for specific recipients without requiring all-or-nothing muting.
--
-- DESIGN DECISIONS:
--   - Recipient is typed via three nullable FKs (admin_user_id, client_id,
--     owner_id). Exactly one must be non-NULL, enforced by CHECK constraint
--     using num_nonnulls(). No generic recipient_type/recipient_id.
--   - FK ON DELETE CASCADE — preferences are owned by the recipient row.
--   - channel is constrained to MVP values matching the domain vocabulary:
--     in_app, email, sms, whatsapp.
--   - preference_key is a non-blank slug identifying the notification type
--     (e.g. 'booking_status_changed', 'review_published').
--   - Uniqueness is enforced per recipient type via three partial unique
--     indexes to avoid cross-recipient collisions.
--   - No created_at — preferences are mutable; only updated_at is tracked.
--   - No deleted_at — no soft delete.
--   - No marketing consent, quiet-hours, topic hierarchy, or scheduling fields.
--
-- SCHEMA CONTRACT:
--   id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   admin_user_id   UUID NULL
--   client_id       UUID NULL
--   owner_id        UUID NULL
--   channel         VARCHAR(50)  NOT NULL   — in_app|email|sms|whatsapp
--   preference_key  VARCHAR(100) NOT NULL   — non-blank slug
--   is_enabled      BOOLEAN      NOT NULL
--   updated_at      TIMESTAMP    NOT NULL
--
-- ALLOWED channel VALUES:
--   in_app | email | sms | whatsapp
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE notification_preferences (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id   UUID          NULL,
    client_id       UUID          NULL,
    owner_id        UUID          NULL,
    channel         VARCHAR(50)   NOT NULL,
    preference_key  VARCHAR(100)  NOT NULL,
    is_enabled      BOOLEAN       NOT NULL,
    updated_at      TIMESTAMP     NOT NULL,

    CONSTRAINT fk_notification_preferences_admin_user_id
        FOREIGN KEY (admin_user_id)
        REFERENCES admin_users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notification_preferences_client_id
        FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notification_preferences_owner_id
        FOREIGN KEY (owner_id)
        REFERENCES owners(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_notification_preferences_channel
        CHECK (channel IN ('in_app', 'email', 'sms', 'whatsapp')),

    CONSTRAINT ck_notification_preferences_preference_key_not_blank
        CHECK (btrim(preference_key) <> ''),

    CONSTRAINT ck_notification_preferences_exactly_one_recipient
        CHECK (num_nonnulls(admin_user_id, client_id, owner_id) = 1)
);

-- Recipient-scoped partial unique indexes — one preference row per
-- recipient + channel + key combination, without cross-NULL collisions
CREATE UNIQUE INDEX ux_notification_preferences_admin_channel_key
    ON notification_preferences (admin_user_id, channel, preference_key)
    WHERE admin_user_id IS NOT NULL;

CREATE UNIQUE INDEX ux_notification_preferences_client_channel_key
    ON notification_preferences (client_id, channel, preference_key)
    WHERE client_id IS NOT NULL;

CREATE UNIQUE INDEX ux_notification_preferences_owner_channel_key
    ON notification_preferences (owner_id, channel, preference_key)
    WHERE owner_id IS NOT NULL;

-- Supporting indexes
CREATE INDEX ix_notification_preferences_channel
    ON notification_preferences (channel);

CREATE INDEX ix_notification_preferences_preference_key
    ON notification_preferences (preference_key);
