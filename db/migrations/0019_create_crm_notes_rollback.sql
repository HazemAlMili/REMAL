DROP INDEX IF EXISTS ix_crm_notes_created_at;
DROP INDEX IF EXISTS ix_crm_notes_created_by_admin_user_id;
DROP INDEX IF EXISTS ix_crm_notes_crm_lead_id;
DROP INDEX IF EXISTS ix_crm_notes_booking_id;

ALTER TABLE crm_notes DROP CONSTRAINT IF EXISTS ck_crm_notes_exactly_one_parent;
ALTER TABLE crm_notes DROP CONSTRAINT IF EXISTS fk_crm_notes_created_by_admin_user_id;
ALTER TABLE crm_notes DROP CONSTRAINT IF EXISTS fk_crm_notes_crm_lead_id;
ALTER TABLE crm_notes DROP CONSTRAINT IF EXISTS fk_crm_notes_booking_id;

DROP TABLE IF EXISTS crm_notes;
