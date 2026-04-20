DO $$
DECLARE
    v_booking_id UUID;
    v_owner_id UUID;
    v_payout_id UUID;
BEGIN
    -- Get valid master data
    SELECT id INTO v_booking_id FROM bookings LIMIT 1;
    SELECT id INTO v_owner_id FROM owners LIMIT 1;

    IF v_booking_id IS NULL OR v_owner_id IS NULL THEN
        RAISE NOTICE 'Skipping runtime verify since we lack master data (bookings/owners) in DB.';
        RETURN;
    END IF;

    -- 1. Valid Insert
    BEGIN
        INSERT INTO owner_payouts (booking_id, owner_id, payout_status, gross_booking_amount, commission_rate, commission_amount, payout_amount, created_at, updated_at)
        VALUES (v_booking_id, v_owner_id, 'pending', 1000.00, 20.00, 200.00, 800.00, now(), now())
        RETURNING id INTO v_payout_id;
        RAISE NOTICE 'Successfully inserted valid owner payout.';
    END;

    -- 2. Duplicate booking_id (Unique Index)
    BEGIN
        INSERT INTO owner_payouts (booking_id, owner_id, payout_status, gross_booking_amount, commission_rate, commission_amount, payout_amount, created_at, updated_at)
        VALUES (v_booking_id, v_owner_id, 'scheduled', 1000.00, 20.00, 200.00, 800.00, now(), now());
        RAISE EXCEPTION 'Failed to reject duplicate booking_id';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'Caught duplicate booking_id';
    END;

    -- 3. Invalid Status
    BEGIN
        INSERT INTO owner_payouts (booking_id, owner_id, payout_status, gross_booking_amount, commission_rate, commission_amount, payout_amount, created_at, updated_at)
        VALUES (v_booking_id, v_owner_id, 'unrecognized', 1000.00, 20.00, 200.00, 800.00, now(), now());
        RAISE EXCEPTION 'Failed to reject invalid status';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid payout status';
    END;

    -- 4. Commission Rate outside 0..100
    BEGIN
        INSERT INTO owner_payouts (booking_id, owner_id, payout_status, gross_booking_amount, commission_rate, commission_amount, payout_amount, created_at, updated_at)
        VALUES (v_booking_id, v_owner_id, 'pending', 1000.00, 110.00, 1100.00, -100.00, now(), now());
        RAISE EXCEPTION 'Failed to reject commission_rate > 100';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid commission_rate';
    END;

    -- 5. Invalid Formula (payout != gross - commission)
    BEGIN
        INSERT INTO owner_payouts (booking_id, owner_id, payout_status, gross_booking_amount, commission_rate, commission_amount, payout_amount, created_at, updated_at)
        VALUES (v_booking_id, v_owner_id, 'pending', 1000.00, 20.00, 200.00, 900.00, now(), now());
        RAISE EXCEPTION 'Failed to reject invalid formula';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid payout formula';
    END;

    -- 6. Invalid Booking FK
    BEGIN
        INSERT INTO owner_payouts (booking_id, owner_id, payout_status, gross_booking_amount, commission_rate, commission_amount, payout_amount, created_at, updated_at)
        VALUES (gen_random_uuid(), v_owner_id, 'pending', 0.00, 0.00, 0.00, 0.00, now(), now());
        RAISE EXCEPTION 'Failed to reject invalid booking FK';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Caught invalid booking FK';
    END;

    -- Clean up
    DELETE FROM owner_payouts WHERE id = v_payout_id;

    RAISE NOTICE 'Owner payouts runtime verification passed successfully.';
END $$;
