-- Verify:      0051_allow_superseded_invoice_status
-- Purpose:     Confirm the invoice status constraint supports the complete
--              application vocabulary, including superseded.

DO $$
DECLARE
    v_constraint_definition TEXT;
    v_status TEXT;
BEGIN
    SELECT pg_get_constraintdef(c.oid, true)
    INTO v_constraint_definition
    FROM pg_constraint c
    INNER JOIN pg_class t ON t.oid = c.conrelid
    INNER JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'invoices'
      AND c.conname = 'ck_invoices_status'
      AND c.contype = 'c'
      AND c.convalidated;

    IF v_constraint_definition IS NULL THEN
        RAISE EXCEPTION 'Validated constraint ck_invoices_status is missing';
    END IF;

    FOREACH v_status IN ARRAY ARRAY[
        'draft', 'issued', 'paid', 'cancelled', 'superseded'
    ]
    LOOP
        IF POSITION(quote_literal(v_status) IN v_constraint_definition) = 0 THEN
            RAISE EXCEPTION
                'ck_invoices_status does not allow expected status %: %',
                v_status,
                v_constraint_definition;
        END IF;
    END LOOP;

    IF regexp_count(v_constraint_definition, '''[^'']+''') <> 5 THEN
        RAISE EXCEPTION
            'ck_invoices_status allows an unexpected number of statuses: %',
            v_constraint_definition;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM invoices
        WHERE invoice_status NOT IN (
            'draft', 'issued', 'paid', 'cancelled', 'superseded'
        )
    ) THEN
        RAISE EXCEPTION 'invoices contains a status outside the supported vocabulary';
    END IF;

    RAISE NOTICE '0051 verified: superseded is allowed by ck_invoices_status.';
END;
$$;
