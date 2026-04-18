-- Comprehensive Validation for Domain 3
DO $$
BEGIN
    -------------------------------------------------------------------
    -- 1. Bookings Validation
    -------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_bookings_status') THEN RAISE EXCEPTION 'bookings missing ck_bookings_status'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_bookings_source') THEN RAISE EXCEPTION 'bookings missing ck_bookings_source'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_bookings_valid_stay_range') THEN RAISE EXCEPTION 'bookings missing ck_bookings_valid_stay_range'; END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name IN ('deleted_at', 'tax_amount', 'discount_amount', 'payment_status', 'refund_amount', 'review_score')) THEN
        RAISE EXCEPTION 'bookings table contains forbidden payment/soft-delete/review fields.';
    END IF;

    -------------------------------------------------------------------
    -- 2. Booking Status History Validation
    -------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_booking_status_history_old_status') THEN RAISE EXCEPTION 'booking_status_history missing ck_booking_status_history_old_status'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_booking_status_history_new_status') THEN RAISE EXCEPTION 'booking_status_history missing ck_booking_status_history_new_status'; END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_status_history' AND column_name IN ('actor_type', 'actor_id')) THEN
        RAISE EXCEPTION 'booking_status_history table contains forbidden polymorphic actor fields.';
    END IF;

    -------------------------------------------------------------------
    -- 3. CRM Leads Validation
    -------------------------------------------------------------------
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_leads' AND column_name = 'booking_id') THEN
        RAISE EXCEPTION 'crm_leads table contains forbidden booking_id leakage.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_crm_leads_status') THEN RAISE EXCEPTION 'crm_leads missing ck_crm_leads_status'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_crm_leads_source') THEN RAISE EXCEPTION 'crm_leads missing ck_crm_leads_source'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_crm_leads_valid_desired_stay_range') THEN RAISE EXCEPTION 'crm_leads missing ck_crm_leads_valid_desired_stay_range'; END IF;

    -------------------------------------------------------------------
    -- 4. CRM Notes Validation
    -------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_crm_notes_exactly_one_parent') THEN RAISE EXCEPTION 'crm_notes missing ck_crm_notes_exactly_one_parent'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_notes' AND column_name IN ('attachment_url', 'edited_by', 'edited_at')) THEN
        RAISE EXCEPTION 'crm_notes table contains forbidden attachment/history overreach.';
    END IF;

    -------------------------------------------------------------------
    -- 5. CRM Assignments Validation
    -------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_crm_assignments_exactly_one_parent') THEN RAISE EXCEPTION 'crm_assignments missing ck_crm_assignments_exactly_one_parent'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_assignments' AND column_name = 'assigned_admin_user_id' AND is_nullable = 'YES') THEN
        RAISE EXCEPTION 'crm_assignments.assigned_admin_user_id must be required/not-nullable.';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crm_assignments' AND column_name IN ('queue_id', 'priority', 'sla_deadline', 'ended_at', 'escalation_level')) THEN
        RAISE EXCEPTION 'crm_assignments table contains forbidden queue/escalation overreach.';
    END IF;

    -------------------------------------------------------------------
    -- 6. Cross-table Types & Vocabulary Alignment Validation
    -------------------------------------------------------------------
    -- All money fields must be DECIMAL
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name IN ('base_amount', 'final_amount') AND data_type != 'numeric') THEN
        RAISE EXCEPTION 'Money fields in bookings are not DECIMAL/NUMERIC.';
    END IF;

    RAISE NOTICE 'Comprehensive Booking & CRM schema integrity verified successfully.';
END $$;
