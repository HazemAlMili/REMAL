DO $$
BEGIN
    -- ===========================================================================
    -- 1. PAYMENTS TABLE VERIFICATION
    -- ===========================================================================
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN RAISE EXCEPTION 'Table payments missing'; END IF;
    
    -- Check Foreign Keys
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_booking_id') THEN RAISE EXCEPTION 'fk_payments_booking_id missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_invoice_id') THEN RAISE EXCEPTION 'fk_payments_invoice_id missing'; END IF;

    -- Check Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_payments_status') THEN RAISE EXCEPTION 'ck_payments_status missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_payments_method') THEN RAISE EXCEPTION 'ck_payments_method missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_payments_amount_positive') THEN RAISE EXCEPTION 'ck_payments_amount_positive missing'; END IF;

    -- Verify no forbidden fields
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name IN ('refund_id', 'refund_amount', 'gateway_response')) THEN
        RAISE EXCEPTION 'Payments table leaked forbidden refund/gateway fields';
    END IF;

    -- ===========================================================================
    -- 2. INVOICES TABLE VERIFICATION
    -- ===========================================================================
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN RAISE EXCEPTION 'Table invoices missing'; END IF;

    -- Check Uniqueness
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ux_invoices_invoice_number') THEN RAISE EXCEPTION 'ux_invoices_invoice_number missing'; END IF;

    -- Check Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_invoices_status') THEN RAISE EXCEPTION 'ck_invoices_status missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_invoices_total_equals_subtotal') THEN RAISE EXCEPTION 'ck_invoices_total_equals_subtotal missing'; END IF;

    -- Verify no forbidden fields
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name IN ('tax_amount', 'discount_amount', 'pdf_url', 'provider_reference')) THEN
        RAISE EXCEPTION 'Invoices table leaked forbidden tax/discount/pdf fields';
    END IF;

    -- ===========================================================================
    -- 3. INVOICE_ITEMS TABLE VERIFICATION
    -- ===========================================================================
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoice_items') THEN RAISE EXCEPTION 'Table invoice_items missing'; END IF;

    -- Check Formula
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_invoice_items_line_total_formula') THEN RAISE EXCEPTION 'ck_invoice_items_line_total_formula missing'; END IF;

    -- Verify no forbidden fields
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_items' AND column_name IN ('tax_rate', 'discount_code', 'product_id', 'sku')) THEN
        RAISE EXCEPTION 'Invoice_items leaked forbidden tax/product fields';
    END IF;

    -- ===========================================================================
    -- 4. OWNER_PAYOUTS TABLE VERIFICATION
    -- ===========================================================================
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'owner_payouts') THEN RAISE EXCEPTION 'Table owner_payouts missing'; END IF;

    -- Check Uniqueness
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ux_owner_payouts_booking_id') THEN RAISE EXCEPTION 'ux_owner_payouts_booking_id missing'; END IF;

    -- Check Formula & Range
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_owner_payouts_commission_rate_range') THEN RAISE EXCEPTION 'ck_owner_payouts_commission_rate_range missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_owner_payouts_payout_formula') THEN RAISE EXCEPTION 'ck_owner_payouts_payout_formula missing'; END IF;

    -- Verify no forbidden fields
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_payouts' AND column_name IN ('bank_account_id', 'tax_withholding', 'partial_payout_status')) THEN
        RAISE EXCEPTION 'Owner_payouts leaked forbidden bank/tax/partial fields';
    END IF;

    -- ===========================================================================
    -- 5. TYPE VERIFICATION
    -- ===========================================================================
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name IN ('payments', 'invoices', 'invoice_items', 'owner_payouts') 
        AND column_name LIKE '%amount%' 
        AND data_type <> 'numeric'
    ) THEN
        RAISE EXCEPTION 'Money fields must be NUMERIC (DECIMAL)';
    END IF;

    RAISE NOTICE 'Payments / Invoices / Finance domain integrity check passed successfully.';
END $$;
