CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    line_type VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_amount DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_invoice_items_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    
    CONSTRAINT ck_invoice_items_line_type CHECK (line_type IN ('booking_stay', 'manual_adjustment')),
    CONSTRAINT ck_invoice_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_invoice_items_unit_amount_non_negative CHECK (unit_amount >= 0),
    CONSTRAINT ck_invoice_items_line_total_non_negative CHECK (line_total >= 0),
    CONSTRAINT ck_invoice_items_line_total_formula CHECK (line_total = quantity * unit_amount)
);

CREATE INDEX ix_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX ix_invoice_items_line_type ON invoice_items(line_type);
