-- ============================================================================
-- Migration:   0033_create_unit_review_summaries
-- Ticket:      DB-RR-03
-- Title:       Create unit_review_summaries table for published review
--              aggregate snapshot per unit
-- Database:    PostgreSQL 16
-- Depends on:  0031_create_reviews, units
-- Created:     2026-04-21
-- ============================================================================
--
-- PURPOSE:
--   Create a snapshot aggregate table that stores the current published
--   review statistics per unit. Avoids repeated COUNT/AVG queries against
--   raw reviews at read time. Updated by the application layer whenever a
--   review is published, hidden, or rejected.
--
-- DESIGN DECISIONS:
--   - unit_id is the PRIMARY KEY — one row per unit.
--   - average_rating is DECIMAL(3,2) to hold values like 4.75 accurately.
--   - When a unit has no published reviews, average_rating = 0.00 is valid
--     in MVP (no NULL handling required at this layer).
--   - last_review_published_at is nullable — NULL until at least one review
--     is published for the unit.
--   - No owner_id, no helpfulness/sentiment fields, no materialized view.
--   - No deleted_at.
--
-- SCHEMA CONTRACT:
--   unit_id                  UUID PRIMARY KEY
--   published_review_count   INT NOT NULL
--   average_rating           DECIMAL(3,2) NOT NULL
--   last_review_published_at TIMESTAMP NULL
--   updated_at               TIMESTAMP NOT NULL
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE unit_review_summaries (
    unit_id                  UUID           PRIMARY KEY,
    published_review_count   INT            NOT NULL,
    average_rating           DECIMAL(3,2)   NOT NULL,
    last_review_published_at TIMESTAMP      NULL,
    updated_at               TIMESTAMP      NOT NULL,

    CONSTRAINT fk_unit_review_summaries_unit_id
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT,

    CONSTRAINT ck_unit_review_summaries_count_non_negative
        CHECK (published_review_count >= 0),

    CONSTRAINT ck_unit_review_summaries_average_range
        CHECK (average_rating >= 0 AND average_rating <= 5)
);

-- Lookup index for sorting/filtering units by last published review
CREATE INDEX ix_unit_review_summaries_last_review_published_at
    ON unit_review_summaries (last_review_published_at);
