DO $$
BEGIN
    -- 1. Table Exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoice_items') THEN
        RAISE EXCEPTION 'Table invoice_items does not exist';
    END IF;

    -- 2. Verify Columns
    PERFORM id, invoice_id, line_type, description, quantity, unit_amount, line_total, created_at, updated_at
    FROM invoice_items LIMIT 1;
    
    -- 3. Verify no tax/discount line types or product/deleted_at leakage
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_items' 
               AND column_name IN ('tax_rate', 'discount_id', 'sku', 'product_id', 'deleted_at')) THEN
        RAISE EXCEPTION 'Leakage of forbidden fields (tax/discount/product/deleted_at) detected in invoice_items table';
    END IF;

    -- 4. Foreign Keys check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_invoice_items_invoice_id') THEN 
        RAISE EXCEPTION 'fk_invoice_items_invoice_id missing'; 
    END IF;

    -- 5. Check constraints check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_invoice_items_line_type') THEN 
        RAISE EXCEPTION 'ck_invoice_items_line_type missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_invoice_items_quantity_positive') THEN 
        RAISE EXCEPTION 'ck_invoice_items_quantity_positive missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_invoice_items_unit_amount_non_negative') THEN 
        RAISE EXCEPTION 'ck_invoice_items_unit_amount_non_negative missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_invoice_items_line_total_non_negative') THEN 
        RAISE EXCEPTION 'ck_invoice_items_line_total_non_negative missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_invoice_items_line_total_formula') THEN 
        RAISE EXCEPTION 'ck_invoice_items_line_total_formula missing'; 
    END IF;

    -- 6. Indexes check
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_invoice_items_invoice_id') THEN 
        RAISE EXCEPTION 'ix_invoice_items_invoice_id missing'; 
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_invoice_items_line_type') THEN 
        RAISE EXCEPTION 'ix_invoice_items_line_type missing'; 
    END IF;

    RAISE NOTICE 'Invoice items table static verification passed successfully.';
END $$;
