-- ============================================================================
-- Migration:   0032_create_review_status_history
-- Ticket:      DB-RR-02
-- Title:       Create review_status_history table for moderation audit trail
-- Database:    PostgreSQL 16
-- Depends on:  0031_create_reviews, admin_users
-- Created:     2026-04-21
-- ============================================================================
--
-- PURPOSE:
--   Create an append-only audit trail for every review_status transition.
--   Captures old status (nullable for the initial row), new status,
--   optional admin actor, notes, and the timestamp of the change.
--
-- DESIGN DECISIONS:
--   - old_status is nullable to support the initial "creation" history row
--     (no prior status before a review is first created).
--   - new_status is required on every row.
--   - changed_by_admin_user_id is nullable — system transitions or future
--     automated moderation produce rows without an admin actor.
--   - ON DELETE CASCADE on review_id: history rows have no meaning without
--     their parent review; cascade keeps referential hygiene.
--   - ON DELETE RESTRICT on changed_by_admin_user_id: admin user records
--     must not be deleted while moderation history references them.
--   - No actor_type/actor_id polymorphism — admin-only actor for MVP.
--   - No notification, moderation queue, or soft-delete fields.
--
-- SCHEMA CONTRACT:
--   id                        UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   review_id                 UUID NOT NULL
--   old_status                VARCHAR(50) NULL
--   new_status                VARCHAR(50) NOT NULL
--   changed_by_admin_user_id  UUID NULL
--   notes                     TEXT NULL
--   changed_at                TIMESTAMP NOT NULL
--
-- ALLOWED STATUS VALUES (old_status when not null, new_status always):
--   pending | published | rejected | hidden
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE review_status_history (
    id                        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id                 UUID         NOT NULL,
    old_status                VARCHAR(50)  NULL,
    new_status                VARCHAR(50)  NOT NULL,
    changed_by_admin_user_id  UUID         NULL,
    notes                     TEXT         NULL,
    changed_at                TIMESTAMP    NOT NULL,

    CONSTRAINT fk_review_status_history_review_id
        FOREIGN KEY (review_id)
            REFERENCES reviews(id) ON DELETE CASCADE,

    CONSTRAINT fk_review_status_history_changed_by_admin_user_id
        FOREIGN KEY (changed_by_admin_user_id)
            REFERENCES admin_users(id) ON DELETE RESTRICT,

    CONSTRAINT ck_review_status_history_old_status
        CHECK (old_status IS NULL OR old_status IN ('pending', 'published', 'rejected', 'hidden')),

    CONSTRAINT ck_review_status_history_new_status
        CHECK (new_status IN ('pending', 'published', 'rejected', 'hidden'))
);

-- Lookup indexes
CREATE INDEX ix_review_status_history_review_id
    ON review_status_history (review_id);

CREATE INDEX ix_review_status_history_changed_at
    ON review_status_history (changed_at);

CREATE INDEX ix_review_status_history_changed_by_admin_user_id
    ON review_status_history (changed_by_admin_user_id);
