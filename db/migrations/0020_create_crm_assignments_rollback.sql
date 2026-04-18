DROP INDEX IF EXISTS ix_crm_assignments_is_active;
DROP INDEX IF EXISTS ix_crm_assignments_assigned_admin_user_id;
DROP INDEX IF EXISTS ix_crm_assignments_crm_lead_id;
DROP INDEX IF EXISTS ix_crm_assignments_booking_id;

ALTER TABLE crm_assignments DROP CONSTRAINT IF EXISTS ck_crm_assignments_exactly_one_parent;

ALTER TABLE crm_assignments DROP CONSTRAINT IF EXISTS fk_crm_assignments_assigned_admin_user_id;
ALTER TABLE crm_assignments DROP CONSTRAINT IF EXISTS fk_crm_assignments_crm_lead_id;
ALTER TABLE crm_assignments DROP CONSTRAINT IF EXISTS fk_crm_assignments_booking_id;

DROP TABLE IF EXISTS crm_assignments;
