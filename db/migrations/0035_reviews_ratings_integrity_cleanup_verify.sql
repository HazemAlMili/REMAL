-- ============================================================================
-- Verify:      0035_reviews_ratings_integrity_cleanup_verify
-- Ticket:      DB-RR-05
-- Verifies:    Full Reviews & Ratings Tier 1 DB domain (DB-RR-01–DB-RR-05)
-- ============================================================================
--
-- Comprehensive cross-table assertion covering:
--   1. All four Reviews & Ratings tables exist
--   2. Each table has the exact contracted column count
--   3. Required columns are present in each table
--   4. Forbidden columns are absent from every table
--   5. Uniqueness constraints exist (one review per booking, one reply per review)
--   6. PK constraint names follow the pk_* convention
--   7. All required indexes exist across all four tables
--   8. No unintended Reviews & Ratings write-side tables exist beyond the contract
-- ============================================================================

DO $$
DECLARE
    v_col_count       INT;
    v_index_count     INT;
    v_constraint_name TEXT;
BEGIN

    -- =======================================================================
    -- SECTION 1: All four Reviews & Ratings tables must exist
    -- =======================================================================

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'reviews'
    ) THEN RAISE EXCEPTION '[DB-RR-01] Table reviews does not exist'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'review_status_history'
    ) THEN RAISE EXCEPTION '[DB-RR-02] Table review_status_history does not exist'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'unit_review_summaries'
    ) THEN RAISE EXCEPTION '[DB-RR-03] Table unit_review_summaries does not exist'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'review_replies'
    ) THEN RAISE EXCEPTION '[DB-RR-04] Table review_replies does not exist'; END IF;

    RAISE NOTICE '[PASS] All four Reviews & Ratings tables exist';


    -- =======================================================================
    -- SECTION 2: Column count contracts
    -- =======================================================================

    -- reviews: 13 columns
    SELECT COUNT(*) INTO v_col_count FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reviews';
    IF v_col_count <> 13 THEN
        RAISE EXCEPTION '[DB-RR-01] reviews has % columns; expected 13', v_col_count;
    END IF;

    -- review_status_history: 7 columns
    SELECT COUNT(*) INTO v_col_count FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'review_status_history';
    IF v_col_count <> 7 THEN
        RAISE EXCEPTION '[DB-RR-02] review_status_history has % columns; expected 7', v_col_count;
    END IF;

    -- unit_review_summaries: 5 columns
    SELECT COUNT(*) INTO v_col_count FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'unit_review_summaries';
    IF v_col_count <> 5 THEN
        RAISE EXCEPTION '[DB-RR-03] unit_review_summaries has % columns; expected 5', v_col_count;
    END IF;

    -- review_replies: 7 columns
    SELECT COUNT(*) INTO v_col_count FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'review_replies';
    IF v_col_count <> 7 THEN
        RAISE EXCEPTION '[DB-RR-04] review_replies has % columns; expected 7', v_col_count;
    END IF;

    RAISE NOTICE '[PASS] All column count contracts satisfied';


    -- =======================================================================
    -- SECTION 3: reviews — required column presence
    -- =======================================================================

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='id')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='booking_id')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: booking_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='unit_id')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: unit_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='client_id')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: client_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='owner_id')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: owner_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='rating')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: rating'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='title')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: title'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='comment')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: comment'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='review_status')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: review_status'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='submitted_at')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: submitted_at'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='published_at')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: published_at'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='created_at')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: created_at'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reviews' AND column_name='updated_at')
    THEN RAISE EXCEPTION '[DB-RR-01] reviews missing column: updated_at'; END IF;

    RAISE NOTICE '[PASS] reviews: all required columns present';


    -- =======================================================================
    -- SECTION 4: review_status_history — required column presence
    -- =======================================================================

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_status_history' AND column_name='id')
    THEN RAISE EXCEPTION '[DB-RR-02] review_status_history missing column: id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_status_history' AND column_name='review_id')
    THEN RAISE EXCEPTION '[DB-RR-02] review_status_history missing column: review_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_status_history' AND column_name='old_status')
    THEN RAISE EXCEPTION '[DB-RR-02] review_status_history missing column: old_status'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_status_history' AND column_name='new_status')
    THEN RAISE EXCEPTION '[DB-RR-02] review_status_history missing column: new_status'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_status_history' AND column_name='changed_by_admin_user_id')
    THEN RAISE EXCEPTION '[DB-RR-02] review_status_history missing column: changed_by_admin_user_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_status_history' AND column_name='notes')
    THEN RAISE EXCEPTION '[DB-RR-02] review_status_history missing column: notes'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_status_history' AND column_name='changed_at')
    THEN RAISE EXCEPTION '[DB-RR-02] review_status_history missing column: changed_at'; END IF;

    -- old_status must be nullable
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'review_status_history'
          AND column_name = 'old_status' AND is_nullable = 'NO'
    ) THEN RAISE EXCEPTION '[DB-RR-02] review_status_history.old_status must be nullable'; END IF;

    -- new_status must NOT be nullable
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'review_status_history'
          AND column_name = 'new_status' AND is_nullable = 'YES'
    ) THEN RAISE EXCEPTION '[DB-RR-02] review_status_history.new_status must NOT be nullable'; END IF;

    RAISE NOTICE '[PASS] review_status_history: all required columns present with correct nullability';


    -- =======================================================================
    -- SECTION 5: unit_review_summaries — required column presence
    -- =======================================================================

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='unit_review_summaries' AND column_name='unit_id')
    THEN RAISE EXCEPTION '[DB-RR-03] unit_review_summaries missing column: unit_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='unit_review_summaries' AND column_name='published_review_count')
    THEN RAISE EXCEPTION '[DB-RR-03] unit_review_summaries missing column: published_review_count'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='unit_review_summaries' AND column_name='average_rating')
    THEN RAISE EXCEPTION '[DB-RR-03] unit_review_summaries missing column: average_rating'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='unit_review_summaries' AND column_name='last_review_published_at')
    THEN RAISE EXCEPTION '[DB-RR-03] unit_review_summaries missing column: last_review_published_at'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='unit_review_summaries' AND column_name='updated_at')
    THEN RAISE EXCEPTION '[DB-RR-03] unit_review_summaries missing column: updated_at'; END IF;

    -- last_review_published_at must be nullable
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'unit_review_summaries'
          AND column_name = 'last_review_published_at' AND is_nullable = 'NO'
    ) THEN RAISE EXCEPTION '[DB-RR-03] unit_review_summaries.last_review_published_at must be nullable'; END IF;

    -- No separate id column — PK is unit_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'unit_review_summaries'
          AND column_name = 'id'
    ) THEN RAISE EXCEPTION '[DB-RR-03] unit_review_summaries must NOT have a separate id column; PK is unit_id'; END IF;

    RAISE NOTICE '[PASS] unit_review_summaries: all required columns present';


    -- =======================================================================
    -- SECTION 6: review_replies — required column presence
    -- =======================================================================

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_replies' AND column_name='id')
    THEN RAISE EXCEPTION '[DB-RR-04] review_replies missing column: id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_replies' AND column_name='review_id')
    THEN RAISE EXCEPTION '[DB-RR-04] review_replies missing column: review_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_replies' AND column_name='owner_id')
    THEN RAISE EXCEPTION '[DB-RR-04] review_replies missing column: owner_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_replies' AND column_name='reply_text')
    THEN RAISE EXCEPTION '[DB-RR-04] review_replies missing column: reply_text'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_replies' AND column_name='is_visible')
    THEN RAISE EXCEPTION '[DB-RR-04] review_replies missing column: is_visible'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_replies' AND column_name='created_at')
    THEN RAISE EXCEPTION '[DB-RR-04] review_replies missing column: created_at'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='review_replies' AND column_name='updated_at')
    THEN RAISE EXCEPTION '[DB-RR-04] review_replies missing column: updated_at'; END IF;

    RAISE NOTICE '[PASS] review_replies: all required columns present';


    -- =======================================================================
    -- SECTION 7: Forbidden columns — none must exist in any RR table
    -- =======================================================================

    -- Global forbidden list for Reviews & Ratings domain
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN ('reviews', 'review_status_history', 'unit_review_summaries', 'review_replies')
          AND column_name IN (
              'deleted_at',
              'helpful_count', 'helpfulness_count', 'like_count',
              'report_count', 'abuse_flag',
              'media_url', 'attachment_id',
              'parent_reply_id', 'thread_id',
              'admin_user_id',   -- in review_replies specifically
              'edit_history', 'edited_at',
              'sentiment_score', 'ranking_score',
              'actor_type', 'actor_id',
              'notification_sent', 'queue_id',
              'reply_text'       -- in reviews itself (replies belong in review_replies)
          )
    ) THEN
        RAISE EXCEPTION '[DB-RR-05] Forbidden column detected in Reviews & Ratings schema. '
            'Check for: deleted_at, helpful_count, like_count, report_count, media_url, '
            'parent_reply_id, admin_user_id (in review_replies), sentiment_score, actor_type/id, '
            'reply_text (in reviews table)';
    END IF;

    RAISE NOTICE '[PASS] No forbidden columns detected across Reviews & Ratings tables';


    -- =======================================================================
    -- SECTION 8: Uniqueness constraints exist
    -- =======================================================================

    -- One review per booking
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'reviews' AND indexname = 'ux_reviews_booking_id'
    ) THEN RAISE EXCEPTION '[DB-RR-01] Missing unique index: ux_reviews_booking_id on reviews'; END IF;

    -- One reply per review
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'review_replies' AND indexname = 'ux_review_replies_review_id'
    ) THEN RAISE EXCEPTION '[DB-RR-04] Missing unique index: ux_review_replies_review_id on review_replies'; END IF;

    RAISE NOTICE '[PASS] All uniqueness constraints present';


    -- =======================================================================
    -- SECTION 9: PK constraint names follow pk_* convention (DB-RR-05)
    -- =======================================================================

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'reviews'
          AND constraint_type = 'PRIMARY KEY' AND constraint_name = 'pk_reviews'
    ) THEN RAISE EXCEPTION '[DB-RR-05] reviews PK not named pk_reviews'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'review_status_history'
          AND constraint_type = 'PRIMARY KEY' AND constraint_name = 'pk_review_status_history'
    ) THEN RAISE EXCEPTION '[DB-RR-05] review_status_history PK not named pk_review_status_history'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'unit_review_summaries'
          AND constraint_type = 'PRIMARY KEY' AND constraint_name = 'pk_unit_review_summaries'
    ) THEN RAISE EXCEPTION '[DB-RR-05] unit_review_summaries PK not named pk_unit_review_summaries'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'review_replies'
          AND constraint_type = 'PRIMARY KEY' AND constraint_name = 'pk_review_replies'
    ) THEN RAISE EXCEPTION '[DB-RR-05] review_replies PK not named pk_review_replies'; END IF;

    RAISE NOTICE '[PASS] All PK constraint names follow pk_* convention';


    -- =======================================================================
    -- SECTION 10: Required indexes exist across all four tables
    -- =======================================================================

    -- reviews indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='reviews' AND indexname='ix_reviews_unit_id')
    THEN RAISE EXCEPTION '[DB-RR-01] Missing index: ix_reviews_unit_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='reviews' AND indexname='ix_reviews_owner_id')
    THEN RAISE EXCEPTION '[DB-RR-01] Missing index: ix_reviews_owner_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='reviews' AND indexname='ix_reviews_client_id')
    THEN RAISE EXCEPTION '[DB-RR-01] Missing index: ix_reviews_client_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='reviews' AND indexname='ix_reviews_status')
    THEN RAISE EXCEPTION '[DB-RR-01] Missing index: ix_reviews_status'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='reviews' AND indexname='ix_reviews_published_at')
    THEN RAISE EXCEPTION '[DB-RR-01] Missing index: ix_reviews_published_at'; END IF;

    -- review_status_history indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='review_status_history' AND indexname='ix_review_status_history_review_id')
    THEN RAISE EXCEPTION '[DB-RR-02] Missing index: ix_review_status_history_review_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='review_status_history' AND indexname='ix_review_status_history_changed_at')
    THEN RAISE EXCEPTION '[DB-RR-02] Missing index: ix_review_status_history_changed_at'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='review_status_history' AND indexname='ix_review_status_history_changed_by_admin_user_id')
    THEN RAISE EXCEPTION '[DB-RR-02] Missing index: ix_review_status_history_changed_by_admin_user_id'; END IF;

    -- unit_review_summaries indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='unit_review_summaries' AND indexname='ix_unit_review_summaries_last_review_published_at')
    THEN RAISE EXCEPTION '[DB-RR-03] Missing index: ix_unit_review_summaries_last_review_published_at'; END IF;

    -- review_replies indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='review_replies' AND indexname='ix_review_replies_owner_id')
    THEN RAISE EXCEPTION '[DB-RR-04] Missing index: ix_review_replies_owner_id'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='review_replies' AND indexname='ix_review_replies_is_visible')
    THEN RAISE EXCEPTION '[DB-RR-04] Missing index: ix_review_replies_is_visible'; END IF;

    RAISE NOTICE '[PASS] All required indexes present across all Reviews & Ratings tables';


    -- =======================================================================
    -- SECTION 11: No unintended Reviews & Ratings tables exist
    -- =======================================================================

    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name LIKE 'review%'
      AND table_name NOT IN (
          'reviews',
          'review_status_history',
          'review_replies'
      )
      AND table_type = 'BASE TABLE';

    -- unit_review_summaries is not prefixed with review_ but belongs to domain;
    -- check for unexpected tables prefixed with review_
    IF v_col_count > 0 THEN
        RAISE EXCEPTION '[DB-RR-05] Unexpected review_* table(s) detected in public schema. '
            'Only reviews, review_status_history, review_replies are in scope.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'unit_review_summaries'
    ) THEN RAISE EXCEPTION '[DB-RR-05] unit_review_summaries missing'; END IF;

    -- No materialized views for Reviews & Ratings domain
    IF EXISTS (
        SELECT 1 FROM pg_matviews
        WHERE schemaname = 'public'
          AND matviewname LIKE '%review%'
    ) THEN RAISE EXCEPTION '[DB-RR-05] Unexpected materialized view(s) for review domain detected'; END IF;

    RAISE NOTICE '[PASS] No unintended Reviews & Ratings tables or materialized views exist';


    -- =======================================================================
    -- FINAL SUMMARY
    -- =======================================================================

    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'DB-RR-05: Reviews & Ratings domain integrity — ALL CHECKS PASSED';
    RAISE NOTICE 'Tables verified: reviews, review_status_history, unit_review_summaries, review_replies';
    RAISE NOTICE '=======================================================';

END;
$$;
