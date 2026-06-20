-- ============================================================================
-- Rollback:    0051_allow_superseded_invoice_status
-- Title:       Restore the original invoice status constraint
-- Database:    PostgreSQL 16
-- ============================================================================
-- This rollback refuses to discard the meaning of existing superseded rows.
-- Reconcile those rows and roll back the application before retrying.

BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM invoices WHERE invoice_status = 'superseded') THEN
        RAISE EXCEPTION
            'Cannot roll back 0051 while superseded invoices exist; reconcile them first';
    END IF;
END;
$$;

ALTER TABLE invoices
    DROP CONSTRAINT IF EXISTS ck_invoices_status;

ALTER TABLE invoices
    ADD CONSTRAINT ck_invoices_status
    CHECK (invoice_status IN ('draft', 'issued', 'paid', 'cancelled'));

COMMIT;
