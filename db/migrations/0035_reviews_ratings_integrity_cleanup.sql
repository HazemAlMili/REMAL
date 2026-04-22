-- ============================================================================
-- Migration:   0035_reviews_ratings_integrity_cleanup
-- Ticket:      DB-RR-05
-- Title:       Reviews & Ratings schema integrity cleanup and cross-table
--              verification
-- Database:    PostgreSQL 16
-- Depends on:  DB-RR-01 through DB-RR-04
-- Created:     2026-04-21
-- ============================================================================
--
-- PURPOSE:
--   Quality-gate pass for Reviews & Ratings Tier 1 DB work.
--   1. Normalise primary key constraint names to the project-wide pk_* pattern
--      (PostgreSQL auto-generates "{table}_pkey"; this migration aligns them
--      with the convention established in 0007_master_data_integrity_cleanup).
--   2. Attach COMMENT ON TABLE documentation to all four new tables.
--
--   This migration introduces NO new columns, indexes, or data.
--   All DDL here is either a rename or a comment — fully reversible.
--
-- TABLES COVERED:
--   reviews                  (DB-RR-01)
--   review_status_history    (DB-RR-02)
--   unit_review_summaries    (DB-RR-03)
--   review_replies           (DB-RR-04)
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

-- -----------------------------------------------------------------------
-- 1. Normalise primary key constraint names
-- -----------------------------------------------------------------------
ALTER TABLE reviews
    RENAME CONSTRAINT reviews_pkey TO pk_reviews;

ALTER TABLE review_status_history
    RENAME CONSTRAINT review_status_history_pkey TO pk_review_status_history;

-- unit_review_summaries PK is on unit_id; PostgreSQL still names it
-- "{table}_pkey" unless overridden at creation time.
ALTER TABLE unit_review_summaries
    RENAME CONSTRAINT unit_review_summaries_pkey TO pk_unit_review_summaries;

ALTER TABLE review_replies
    RENAME CONSTRAINT review_replies_pkey TO pk_review_replies;


-- -----------------------------------------------------------------------
-- 2. Finalise table documentation
-- -----------------------------------------------------------------------
COMMENT ON TABLE reviews IS
    'DB-RR-01 | Core review record. '
    'One review per booking (ux_reviews_booking_id). '
    'Rating bounded 1–5 (ck_reviews_rating_range). '
    'Status: pending | published | rejected | hidden (ck_reviews_status). '
    'No helpfulness, report, media, or reply fields in this table. '
    'Scope frozen per DB-RR-01.';

COMMENT ON TABLE review_status_history IS
    'DB-RR-02 | Append-only moderation audit trail for review status transitions. '
    'old_status nullable for initial creation row. '
    'Admin actor optional (changed_by_admin_user_id). '
    'Cascades on review delete. '
    'No actor polymorphism, notification, or moderation queue fields. '
    'Scope frozen per DB-RR-02.';

COMMENT ON TABLE unit_review_summaries IS
    'DB-RR-03 | Published review aggregate snapshot per unit. '
    'One row per unit (PK = unit_id). '
    'published_review_count >= 0; average_rating in [0.00, 5.00]. '
    'Updated by application layer on review publish/hide/reject. '
    'No owner summary, helpfulness, sentiment, or ranking fields. '
    'Scope frozen per DB-RR-03.';

COMMENT ON TABLE review_replies IS
    'DB-RR-04 | Single owner reply per review (ux_review_replies_review_id). '
    'Cascades on review delete. '
    'reply_text must not be blank (ck_review_replies_reply_text_not_blank). '
    'No threaded structure, admin replies, edit history, or media fields. '
    'Scope frozen per DB-RR-04.';
