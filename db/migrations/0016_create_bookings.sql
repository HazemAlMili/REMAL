CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL,
    unit_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    assigned_admin_user_id UUID NULL,
    booking_status VARCHAR(50) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guest_count INT NOT NULL,
    base_amount DECIMAL(12,2) NOT NULL,
    final_amount DECIMAL(12,2) NOT NULL,
    source VARCHAR(50) NOT NULL,
    internal_notes TEXT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_bookings_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_unit_id FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_owner_id FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_assigned_admin_user_id FOREIGN KEY (assigned_admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,

    CONSTRAINT ck_bookings_status CHECK (booking_status IN ('inquiry', 'pending', 'confirmed', 'cancelled', 'completed')),
    CONSTRAINT ck_bookings_source CHECK (source IN ('direct', 'admin', 'phone', 'whatsapp', 'website')),

    CONSTRAINT ck_bookings_valid_stay_range CHECK (check_out_date > check_in_date),
    CONSTRAINT ck_bookings_guest_count_positive CHECK (guest_count > 0),
    CONSTRAINT ck_bookings_base_amount_non_negative CHECK (base_amount >= 0),
    CONSTRAINT ck_bookings_final_amount_non_negative CHECK (final_amount >= 0)
);

CREATE INDEX ix_bookings_client_id ON bookings(client_id);
CREATE INDEX ix_bookings_unit_id ON bookings(unit_id);
CREATE INDEX ix_bookings_owner_id ON bookings(owner_id);
CREATE INDEX ix_bookings_assigned_admin_user_id ON bookings(assigned_admin_user_id);
CREATE INDEX ix_bookings_status ON bookings(booking_status);
CREATE INDEX ix_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX ix_bookings_check_out_date ON bookings(check_out_date);
