DO $$
DECLARE
    v_booking_id UUID;
    v_invoice_id UUID;
    v_item_id UUID;
BEGIN
    SELECT id INTO v_booking_id FROM bookings LIMIT 1;

    IF v_booking_id IS NULL THEN
        RAISE NOTICE 'Skipping runtime verify since we lack a booking in DB. Please run on a DB with seed data.';
        RETURN;
    END IF;

    -- Create a valid invoice first
    INSERT INTO invoices (booking_id, invoice_number, invoice_status, subtotal_amount, total_amount, created_at, updated_at)
    VALUES (v_booking_id, 'TEST-INV-001', 'draft', 500.00, 500.00, now(), now())
    RETURNING id INTO v_invoice_id;

    -- 1. Valid Insert
    BEGIN
        INSERT INTO invoice_items (invoice_id, line_type, description, quantity, unit_amount, line_total, created_at, updated_at)
        VALUES (v_invoice_id, 'booking_stay', '2 nights at Unit A', 2, 250.00, 500.00, now(), now())
        RETURNING id INTO v_item_id;
        RAISE NOTICE 'Successfully inserted valid invoice item.';
    END;

    -- 2. Invalid Line Type
    BEGIN
        INSERT INTO invoice_items (invoice_id, line_type, description, quantity, unit_amount, line_total, created_at, updated_at)
        VALUES (v_invoice_id, 'illegal_fee', 'Bribes', 1, 100.00, 100.00, now(), now());
        RAISE EXCEPTION 'Failed to reject invalid line_type';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid line_type';
    END;

    -- 3. Quantity <= 0
    BEGIN
        INSERT INTO invoice_items (invoice_id, line_type, description, quantity, unit_amount, line_total, created_at, updated_at)
        VALUES (v_invoice_id, 'manual_adjustment', 'Zero quantity', 0, 100.00, 0.00, now(), now());
        RAISE EXCEPTION 'Failed to reject non-positive quantity';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught non-positive quantity';
    END;

    -- 4. Negative Amounts
    BEGIN
        INSERT INTO invoice_items (invoice_id, line_type, description, quantity, unit_amount, line_total, created_at, updated_at)
        VALUES (v_invoice_id, 'manual_adjustment', 'Negative amount', 1, -100.00, -100.00, now(), now());
        RAISE EXCEPTION 'Failed to reject negative amounts';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught negative amounts';
    END;

    -- 5. Formula Violation (quantity * unit_amount != line_total)
    BEGIN
        INSERT INTO invoice_items (invoice_id, line_type, description, quantity, unit_amount, line_total, created_at, updated_at)
        VALUES (v_invoice_id, 'booking_stay', 'Bad math', 2, 100.00, 300.00, now(), now());
        RAISE EXCEPTION 'Failed to reject invalid line_total formula';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'Caught invalid formula';
    END;

    -- 6. Invalid Invoice FK
    BEGIN
        INSERT INTO invoice_items (invoice_id, line_type, description, quantity, unit_amount, line_total, created_at, updated_at)
        VALUES (gen_random_uuid(), 'booking_stay', 'Orphan', 1, 100.00, 100.00, now(), now());
        RAISE EXCEPTION 'Failed to reject invalid invoice FK';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'Caught invalid invoice FK';
    END;

    -- 7. Cascade Deletion Test
    BEGIN
        -- Item exists
        IF NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = v_item_id) THEN
            RAISE EXCEPTION 'Test item not found before cascade test';
        END IF;

        -- Delete invoice
        DELETE FROM invoices WHERE id = v_invoice_id;

        -- Item should be gone
        IF EXISTS (SELECT 1 FROM invoice_items WHERE id = v_item_id) THEN
            RAISE EXCEPTION 'Cascade delete failed - item still exists after invoice deletion';
        END IF;
        
        RAISE NOTICE 'Successfully verified cascade deletion.';
    END;

    RAISE NOTICE 'Invoice items runtime verification passed successfully.';
END $$;
