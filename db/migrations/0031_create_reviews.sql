-- ============================================================================
-- Migration:   0031_create_reviews
-- Ticket:      DB-RR-01
-- Title:       Create reviews table as the core client review record
-- Database:    PostgreSQL 16
-- Depends on:  bookings, units, clients, owners
-- Created:     2026-04-21
-- ============================================================================
--
-- PURPOSE:
--   Create the reviews table as the source of truth for client reviews
--   linked to completed bookings. Supports rating (1–5), optional title
--   and comment text, review status lifecycle, and publication timing.
--
-- DESIGN DECISIONS:
--   - One review per booking enforced by unique index on booking_id.
--   - rating bounded 1..5 via CHECK constraint (ck_reviews_rating_range).
--   - review_status is a VARCHAR with CHECK constraint (ck_reviews_status).
--   - title/comment are nullable — review content is optional in MVP.
--   - submitted_at tracks client submission time; published_at tracks when
--     the review became publicly visible (null until published).
--   - No deleted_at — no soft delete in this MVP scope.
--   - No helpfulness/likes, abuse reports, media attachments, or reply
--     fields in this table.
--
-- SCHEMA CONTRACT:
--   id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   booking_id      UUID NOT NULL
--   unit_id         UUID NOT NULL
--   client_id       UUID NOT NULL
--   owner_id        UUID NOT NULL
--   rating          INT NOT NULL               — 1..5
--   title           VARCHAR(150) NULL
--   comment         TEXT NULL
--   review_status   VARCHAR(50) NOT NULL       — pending|published|rejected|hidden
--   submitted_at    TIMESTAMP NOT NULL
--   published_at    TIMESTAMP NULL
--   created_at      TIMESTAMP NOT NULL
--   updated_at      TIMESTAMP NOT NULL
--
-- ALLOWED review_status VALUES:
--   pending | published | rejected | hidden
--
-- ============================================================================


-- =====================
-- UP MIGRATION
-- =====================

CREATE TABLE reviews (
    id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id     UUID           NOT NULL,
    unit_id        UUID           NOT NULL,
    client_id      UUID           NOT NULL,
    owner_id       UUID           NOT NULL,
    rating         INT            NOT NULL,
    title          VARCHAR(150)   NULL,
    comment        TEXT           NULL,
    review_status  VARCHAR(50)    NOT NULL,
    submitted_at   TIMESTAMP      NOT NULL,
    published_at   TIMESTAMP      NULL,
    created_at     TIMESTAMP      NOT NULL,
    updated_at     TIMESTAMP      NOT NULL,

    CONSTRAINT fk_reviews_booking_id
        FOREIGN KEY (booking_id)  REFERENCES bookings(id)  ON DELETE RESTRICT,

    CONSTRAINT fk_reviews_unit_id
        FOREIGN KEY (unit_id)     REFERENCES units(id)     ON DELETE RESTRICT,

    CONSTRAINT fk_reviews_client_id
        FOREIGN KEY (client_id)   REFERENCES clients(id)   ON DELETE RESTRICT,

    CONSTRAINT fk_reviews_owner_id
        FOREIGN KEY (owner_id)    REFERENCES owners(id)    ON DELETE RESTRICT,

    CONSTRAINT ck_reviews_rating_range
        CHECK (rating >= 1 AND rating <= 5),

    CONSTRAINT ck_reviews_status
        CHECK (review_status IN ('pending', 'published', 'rejected', 'hidden'))
);

-- One review per booking in MVP
CREATE UNIQUE INDEX ux_reviews_booking_id ON reviews (booking_id);

-- Lookup indexes
CREATE INDEX ix_reviews_unit_id      ON reviews (unit_id);
CREATE INDEX ix_reviews_owner_id     ON reviews (owner_id);
CREATE INDEX ix_reviews_client_id    ON reviews (client_id);
CREATE INDEX ix_reviews_status       ON reviews (review_status);
CREATE INDEX ix_reviews_published_at ON reviews (published_at);
