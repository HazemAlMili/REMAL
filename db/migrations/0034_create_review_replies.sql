-- ============================================================================
-- Migration:   0034_create_review_replies
-- Ticket:      DB-RR-04
-- Title:       Create review_replies table for single owner reply per review
-- Database:    PostgreSQL 16
-- Depends on:  0031_create_reviews, owners
-- Created:     2026-04-21
-- ============================================================================
--
-- PURPOSE:
--   Create the review_replies table supporting a single owner-authored reply
--   per review in the MVP. The reply is visible by default and can be toggled
--   via is_visible. No threaded comments, no admin replies, no edit history.
--
-- DESIGN DECISIONS:
--   - One reply per review enforced by unique index on review_id (ux_review_replies_review_id).
--   - reply_text is required and may not be blank; enforced via
--     CHECK (btrim(reply_text) <> '').
--   - is_visible defaults to TRUE — owner reply is public by default.
--   - ON DELETE CASCADE on review_id: a reply has no meaning without its
--     parent review.
--   - ON DELETE RESTRICT on owner_id: owner records must not be deleted
--     while replies reference them.
--   - No parent_reply_id, no admin_user_id, no edit history, no media,
--     no reactions, no deleted_at.
--
-- SCHEMA CONTRACT:
--   id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   review_id    UUID NOT NULL
--   owner_id     UUID NOT NULL
--   reply_text   TEXT NOT NULL
--   is_visible   BOOLEAN NOT NULL DEFAULT TRUE
--   created_at   TIMESTAMP NOT NULL
--   updated_at   TIMESTAMP NOT NULL
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE review_replies (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id   UUID        NOT NULL,
    owner_id    UUID        NOT NULL,
    reply_text  TEXT        NOT NULL,
    is_visible  BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP   NOT NULL,
    updated_at  TIMESTAMP   NOT NULL,

    CONSTRAINT fk_review_replies_review_id
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,

    CONSTRAINT fk_review_replies_owner_id
        FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,

    CONSTRAINT ck_review_replies_reply_text_not_blank
        CHECK (btrim(reply_text) <> '')
);

-- One reply per review in MVP
CREATE UNIQUE INDEX ux_review_replies_review_id ON review_replies (review_id);

-- Lookup indexes
CREATE INDEX ix_review_replies_owner_id   ON review_replies (owner_id);
CREATE INDEX ix_review_replies_is_visible ON review_replies (is_visible);
