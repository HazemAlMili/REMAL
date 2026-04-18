CREATE TABLE crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NULL,
    target_unit_id UUID NULL,
    assigned_admin_user_id UUID NULL,
    contact_name VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    contact_email VARCHAR(255) NULL,
    desired_check_in_date DATE NULL,
    desired_check_out_date DATE NULL,
    guest_count INT NULL,
    lead_status VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_crm_leads_client_id FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    CONSTRAINT fk_crm_leads_target_unit_id FOREIGN KEY (target_unit_id) REFERENCES units(id) ON DELETE SET NULL,
    CONSTRAINT fk_crm_leads_assigned_admin_user_id FOREIGN KEY (assigned_admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,

    CONSTRAINT ck_crm_leads_status CHECK (lead_status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    CONSTRAINT ck_crm_leads_source CHECK (source IN ('direct', 'admin', 'phone', 'whatsapp', 'website')),

    CONSTRAINT ck_crm_leads_valid_desired_stay_range CHECK (
        (desired_check_in_date IS NULL OR desired_check_out_date IS NULL) OR 
        (desired_check_out_date > desired_check_in_date)
    ),
    CONSTRAINT ck_crm_leads_guest_count_positive CHECK (guest_count IS NULL OR guest_count > 0)
);

CREATE INDEX ix_crm_leads_client_id ON crm_leads(client_id);
CREATE INDEX ix_crm_leads_target_unit_id ON crm_leads(target_unit_id);
CREATE INDEX ix_crm_leads_assigned_admin_user_id ON crm_leads(assigned_admin_user_id);
CREATE INDEX ix_crm_leads_status ON crm_leads(lead_status);
CREATE INDEX ix_crm_leads_source ON crm_leads(source);
CREATE INDEX ix_crm_leads_contact_phone ON crm_leads(contact_phone);
