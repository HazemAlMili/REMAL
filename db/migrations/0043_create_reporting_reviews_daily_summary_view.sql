-- ============================================================================
-- Migration:   0043_create_reporting_reviews_daily_summary_view
-- Ticket:      DB-RA-04
-- Title:       Create reporting_reviews_daily_summary SQL view for daily
--              published-review and owner-reply analytics
-- Database:    PostgreSQL 16
-- Depends on:  0031_create_reviews       (reviews table)
--              0034_create_review_replies (review_replies table)
--              0013_reports_analytics_db_scope decision (read-model-first freeze)
-- Created:     2026-04-22
-- ============================================================================
--
-- PURPOSE:
--   Create a read-model view that exposes daily analytics for published
--   reviews, grouped by the calendar day on which each review was published.
--   Provides published count, average rating, and owner-reply participation
--   counts so that Data Access and API layers do not need to reconstruct
--   these aggregations independently.
--
-- VIEW CONTRACT (5 columns):
--   metric_date                           DATE          — calendar day of review publication
--   published_reviews_count               INT           — total published reviews for this day
--   average_rating                        DECIMAL(3,2)  — average rating of published reviews; 0.00 if none
--   reviews_with_owner_reply_count        INT           — published reviews that have any reply row
--   reviews_with_visible_owner_reply_count INT          — published reviews with a reply where is_visible = true
--
-- GROUPING:
--   One row per DATE(reviews.published_at)
--
-- FILTER RULES:
--   • Only reviews with review_status = 'published' are included.
--   • pending / rejected / hidden reviews do NOT contribute.
--   • reviews.published_at must be non-NULL for published rows (by design).
--
-- JOIN LOGIC:
--   FROM reviews
--   LEFT JOIN review_replies ON review_replies.review_id = reviews.id
--   WHERE reviews.review_status = 'published'
--
-- SCOPE RULES (per DB-RA-01 freeze):
--   ✓ Read-only view — no table created
--   ✓ Published reviews only
--   ✓ No materialized view
--   ✗ No helpfulness / likes / abuse-report analytics
--   ✗ No media attachment analytics
--   ✗ No sentiment analysis fields
--   ✗ No owner-level drilldown (owner_id)
--   ✗ No unit-level drilldown (unit_id)
--   ✗ No warehouse / fact / dimension tables
-- ============================================================================

CREATE OR REPLACE VIEW reporting_reviews_daily_summary AS
SELECT
    DATE(r.published_at)                                                            AS metric_date,
    COUNT(*)                                                                        AS published_reviews_count,
    COALESCE(AVG(r.rating), 0.00)::DECIMAL(3,2)                                     AS average_rating,
    COUNT(*) FILTER (WHERE rr.review_id IS NOT NULL)                                AS reviews_with_owner_reply_count,
    COUNT(*) FILTER (WHERE rr.review_id IS NOT NULL AND rr.is_visible = TRUE)       AS reviews_with_visible_owner_reply_count
FROM reviews r
LEFT JOIN review_replies rr
    ON rr.review_id = r.id
WHERE r.review_status = 'published'
GROUP BY
    DATE(r.published_at);

COMMENT ON VIEW reporting_reviews_daily_summary IS
    'Reports & Analytics read model: daily published-review counts, average rating, '
    'and owner-reply participation by publication date. '
    'Published reviews only — pending/rejected/hidden excluded. '
    'Source: reviews, review_replies. Scope frozen per DB-RA-01.';
