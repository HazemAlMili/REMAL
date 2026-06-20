-- Migration:   0048_align_crm_lead_pipeline
-- Title:       Align CRM lead statuses with PRD booking pipeline

BEGIN;

ALTER TABLE crm_leads
    DROP CONSTRAINT IF EXISTS ck_crm_leads_status;

UPDATE crm_leads
SET lead_status = CASE lead_status
    WHEN 'new'       THEN 'prospecting'
    WHEN 'contacted' THEN 'relevant'
    WHEN 'qualified' THEN 'booked'
    WHEN 'converted' THEN 'booked'
    WHEN 'lost'      THEN 'notrelevant'
    ELSE lead_status
END;

ALTER TABLE crm_leads
    ADD CONSTRAINT ck_crm_leads_status
    CHECK (lead_status IN (
        'prospecting',
        'relevant',
        'noanswer',
        'notrelevant',
        'booked',
        'confirmed',
        'checkin',
        'completed',
        'cancelled',
        'leftearly'
    ));

COMMIT;
