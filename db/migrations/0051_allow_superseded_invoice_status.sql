-- ============================================================================
-- Migration:   0051_allow_superseded_invoice_status
-- Title:       Allow superseded invoices created by the reissue workflow
-- Database:    PostgreSQL 16
-- Depends on:  0023_create_invoices
-- ============================================================================

BEGIN;

ALTER TABLE invoices
    DROP CONSTRAINT IF EXISTS ck_invoices_status;

ALTER TABLE invoices
    ADD CONSTRAINT ck_invoices_status
    CHECK (invoice_status IN ('draft', 'issued', 'paid', 'cancelled', 'superseded'));

COMMIT;
