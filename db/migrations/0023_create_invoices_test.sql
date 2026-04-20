DO $$
DECLARE
    v_booking_id UUID;
    v_invoice_id UUID;
    v_payment_id UUID;
BEGIN
    SELECT id INTO v_booking_id FROM bookings LIMIT 1;

    IF v_booking_id IS NULL THEN
        RAISE NOTICE 'Skipping runtime verify since we lack a booking in DB. Please run on a DB with seed data.';
        RETURN;
    END IF;

    -- 1. Valid Insert
    BEGIN
        INSERT INTO invoices (booking_id, invoice_number, invoice_status, subtotal_amount, total_amount, created_at, updated_at)
        VALUES (v_booking_id, 'INV-2026-001', 'issued', 1500.00, 1500.00, now(), now())
        RETURNING id INTO v_invoice_id;
        RAISE NOTICE 'Successfully inserted valid invoice.';
    END;

    -- 2. Duplicate invoice_number
    BEGIN
        INSERT INTO invoices (booking_id, invoice_number, invoice_status, subtotal_amount, total_amount, created_at, updated_at)
        VALUES (v_booking_id, 'INV-2026-001', 'draft', 100.00, 100.00, now(), now());
        RAISE EXCEPTION 'Failed to reject duplicate invoice_number';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'Caught duplicate invoice_number';
    END;

    -- 3. Invalid Status
    BEGIN
        INSERT INTO invoices (booking_id, invoice_number, invoice_status, subtotal_amount, total_amount, created_at, updated_at)
        VALUES (v_booking_id, 'INV-2026-002', 'invalid_status', 100.00, 100.00, now(), now());
        RAISE EXCEPTION 'Failed to reject invalid status';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid invoice status';
    END;

    -- 4. Negative Amounts
    BEGIN
        INSERT INTO invoices (booking_id, invoice_number, invoice_status, subtotal_amount, total_amount, created_at, updated_at)
        VALUES (v_booking_id, 'INV-2026-002', 'draft', -100.00, -100.00, now(), now());
        RAISE EXCEPTION 'Failed to reject negative amounts';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught negative amounts';
    END;

    -- 5. Total != Subtotal
    BEGIN
        INSERT INTO invoices (booking_id, invoice_number, invoice_status, subtotal_amount, total_amount, created_at, updated_at)
        VALUES (v_booking_id, 'INV-2026-002', 'draft', 1000.00, 1100.00, now(), now());
        RAISE EXCEPTION 'Failed to reject unequal total and subtotal';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught unequal total and subtotal';
    END;

    -- 6. Invalid Booking FK
    BEGIN
        INSERT INTO invoices (booking_id, invoice_number, invoice_status, subtotal_amount, total_amount, created_at, updated_at)
        VALUES (gen_random_uuid(), 'INV-2026-002', 'draft', 100.00, 100.00, now(), now());
        RAISE EXCEPTION 'Failed to reject invalid booking FK';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Caught invalid booking FK';
    END;

    -- 7. Test Relationship with Payments
    BEGIN
        -- Create a payment linked to the valid invoice
        INSERT INTO payments (booking_id, invoice_id, payment_status, payment_method, amount, created_at, updated_at)
        VALUES (v_booking_id, v_invoice_id, 'paid', 'cash', 1500.00, now(), now())
        RETURNING id INTO v_payment_id;
        RAISE NOTICE 'Successfully linked payment to invoice.';
        
        -- Try inserting a payment with a non-existent invoice_id
        BEGIN
            INSERT INTO payments (booking_id, invoice_id, payment_status, payment_method, amount, created_at, updated_at)
            VALUES (v_booking_id, gen_random_uuid(), 'paid', 'cash', 100.00, now(), now());
            RAISE EXCEPTION 'Failed to reject invalid invoice FK in payments';
        EXCEPTION WHEN foreign_key_violation THEN
            RAISE NOTICE 'Caught invalid invoice FK in payments table';
        END;

        -- Clean up payment
        DELETE FROM payments WHERE id = v_payment_id;
    END;

    -- Final Clean up
    DELETE FROM invoices WHERE id = v_invoice_id;

    RAISE NOTICE 'Invoices runtime verification passed successfully.';
END $$;
