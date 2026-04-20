DO $$
BEGIN
    -- 1. Table Exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'owner_payouts') THEN
        RAISE EXCEPTION 'Table owner_payouts does not exist';
    END IF;

    -- 2. Verify Columns
    PERFORM id, booking_id, owner_id, payout_status, gross_booking_amount, commission_rate, commission_amount, payout_amount, scheduled_at, paid_at, notes, created_at, updated_at
    FROM owner_payouts LIMIT 1;
    
    -- 3. Verify no bank/tax/partial payout snapshot or deleted_at leakage
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_payouts' 
               AND column_name IN ('bank_account_number', 'bank_name', 'tax_withholding_amount', 'partial_payout_id', 'deleted_at')) THEN
        RAISE EXCEPTION 'Leakage of forbidden fields (bank/tax/partial/deleted_at) detected in owner_payouts table';
    END IF;

    -- 4. Foreign Keys check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_owner_payouts_booking_id') THEN 
        RAISE EXCEPTION 'fk_owner_payouts_booking_id missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_owner_payouts_owner_id') THEN 
        RAISE EXCEPTION 'fk_owner_payouts_owner_id missing'; 
    END IF;

    -- 5. Check constraints check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_owner_payouts_status') THEN 
        RAISE EXCEPTION 'ck_owner_payouts_status missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_owner_payouts_gross_non_negative') THEN 
        RAISE EXCEPTION 'ck_owner_payouts_gross_non_negative missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_owner_payouts_commission_rate_range') THEN 
        RAISE EXCEPTION 'ck_owner_payouts_commission_rate_range missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_owner_payouts_commission_amount_non_negative') THEN 
        RAISE EXCEPTION 'ck_owner_payouts_commission_amount_non_negative missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_owner_payouts_payout_amount_non_negative') THEN 
        RAISE EXCEPTION 'ck_owner_payouts_payout_amount_non_negative missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_owner_payouts_payout_formula') THEN 
        RAISE EXCEPTION 'ck_owner_payouts_payout_formula missing'; 
    END IF;

    -- 6. Indexes check
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ux_owner_payouts_booking_id') THEN 
        RAISE EXCEPTION 'ux_owner_payouts_booking_id missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_owner_payouts_owner_id') THEN 
        RAISE EXCEPTION 'ix_owner_payouts_owner_id missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_owner_payouts_status') THEN 
        RAISE EXCEPTION 'ix_owner_payouts_status missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_owner_payouts_paid_at') THEN 
        RAISE EXCEPTION 'ix_owner_payouts_paid_at missing'; 
    END IF;

    RAISE NOTICE 'Owner payouts table static verification passed successfully.';
END $$;
