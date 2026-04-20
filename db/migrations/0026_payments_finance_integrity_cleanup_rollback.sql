-- Rollback for 0026_payments_finance_integrity_cleanup

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS ck_invoices_number_not_empty;

-- Drop comments if needed (though usually harmless)
COMMENT ON TABLE payments IS NULL;
COMMENT ON TABLE invoices IS NULL;
COMMENT ON TABLE invoice_items IS NULL;
COMMENT ON TABLE owner_payouts IS NULL;
