CREATE TABLE crm_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NULL,
    crm_lead_id UUID NULL,
    assigned_admin_user_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_crm_assignments_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_crm_assignments_crm_lead_id FOREIGN KEY (crm_lead_id) REFERENCES crm_leads(id) ON DELETE CASCADE,
    CONSTRAINT fk_crm_assignments_assigned_admin_user_id FOREIGN KEY (assigned_admin_user_id) REFERENCES admin_users(id) ON DELETE RESTRICT,

    CONSTRAINT ck_crm_assignments_exactly_one_parent CHECK (
        (booking_id IS NOT NULL AND crm_lead_id IS NULL) OR 
        (booking_id IS NULL AND crm_lead_id IS NOT NULL)
    )
);

CREATE INDEX ix_crm_assignments_booking_id ON crm_assignments(booking_id);
CREATE INDEX ix_crm_assignments_crm_lead_id ON crm_assignments(crm_lead_id);
CREATE INDEX ix_crm_assignments_assigned_admin_user_id ON crm_assignments(assigned_admin_user_id);
CREATE INDEX ix_crm_assignments_is_active ON crm_assignments(is_active);
