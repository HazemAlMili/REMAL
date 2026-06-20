-- Migration:   0048_align_crm_lead_pipeline (ROLLBACK)
-- Title:       Restore legacy CRM lead status constraint
-- WARNING:     This rollback is intentionally data-lossy. The legacy five-state
--              vocabulary cannot represent every Phase 1 pipeline state, so
--              multiple statuses collapse to the nearest legacy equivalent.
--              Treat migration 0048 as one-way for production rollback planning.

BEGIN;

ALTER TABLE crm_leads
    DROP CONSTRAINT IF EXISTS ck_crm_leads_status;

UPDATE crm_leads
SET lead_status = CASE lead_status
    WHEN 'prospecting' THEN 'new'
    WHEN 'relevant'    THEN 'contacted'
    WHEN 'noanswer'    THEN 'contacted'
    WHEN 'notrelevant' THEN 'lost'
    WHEN 'booked'      THEN 'qualified'
    WHEN 'confirmed'   THEN 'converted'
    WHEN 'checkin'     THEN 'converted'
    WHEN 'completed'   THEN 'converted'
    WHEN 'cancelled'   THEN 'lost'
    WHEN 'leftearly'   THEN 'lost'
    ELSE lead_status
END;

ALTER TABLE crm_leads
    ADD CONSTRAINT ck_crm_leads_status
    CHECK (lead_status IN ('new', 'contacted', 'qualified', 'converted', 'lost'));

COMMIT;
