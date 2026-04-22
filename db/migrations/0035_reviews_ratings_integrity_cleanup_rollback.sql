-- ============================================================================
-- Rollback:    0035_reviews_ratings_integrity_cleanup (ROLLBACK)
-- Ticket:      DB-RR-05
-- Reverts:     0035_reviews_ratings_integrity_cleanup.sql
-- Database:    PostgreSQL 16
-- Created:     2026-04-21
-- ============================================================================
--
-- Reverts PK renames back to PostgreSQL auto-generated names.
-- Clears COMMENT ON TABLE entries.
-- ============================================================================


-- =====================
-- DOWN MIGRATION
-- =====================

-- Revert PK constraint renames
ALTER TABLE review_replies
    RENAME CONSTRAINT pk_review_replies TO review_replies_pkey;

ALTER TABLE unit_review_summaries
    RENAME CONSTRAINT pk_unit_review_summaries TO unit_review_summaries_pkey;

ALTER TABLE review_status_history
    RENAME CONSTRAINT pk_review_status_history TO review_status_history_pkey;

ALTER TABLE reviews
    RENAME CONSTRAINT pk_reviews TO reviews_pkey;

-- Clear table comments
COMMENT ON TABLE review_replies          IS NULL;
COMMENT ON TABLE unit_review_summaries   IS NULL;
COMMENT ON TABLE review_status_history   IS NULL;
COMMENT ON TABLE reviews                 IS NULL;
