-- Remove FK from payments first
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_invoice_id;

-- Drop invoices table
DROP TABLE IF EXISTS invoices;
