CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,
    invoice_id UUID NULL,
    payment_status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    reference_number VARCHAR(100) NULL,
    notes TEXT NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_payments_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    -- fk_payments_invoice_id will be added in a later migration once the invoices table exists.
    
    CONSTRAINT ck_payments_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
    CONSTRAINT ck_payments_method CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'wallet')),
    CONSTRAINT ck_payments_amount_positive CHECK (amount > 0)
);

CREATE INDEX ix_payments_booking_id ON payments(booking_id);
CREATE INDEX ix_payments_invoice_id ON payments(invoice_id);
CREATE INDEX ix_payments_status ON payments(payment_status);
CREATE INDEX ix_payments_paid_at ON payments(paid_at);
CREATE INDEX ix_payments_reference_number ON payments(reference_number);
