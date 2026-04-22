-- ============================================================================
-- Migration:   0036_create_notification_templates
-- Ticket:      DB-NA-01
-- Title:       Create notification_templates table for channel-specific
--              notification template definitions
-- Database:    PostgreSQL 16
-- Depends on:  (none — no FK dependencies in MVP)
-- Created:     2026-04-22
-- ============================================================================
--
-- PURPOSE:
--   Create the notification_templates table as the source-of-truth for all
--   channel-specific notification text definitions. Templates are keyed by
--   template_code + channel + recipient_role, which must be unique. This
--   prevents hardcoded strings from spreading across the Business/API layers
--   and gives a single auditable location for all notification content.
--
-- DESIGN DECISIONS:
--   - template_code is a short slug identifying the notification event
--     (e.g. 'booking_confirmed', 'review_published'). Uniqueness is enforced
--     per channel + recipient_role combination.
--   - channel is constrained to MVP-allowed values: in_app, email, sms,
--     whatsapp. No provider/integration fields in this ticket.
--   - recipient_role is constrained to: admin, client, owner.
--   - subject_template is nullable — in_app notifications have no subject.
--   - body_template is NOT NULL and must be non-blank.
--   - is_active allows templates to be disabled without deletion.
--   - No deleted_at — no soft delete in this MVP scope.
--   - No localization, version history, campaign, JSON variable schema,
--     or provider integration fields.
--
-- SCHEMA CONTRACT:
--   id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   template_code    VARCHAR(100) NOT NULL      — non-blank slug
--   channel          VARCHAR(50)  NOT NULL      — in_app|email|sms|whatsapp
--   recipient_role   VARCHAR(50)  NOT NULL      — admin|client|owner
--   subject_template VARCHAR(200) NULL          — null allowed (in_app)
--   body_template    TEXT         NOT NULL      — non-blank
--   is_active        BOOLEAN      NOT NULL DEFAULT TRUE
--   created_at       TIMESTAMP    NOT NULL
--   updated_at       TIMESTAMP    NOT NULL
--
-- ALLOWED channel VALUES:
--   in_app | email | sms | whatsapp
--
-- ALLOWED recipient_role VALUES:
--   admin | client | owner
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE notification_templates (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    template_code    VARCHAR(100)  NOT NULL,
    channel          VARCHAR(50)   NOT NULL,
    recipient_role   VARCHAR(50)   NOT NULL,
    subject_template VARCHAR(200)  NULL,
    body_template    TEXT          NOT NULL,
    is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP     NOT NULL,
    updated_at       TIMESTAMP     NOT NULL,

    CONSTRAINT ck_notification_templates_channel
        CHECK (channel IN ('in_app', 'email', 'sms', 'whatsapp')),

    CONSTRAINT ck_notification_templates_recipient_role
        CHECK (recipient_role IN ('admin', 'client', 'owner')),

    CONSTRAINT ck_notification_templates_template_code_not_blank
        CHECK (btrim(template_code) <> ''),

    CONSTRAINT ck_notification_templates_body_template_not_blank
        CHECK (btrim(body_template) <> '')
);

-- Uniqueness: one template definition per code + channel + role combination
CREATE UNIQUE INDEX ux_notification_templates_code_channel_role
    ON notification_templates (template_code, channel, recipient_role);

-- Supporting indexes
CREATE INDEX ix_notification_templates_channel
    ON notification_templates (channel);

CREATE INDEX ix_notification_templates_recipient_role
    ON notification_templates (recipient_role);

CREATE INDEX ix_notification_templates_is_active
    ON notification_templates (is_active);
