-- Migration: 0049_owner_portal_finance_names
-- Adds owner-facing unit/client display names to the finance read model.

BEGIN;

CREATE OR REPLACE VIEW owner_portal_finance_overview AS
WITH booking_finance AS (
    SELECT
        b.owner_id                                          AS owner_id,
        b.id                                                AS booking_id,
        b.unit_id                                           AS unit_id,
        u.name                                              AS unit_name,
        c.name                                              AS client_name,
        i.id                                                AS invoice_id,
        i.invoice_status                                    AS invoice_status,
        COALESCE(i.total_amount, 0)                         AS invoiced_amount,
        COALESCE((
            SELECT SUM(p.amount)
            FROM payments p
            WHERE p.invoice_id = i.id
              AND p.payment_status = 'paid'
        ), 0)                                               AS paid_amount,
        op.id                                               AS payout_id,
        op.payout_status                                    AS payout_status,
        op.payout_amount                                    AS payout_amount,
        op.scheduled_at                                     AS payout_scheduled_at,
        op.paid_at                                          AS payout_paid_at
    FROM bookings b
    INNER JOIN units u
        ON u.id = b.unit_id
    INNER JOIN clients c
        ON c.id = b.client_id
    LEFT JOIN invoices i
        ON i.booking_id = b.id
        AND i.invoice_status NOT IN ('cancelled', 'superseded')
    LEFT JOIN owner_payouts op
        ON op.booking_id = b.id
)
SELECT
    owner_id,
    booking_id,
    unit_id,
    invoice_id,
    invoice_status,
    invoiced_amount,
    paid_amount,
    invoiced_amount - paid_amount AS remaining_amount,
    payout_id,
    payout_status,
    payout_amount,
    payout_scheduled_at,
    payout_paid_at,
    unit_name,
    client_name
FROM booking_finance;

COMMENT ON VIEW owner_portal_finance_overview IS
    'Owner Portal read model: booking-level finance snapshot per owner, including unit and client display names for transaction logs. '
    'paid_amount = SUM of paid payments linked to active invoice only. Cancelled and superseded invoices excluded. '
    'Source: bookings + units + clients + invoices + payments + owner_payouts.';

COMMIT;
