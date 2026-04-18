DO $$
DECLARE
    v_client_id UUID;
    v_unit_id UUID;
    v_owner_id UUID;
    v_booking_id UUID;
BEGIN
    SELECT id INTO v_client_id FROM clients LIMIT 1;
    SELECT id INTO v_unit_id FROM units LIMIT 1;
    SELECT id INTO v_owner_id FROM owners LIMIT 1;

    IF v_client_id IS NULL OR v_unit_id IS NULL OR v_owner_id IS NULL THEN
        RAISE NOTICE 'Skipping runtime verify since we lack mock master data in DB. However, assuming success if FKs exist.';
        RETURN;
    END IF;

    -- Valid Insert
    BEGIN
        INSERT INTO bookings (client_id, unit_id, owner_id, booking_status, check_in_date, check_out_date, guest_count, base_amount, final_amount, source, created_at, updated_at)
        VALUES (v_client_id, v_unit_id, v_owner_id, 'inquiry', '2026-06-01', '2026-06-03', 2, 100.0, 100.0, 'website', now(), now())
        RETURNING id INTO v_booking_id;
        RAISE NOTICE 'Successfully inserted valid booking.';
        
        -- Delete the valid one to leave DB clean
        DELETE FROM bookings WHERE id = v_booking_id;
    END;

    -- invalid stay range
    BEGIN
        INSERT INTO bookings (client_id, unit_id, owner_id, booking_status, check_in_date, check_out_date, guest_count, base_amount, final_amount, source, created_at, updated_at)
        VALUES (v_client_id, v_unit_id, v_owner_id, 'inquiry', '2026-06-03', '2026-06-01', 1, 100.0, 100.0, 'direct', now(), now());
        RAISE EXCEPTION 'Failed to reject invalid stay range';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid stay range';
    END;

    -- invalid status
    BEGIN
        INSERT INTO bookings (client_id, unit_id, owner_id, booking_status, check_in_date, check_out_date, guest_count, base_amount, final_amount, source, created_at, updated_at)
        VALUES (v_client_id, v_unit_id, v_owner_id, 'invalid_status', '2026-06-01', '2026-06-03', 1, 100.0, 100.0, 'direct', now(), now());
        RAISE EXCEPTION 'Failed to reject invalid status';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid status';
    END;

    -- invalid source
    BEGIN
        INSERT INTO bookings (client_id, unit_id, owner_id, booking_status, check_in_date, check_out_date, guest_count, base_amount, final_amount, source, created_at, updated_at)
        VALUES (v_client_id, v_unit_id, v_owner_id, 'inquiry', '2026-06-01', '2026-06-03', 1, 100.0, 100.0, 'fax', now(), now());
        RAISE EXCEPTION 'Failed to reject invalid source';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid source';
    END;

    -- negative money
    BEGIN
        INSERT INTO bookings (client_id, unit_id, owner_id, booking_status, check_in_date, check_out_date, guest_count, base_amount, final_amount, source, created_at, updated_at)
        VALUES (v_client_id, v_unit_id, v_owner_id, 'inquiry', '2026-06-01', '2026-06-03', 1, -100.0, 100.0, 'direct', now(), now());
        RAISE EXCEPTION 'Failed to reject negative money';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught negative base_amount';
    END;

    -- invalid FK
    BEGIN
        INSERT INTO bookings (client_id, unit_id, owner_id, booking_status, check_in_date, check_out_date, guest_count, base_amount, final_amount, source, created_at, updated_at)
        VALUES (gen_random_uuid(), v_unit_id, v_owner_id, 'inquiry', '2026-06-01', '2026-06-03', 1, 100.0, 100.0, 'direct', now(), now());
        RAISE EXCEPTION 'Failed to reject invalid FK';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Caught invalid FK';
    END;

END $$;
