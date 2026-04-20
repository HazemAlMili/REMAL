CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_status VARCHAR(50) NOT NULL,
    subtotal_amount DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    issued_at TIMESTAMP NULL,
    due_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_invoices_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    
    CONSTRAINT ck_invoices_status CHECK (invoice_status IN ('draft', 'issued', 'paid', 'cancelled')),
    CONSTRAINT ck_invoices_subtotal_non_negative CHECK (subtotal_amount >= 0),
    CONSTRAINT ck_invoices_total_non_negative CHECK (total_amount >= 0),
    CONSTRAINT ck_invoices_total_equals_subtotal CHECK (total_amount = subtotal_amount)
);

-- Unique index for invoice_number
CREATE UNIQUE INDEX ux_invoices_invoice_number ON invoices(invoice_number);

-- Other indexes
CREATE INDEX ix_invoices_booking_id ON invoices(booking_id);
CREATE INDEX ix_invoices_status ON invoices(invoice_status);
CREATE INDEX ix_invoices_due_date ON invoices(due_date);

-- Complete the relationship from payments table
ALTER TABLE payments 
ADD CONSTRAINT fk_payments_invoice_id 
FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT;
