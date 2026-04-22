-- ============================================================================
-- Migration:   0038_create_notification_delivery_logs
-- Ticket:      DB-NA-03
-- Title:       Create notification_delivery_logs table for delivery attempts
--              and provider-agnostic dispatch audit
-- Database:    PostgreSQL 16
-- Depends on:  notifications
-- Created:     2026-04-22
-- ============================================================================
--
-- PURPOSE:
--   Create the notification_delivery_logs table to record each delivery
--   attempt for a notification. One row per attempt, keyed by
--   notification_id + attempt_number. Provides an auditable trail of
--   dispatch outcomes (queued, sent, delivered, failed) without storing
--   raw provider payloads or introducing provider-specific sub-tables.
--
-- DESIGN DECISIONS:
--   - notification_id is NOT NULL with CASCADE delete so logs are cleaned
--     up automatically if a notification row is deleted.
--   - attempt_number is a positive integer — enforced by CHECK.
--     Uniqueness on (notification_id, attempt_number) prevents duplicate
--     attempt records for the same notification attempt sequence.
--   - delivery_status is constrained to: queued, sent, delivered, failed.
--     This is a narrower set than notification_status; it reflects only
--     the dispatch-level outcome.
--   - provider_name and provider_message_id are nullable short strings for
--     lightweight provider traceability — no raw payload columns.
--   - error_message is nullable TEXT for failure diagnostics.
--   - attempted_at is NOT NULL — every log row must have a timestamp.
--   - No updated_at — delivery log rows are immutable append-only records.
--   - No deleted_at — no soft delete.
--   - No retry scheduler fields, webhook event IDs, or provider-specific
--     sub-tables in this MVP scope.
--
-- SCHEMA CONTRACT:
--   id                   UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   notification_id      UUID NOT NULL
--   attempt_number       INT  NOT NULL        — must be > 0
--   delivery_status      VARCHAR(50) NOT NULL — queued|sent|delivered|failed
--   provider_name        VARCHAR(100) NULL
--   provider_message_id  VARCHAR(150) NULL
--   error_message        TEXT NULL
--   attempted_at         TIMESTAMP NOT NULL
--
-- ALLOWED delivery_status VALUES:
--   queued | sent | delivered | failed
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE notification_delivery_logs (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id     UUID          NOT NULL,
    attempt_number      INT           NOT NULL,
    delivery_status     VARCHAR(50)   NOT NULL,
    provider_name       VARCHAR(100)  NULL,
    provider_message_id VARCHAR(150)  NULL,
    error_message       TEXT          NULL,
    attempted_at        TIMESTAMP     NOT NULL,

    CONSTRAINT fk_notification_delivery_logs_notification_id
        FOREIGN KEY (notification_id)
        REFERENCES notifications(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_notification_delivery_logs_status
        CHECK (delivery_status IN ('queued', 'sent', 'delivered', 'failed')),

    CONSTRAINT ck_notification_delivery_logs_attempt_number_positive
        CHECK (attempt_number > 0)
);

-- Uniqueness: one log row per notification per attempt
CREATE UNIQUE INDEX ux_notification_delivery_logs_notification_id_attempt_number
    ON notification_delivery_logs (notification_id, attempt_number);

-- Supporting indexes
CREATE INDEX ix_notification_delivery_logs_notification_id
    ON notification_delivery_logs (notification_id);

CREATE INDEX ix_notification_delivery_logs_status
    ON notification_delivery_logs (delivery_status);

CREATE INDEX ix_notification_delivery_logs_attempted_at
    ON notification_delivery_logs (attempted_at);

CREATE INDEX ix_notification_delivery_logs_provider_message_id
    ON notification_delivery_logs (provider_message_id);
