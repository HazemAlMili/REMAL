DO $$
BEGIN
    -- 1. Table Exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
        RAISE EXCEPTION 'Table invoices does not exist';
    END IF;

    -- 2. Verify Columns
    PERFORM id, booking_id, invoice_number, invoice_status, subtotal_amount, total_amount, issued_at, due_date, notes, created_at, updated_at
    FROM invoices LIMIT 1;
    
    -- 3. Verify no tax/discount/refund/deleted_at leakage
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' 
               AND column_name IN ('tax_amount', 'discount_amount', 'refund_id', 'deleted_at')) THEN
        RAISE EXCEPTION 'Leakage of forbidden fields (tax/discount/refund/deleted_at) detected in invoices table';
    END IF;

    -- 4. Foreign Keys check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_invoices_booking_id') THEN 
        RAISE EXCEPTION 'fk_invoices_booking_id missing'; 
    END IF;

    -- 5. Verification of the relationship completion in payments table
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_invoice_id') THEN 
        RAISE EXCEPTION 'fk_payments_invoice_id missing on payments table'; 
    END IF;

    -- 6. Check constraints check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_invoices_status') THEN 
        RAISE EXCEPTION 'ck_invoices_status missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_invoices_subtotal_non_negative') THEN 
        RAISE EXCEPTION 'ck_invoices_subtotal_non_negative missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_invoices_total_non_negative') THEN 
        RAISE EXCEPTION 'ck_invoices_total_non_negative missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_invoices_total_equals_subtotal') THEN 
        RAISE EXCEPTION 'ck_invoices_total_equals_subtotal missing'; 
    END IF;

    -- 7. Indexes check
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ux_invoices_invoice_number') THEN 
        RAISE EXCEPTION 'ux_invoices_invoice_number missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_invoices_booking_id') THEN 
        RAISE EXCEPTION 'ix_invoices_booking_id missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_invoices_status') THEN 
        RAISE EXCEPTION 'ix_invoices_status missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_invoices_due_date') THEN 
        RAISE EXCEPTION 'ix_invoices_due_date missing'; 
    END IF;

    RAISE NOTICE 'Invoices table static verification passed successfully.';
END $$;
