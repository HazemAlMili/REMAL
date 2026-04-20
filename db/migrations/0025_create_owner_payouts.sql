CREATE TABLE owner_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    payout_status VARCHAR(50) NOT NULL,
    gross_booking_amount DECIMAL(12,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    payout_amount DECIMAL(12,2) NOT NULL,
    scheduled_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_owner_payouts_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    CONSTRAINT fk_owner_payouts_owner_id FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE RESTRICT,
    
    CONSTRAINT ck_owner_payouts_status CHECK (payout_status IN ('pending', 'scheduled', 'paid', 'cancelled')),
    CONSTRAINT ck_owner_payouts_gross_non_negative CHECK (gross_booking_amount >= 0),
    CONSTRAINT ck_owner_payouts_commission_rate_range CHECK (commission_rate >= 0 AND commission_rate <= 100),
    CONSTRAINT ck_owner_payouts_commission_amount_non_negative CHECK (commission_amount >= 0),
    CONSTRAINT ck_owner_payouts_payout_amount_non_negative CHECK (payout_amount >= 0),
    CONSTRAINT ck_owner_payouts_payout_formula CHECK (payout_amount = gross_booking_amount - commission_amount)
);

-- Unique relationship: one payout basis per booking
CREATE UNIQUE INDEX ux_owner_payouts_booking_id ON owner_payouts(booking_id);

-- Performance indexes
CREATE INDEX ix_owner_payouts_owner_id ON owner_payouts(owner_id);
CREATE INDEX ix_owner_payouts_status ON owner_payouts(payout_status);
CREATE INDEX ix_owner_payouts_paid_at ON owner_payouts(paid_at);
