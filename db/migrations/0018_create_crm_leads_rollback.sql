DROP INDEX IF EXISTS ix_crm_leads_contact_phone;
DROP INDEX IF EXISTS ix_crm_leads_source;
DROP INDEX IF EXISTS ix_crm_leads_status;
DROP INDEX IF EXISTS ix_crm_leads_assigned_admin_user_id;
DROP INDEX IF EXISTS ix_crm_leads_target_unit_id;
DROP INDEX IF EXISTS ix_crm_leads_client_id;

ALTER TABLE crm_leads DROP CONSTRAINT IF EXISTS ck_crm_leads_guest_count_positive;
ALTER TABLE crm_leads DROP CONSTRAINT IF EXISTS ck_crm_leads_valid_desired_stay_range;
ALTER TABLE crm_leads DROP CONSTRAINT IF EXISTS ck_crm_leads_source;
ALTER TABLE crm_leads DROP CONSTRAINT IF EXISTS ck_crm_leads_status;

ALTER TABLE crm_leads DROP CONSTRAINT IF EXISTS fk_crm_leads_assigned_admin_user_id;
ALTER TABLE crm_leads DROP CONSTRAINT IF EXISTS fk_crm_leads_target_unit_id;
ALTER TABLE crm_leads DROP CONSTRAINT IF EXISTS fk_crm_leads_client_id;

DROP TABLE IF EXISTS crm_leads;
