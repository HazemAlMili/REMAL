DO $$
DECLARE
    v_booking_id UUID;
    v_payment_id UUID;
BEGIN
    SELECT id INTO v_booking_id FROM bookings LIMIT 1;

    IF v_booking_id IS NULL THEN
        RAISE NOTICE 'Skipping runtime verify since we lack a booking in DB. Please run on a DB with seed data.';
        RETURN;
    END IF;

    -- Valid Insert
    BEGIN
        INSERT INTO payments (booking_id, payment_status, payment_method, amount, reference_number, notes, created_at, updated_at)
        VALUES (v_booking_id, 'pending', 'cash', 1000.00, 'REF-123', 'Deposit payment', now(), now())
        RETURNING id INTO v_payment_id;
        RAISE NOTICE 'Successfully inserted valid payment.';
        
        -- Clean up
        DELETE FROM payments WHERE id = v_payment_id;
    END;

    -- Invalid Status
    BEGIN
        INSERT INTO payments (booking_id, payment_status, payment_method, amount, reference_number, notes, created_at, updated_at)
        VALUES (v_booking_id, 'unknown_status', 'cash', 500.00, NULL, NULL, now(), now());
        RAISE EXCEPTION 'Failed to reject invalid status';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid payment status';
    END;

    -- Invalid Method
    BEGIN
        INSERT INTO payments (booking_id, payment_status, payment_method, amount, reference_number, notes, created_at, updated_at)
        VALUES (v_booking_id, 'paid', 'crypto', 500.00, NULL, NULL, now(), now());
        RAISE EXCEPTION 'Failed to reject invalid method';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid payment method';
    END;

    -- Amount <= 0
    BEGIN
        INSERT INTO payments (booking_id, payment_status, payment_method, amount, reference_number, notes, created_at, updated_at)
        VALUES (v_booking_id, 'paid', 'cash', 0, NULL, NULL, now(), now());
        RAISE EXCEPTION 'Failed to reject non-positive amount';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught non-positive amount';
    END;

    -- Invalid Booking FK
    BEGIN
        INSERT INTO payments (booking_id, payment_status, payment_method, amount, reference_number, notes, created_at, updated_at)
        VALUES (gen_random_uuid(), 'paid', 'cash', 100.0, NULL, NULL, now(), now());
        RAISE EXCEPTION 'Failed to reject invalid booking FK';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Caught invalid booking FK';
    END;

    -- Note: Invalid invoice FK cannot be tested as the table doesn't exist yet.

    RAISE NOTICE 'Payments runtime verification passed successfully.';
END $$;
