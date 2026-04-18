CREATE TABLE crm_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NULL,
    crm_lead_id UUID NULL,
    created_by_admin_user_id UUID NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_crm_notes_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_crm_notes_crm_lead_id FOREIGN KEY (crm_lead_id) REFERENCES crm_leads(id) ON DELETE CASCADE,
    CONSTRAINT fk_crm_notes_created_by_admin_user_id FOREIGN KEY (created_by_admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,

    CONSTRAINT ck_crm_notes_exactly_one_parent CHECK (
        (booking_id IS NOT NULL AND crm_lead_id IS NULL) OR 
        (booking_id IS NULL AND crm_lead_id IS NOT NULL)
    )
);

CREATE INDEX ix_crm_notes_booking_id ON crm_notes(booking_id);
CREATE INDEX ix_crm_notes_crm_lead_id ON crm_notes(crm_lead_id);
CREATE INDEX ix_crm_notes_created_by_admin_user_id ON crm_notes(created_by_admin_user_id);
CREATE INDEX ix_crm_notes_created_at ON crm_notes(created_at);
