-- ============================================================================
-- Migration:   0037_create_notifications
-- Ticket:      DB-NA-02
-- Title:       Create notifications table as the core notification instance
--              record with exactly-one-recipient enforcement
-- Database:    PostgreSQL 16
-- Depends on:  notification_templates, admin_users, clients, owners
-- Created:     2026-04-22
-- ============================================================================
--
-- PURPOSE:
--   Create the notifications table as the source of truth for individual
--   notification instances. Each row represents one notification sent (or
--   scheduled to be sent) to exactly one recipient through one channel.
--   Rendered subject and body are stored directly on the row — no runtime
--   template re-rendering required for delivery or display.
--
-- DESIGN DECISIONS:
--   - template_id links back to the source template but is NOT nullable;
--     every notification must originate from a known template.
--   - Recipient is typed via three nullable FKs (admin_user_id, client_id,
--     owner_id). Exactly one must be non-NULL, enforced by CHECK constraint
--     using num_nonnulls(). No generic recipient_type/recipient_id.
--   - channel is constrained to MVP-allowed values matching the template
--     channel values: in_app, email, sms, whatsapp.
--   - notification_status tracks the lifecycle: pending → queued → sent →
--     delivered → failed / read / cancelled.
--   - subject is nullable (in_app notifications have no subject).
--   - body is NOT NULL and must be non-blank — rendered content always stored.
--   - scheduled_at, sent_at, read_at are nullable event timestamps.
--   - No deleted_at — no soft delete in this MVP scope.
--   - No provider/webhook payload, marketing campaign, or bulk broadcast fields.
--
-- SCHEMA CONTRACT:
--   id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   template_id         UUID NOT NULL
--   admin_user_id       UUID NULL
--   client_id           UUID NULL
--   owner_id            UUID NULL
--   channel             VARCHAR(50)  NOT NULL   — in_app|email|sms|whatsapp
--   notification_status VARCHAR(50)  NOT NULL   — pending|queued|sent|delivered|failed|read|cancelled
--   subject             VARCHAR(200) NULL
--   body                TEXT         NOT NULL
--   scheduled_at        TIMESTAMP    NULL
--   sent_at             TIMESTAMP    NULL
--   read_at             TIMESTAMP    NULL
--   created_at          TIMESTAMP    NOT NULL
--   updated_at          TIMESTAMP    NOT NULL
--
-- ALLOWED channel VALUES:
--   in_app | email | sms | whatsapp
--
-- ALLOWED notification_status VALUES:
--   pending | queued | sent | delivered | failed | read | cancelled
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE notifications (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id         UUID          NOT NULL,
    admin_user_id       UUID          NULL,
    client_id           UUID          NULL,
    owner_id            UUID          NULL,
    channel             VARCHAR(50)   NOT NULL,
    notification_status VARCHAR(50)   NOT NULL,
    subject             VARCHAR(200)  NULL,
    body                TEXT          NOT NULL,
    scheduled_at        TIMESTAMP     NULL,
    sent_at             TIMESTAMP     NULL,
    read_at             TIMESTAMP     NULL,
    created_at          TIMESTAMP     NOT NULL,
    updated_at          TIMESTAMP     NOT NULL,

    CONSTRAINT fk_notifications_template_id
        FOREIGN KEY (template_id)
        REFERENCES notification_templates(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_notifications_admin_user_id
        FOREIGN KEY (admin_user_id)
        REFERENCES admin_users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_notifications_client_id
        FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_notifications_owner_id
        FOREIGN KEY (owner_id)
        REFERENCES owners(id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_notifications_channel
        CHECK (channel IN ('in_app', 'email', 'sms', 'whatsapp')),

    CONSTRAINT ck_notifications_status
        CHECK (notification_status IN (
            'pending', 'queued', 'sent', 'delivered', 'failed', 'read', 'cancelled'
        )),

    CONSTRAINT ck_notifications_body_not_blank
        CHECK (btrim(body) <> ''),

    CONSTRAINT ck_notifications_exactly_one_recipient
        CHECK (num_nonnulls(admin_user_id, client_id, owner_id) = 1)
);

-- Supporting indexes
CREATE INDEX ix_notifications_template_id
    ON notifications (template_id);

CREATE INDEX ix_notifications_admin_user_id
    ON notifications (admin_user_id);

CREATE INDEX ix_notifications_client_id
    ON notifications (client_id);

CREATE INDEX ix_notifications_owner_id
    ON notifications (owner_id);

CREATE INDEX ix_notifications_status
    ON notifications (notification_status);

CREATE INDEX ix_notifications_channel
    ON notifications (channel);

CREATE INDEX ix_notifications_created_at
    ON notifications (created_at);

CREATE INDEX ix_notifications_scheduled_at
    ON notifications (scheduled_at);
