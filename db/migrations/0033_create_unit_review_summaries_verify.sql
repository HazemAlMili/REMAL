-- ============================================================================
-- Verification Script for: 0033_create_unit_review_summaries
-- Ticket: DB-RR-03
-- ============================================================================

-- 1. Verify table structure — exactly 5 columns
SELECT column_name, data_type, is_nullable, numeric_precision, numeric_scale, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'unit_review_summaries'
ORDER BY ordinal_position;
-- Expected: 5 rows:
--   unit_id, published_review_count, average_rating,
--   last_review_published_at, updated_at

-- 2. Verify PK is unit_id
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name = 'unit_review_summaries'
  AND constraint_type = 'PRIMARY KEY';
-- Expected: 1 row with pk_* or unit_review_summaries_pkey

SELECT kcu.column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.table_constraints tc
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'unit_review_summaries'
  AND tc.constraint_type = 'PRIMARY KEY';
-- Expected: unit_id

-- 3. Verify no out-of-scope columns exist
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'unit_review_summaries'
  AND column_name IN (
      'owner_id', 'deleted_at', 'helpful_count',
      'sentiment_score', 'ranking_score', 'id'
  );
-- Expected: 0 rows

-- 4. Verify index exists
SELECT indexname
FROM pg_indexes
WHERE tablename = 'unit_review_summaries'
  AND indexname = 'ix_unit_review_summaries_last_review_published_at';
-- Expected: 1 row

-- 5. Insert valid summary row — should succeed
DO $$
DECLARE v_unit_id UUID;
BEGIN
    SELECT id INTO v_unit_id FROM units LIMIT 1;

    IF v_unit_id IS NULL THEN
        RAISE NOTICE 'SKIP: No units available to test insert.';
        RETURN;
    END IF;

    INSERT INTO unit_review_summaries (
        unit_id, published_review_count, average_rating,
        last_review_published_at, updated_at
    ) VALUES (
        v_unit_id, 3, 4.33, NOW(), NOW()
    );
    RAISE NOTICE 'PASS: Valid summary row inserted successfully.';
END;
$$;

-- 6. Verify negative published_review_count is rejected
DO $$
DECLARE v_unit_id UUID;
BEGIN
    SELECT id INTO v_unit_id FROM units
    WHERE id NOT IN (SELECT unit_id FROM unit_review_summaries)
    LIMIT 1;

    IF v_unit_id IS NULL THEN
        RAISE NOTICE 'SKIP: No unused unit available to test count constraint.';
        RETURN;
    END IF;

    INSERT INTO unit_review_summaries (
        unit_id, published_review_count, average_rating, updated_at
    ) VALUES (v_unit_id, -1, 4.00, NOW());
    RAISE NOTICE 'FAIL: Negative count should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: Negative count correctly rejected (check_violation)';
END;
$$;

-- 7. Verify average_rating outside 0..5 is rejected
DO $$
DECLARE v_unit_id UUID;
BEGIN
    SELECT id INTO v_unit_id FROM units
    WHERE id NOT IN (SELECT unit_id FROM unit_review_summaries)
    LIMIT 1;

    IF v_unit_id IS NULL THEN
        RAISE NOTICE 'SKIP: No unused unit available to test average_rating constraint.';
        RETURN;
    END IF;

    INSERT INTO unit_review_summaries (
        unit_id, published_review_count, average_rating, updated_at
    ) VALUES (v_unit_id, 0, 5.10, NOW());
    RAISE NOTICE 'FAIL: average_rating > 5 should have been rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'PASS: average_rating > 5 correctly rejected (check_violation)';
END;
$$;

-- 8. Verify duplicate unit_id is rejected (PK enforcement)
DO $$
DECLARE v_unit_id UUID;
BEGIN
    SELECT unit_id INTO v_unit_id FROM unit_review_summaries LIMIT 1;

    IF v_unit_id IS NULL THEN
        RAISE NOTICE 'SKIP: No existing summary row to test duplicate PK.';
        RETURN;
    END IF;

    INSERT INTO unit_review_summaries (
        unit_id, published_review_count, average_rating, updated_at
    ) VALUES (v_unit_id, 1, 3.00, NOW());
    RAISE NOTICE 'FAIL: Duplicate unit_id should have been rejected!';
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Duplicate unit_id correctly rejected (unique_violation)';
END;
$$;

-- 9. Clean up test data
DELETE FROM unit_review_summaries WHERE average_rating = 4.33;
