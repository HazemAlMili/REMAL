-- ===========================================================================
-- Migration: 0026_payments_finance_integrity_cleanup
-- Description: Final integrity pass for the Finance domain (Domain 4).
--              Ensures all constraints and naming conventions are strictly
--              aligned with the frozen schema contract.
-- ===========================================================================

-- 1. Ensure all money fields are strictly DECIMAL(12,2)
-- (Already handled in initial migrations, this acts as a declarative enforcement)
ALTER TABLE payments ALTER COLUMN amount TYPE DECIMAL(12,2);
ALTER TABLE invoices ALTER COLUMN subtotal_amount TYPE DECIMAL(12,2);
ALTER TABLE invoices ALTER COLUMN total_amount TYPE DECIMAL(12,2);
ALTER TABLE invoice_items ALTER COLUMN unit_amount TYPE DECIMAL(12,2);
ALTER TABLE invoice_items ALTER COLUMN line_total TYPE DECIMAL(12,2);
ALTER TABLE owner_payouts ALTER COLUMN gross_booking_amount TYPE DECIMAL(12,2);
ALTER TABLE owner_payouts ALTER COLUMN commission_amount TYPE DECIMAL(12,2);
ALTER TABLE owner_payouts ALTER COLUMN payout_amount TYPE DECIMAL(12,2);

-- 2. Ensure commission_rate is DECIMAL(5,2)
ALTER TABLE owner_payouts ALTER COLUMN commission_rate TYPE DECIMAL(5,2);

-- 3. Ensure no empty strings for critical unique identifiers (Best Practice Cleanup)
ALTER TABLE invoices ADD CONSTRAINT ck_invoices_number_not_empty CHECK (invoice_number <> '');

-- 4. Re-verify naming conventions for constraints (Ensure compliance)
-- All constraints were created with correct ck_/fk_ prefixes in previous migrations.
-- This section is for documentation and explicit assertion of the final state.

COMMENT ON TABLE payments IS 'Core payment record for booking-linked money collection';
COMMENT ON TABLE invoices IS 'Billing records linked to bookings';
COMMENT ON TABLE invoice_items IS 'Line-item breakdown for invoices';
COMMENT ON TABLE owner_payouts IS 'Payout basis and commission snapshot per booking';
