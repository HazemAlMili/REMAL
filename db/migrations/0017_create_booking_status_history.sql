CREATE TABLE booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,
    old_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by_admin_user_id UUID NULL,
    notes TEXT NULL,
    changed_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_booking_status_history_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_status_history_changed_by_admin_user_id FOREIGN KEY (changed_by_admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,

    CONSTRAINT ck_booking_status_history_old_status CHECK (old_status IS NULL OR old_status IN ('inquiry', 'pending', 'confirmed', 'cancelled', 'completed')),
    CONSTRAINT ck_booking_status_history_new_status CHECK (new_status IN ('inquiry', 'pending', 'confirmed', 'cancelled', 'completed'))
);

CREATE INDEX ix_booking_status_history_booking_id ON booking_status_history(booking_id);
CREATE INDEX ix_booking_status_history_changed_at ON booking_status_history(changed_at);
CREATE INDEX ix_booking_status_history_new_status ON booking_status_history(new_status);
