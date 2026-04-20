DO $$
BEGIN
    -- 1. Table Exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        RAISE EXCEPTION 'Table payments does not exist';
    END IF;

    -- 2. Verify Columns
    PERFORM id, booking_id, invoice_id, payment_status, payment_method, amount, reference_number, notes, paid_at, created_at, updated_at
    FROM payments LIMIT 1;
    
    -- 3. Verify no refund/gateway/chargeback/dispute/deleted_at leakage
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' 
               AND column_name IN ('refund_amount', 'refund_status', 'gateway_response_json', 'chargeback_status', 'dispute_id', 'deleted_at')) THEN
        RAISE EXCEPTION 'Leakage of forbidden fields (refund/gateway/dispute/deleted_at) detected in payments table';
    END IF;

    -- 4. Foreign Keys check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_booking_id') THEN 
        RAISE EXCEPTION 'fk_payments_booking_id missing'; 
    END IF;
    -- Note: fk_payments_invoice_id is intentionally omitted as it will be added in a later migration.

    -- 5. Check constraints check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_payments_status') THEN 
        RAISE EXCEPTION 'ck_payments_status missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_payments_method') THEN 
        RAISE EXCEPTION 'ck_payments_method missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_payments_amount_positive') THEN 
        RAISE EXCEPTION 'ck_payments_amount_positive missing'; 
    END IF;

    -- 6. Indexes check
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_payments_booking_id') THEN 
        RAISE EXCEPTION 'ix_payments_booking_id missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_payments_invoice_id') THEN 
        RAISE EXCEPTION 'ix_payments_invoice_id missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_payments_status') THEN 
        RAISE EXCEPTION 'ix_payments_status missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_payments_paid_at') THEN 
        RAISE EXCEPTION 'ix_payments_paid_at missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_payments_reference_number') THEN 
        RAISE EXCEPTION 'ix_payments_reference_number missing'; 
    END IF;

    RAISE NOTICE 'Payments table static verification passed successfully.';
END $$;
