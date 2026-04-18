DROP INDEX IF EXISTS ix_bookings_check_out_date;
DROP INDEX IF EXISTS ix_bookings_check_in_date;
DROP INDEX IF EXISTS ix_bookings_status;
DROP INDEX IF EXISTS ix_bookings_assigned_admin_user_id;
DROP INDEX IF EXISTS ix_bookings_owner_id;
DROP INDEX IF EXISTS ix_bookings_unit_id;
DROP INDEX IF EXISTS ix_bookings_client_id;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS ck_bookings_final_amount_non_negative;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS ck_bookings_base_amount_non_negative;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS ck_bookings_guest_count_positive;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS ck_bookings_valid_stay_range;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS ck_bookings_source;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS ck_bookings_status;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_assigned_admin_user_id;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_owner_id;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_unit_id;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_client_id;

DROP TABLE IF EXISTS bookings;
