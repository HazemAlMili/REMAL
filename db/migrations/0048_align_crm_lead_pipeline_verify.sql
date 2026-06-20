-- Verify:      0048_align_crm_lead_pipeline
-- Purpose:     Confirm the CRM lead status constraint and stored values match
--              the PRD pipeline vocabulary.

DO $$
DECLARE
    v_constraint_definition TEXT;
    v_status TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'crm_leads'
    ) THEN
        RAISE EXCEPTION 'Table public.crm_leads does not exist';
    END IF;

    SELECT pg_get_constraintdef(c.oid, true)
    INTO v_constraint_definition
    FROM pg_constraint c
    INNER JOIN pg_class t ON t.oid = c.conrelid
    INNER JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'crm_leads'
      AND c.conname = 'ck_crm_leads_status'
      AND c.contype = 'c'
      AND c.convalidated;

    IF v_constraint_definition IS NULL THEN
        RAISE EXCEPTION 'Validated constraint ck_crm_leads_status is missing';
    END IF;

    FOREACH v_status IN ARRAY ARRAY[
        'prospecting', 'relevant', 'noanswer', 'notrelevant', 'booked',
        'confirmed', 'checkin', 'completed', 'cancelled', 'leftearly'
    ]
    LOOP
        IF POSITION(quote_literal(v_status) IN v_constraint_definition) = 0 THEN
            RAISE EXCEPTION
                'ck_crm_leads_status does not allow expected status %: %',
                v_status,
                v_constraint_definition;
        END IF;
    END LOOP;

    IF regexp_count(v_constraint_definition, '''[^'']+''') <> 10 THEN
        RAISE EXCEPTION
            'ck_crm_leads_status allows an unexpected number of statuses: %',
            v_constraint_definition;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM crm_leads
        WHERE lead_status NOT IN (
            'prospecting', 'relevant', 'noanswer', 'notrelevant', 'booked',
            'confirmed', 'checkin', 'completed', 'cancelled', 'leftearly'
        )
    ) THEN
        RAISE EXCEPTION 'crm_leads contains a status outside the PRD pipeline vocabulary';
    END IF;

    RAISE NOTICE '0048 verified: CRM lead statuses match the PRD pipeline.';
END;
$$;
