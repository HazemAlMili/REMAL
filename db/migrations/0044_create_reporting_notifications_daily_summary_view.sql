-- ============================================================================
-- Migration:   0044_create_reporting_notifications_daily_summary_view
-- Ticket:      DB-RA-05
-- Title:       Create reporting_notifications_daily_summary SQL view for
--              daily notification lifecycle analytics by channel
-- Database:    PostgreSQL 16
-- Depends on:  0037_create_notifications (notifications table)
--              0013_reports_analytics_db_scope decision (read-model-first freeze)
-- Created:     2026-04-22
-- ============================================================================
--
-- PURPOSE:
--   Create a read-model view that exposes daily notification lifecycle
--   analytics grouped by creation date and channel. Provides current-status
--   distribution counts so that Data Access and API layers do not need to
--   reconstruct these aggregations independently.
--
-- VIEW CONTRACT (10 columns):
--   metric_date                    DATE    — calendar day of notification creation
--   channel                        VARCHAR — notifications.channel value
--   notifications_created_count    INT     — total notifications created for this day + channel
--   pending_notifications_count    INT     — notifications with current status = 'pending'
--   queued_notifications_count     INT     — notifications with current status = 'queued'
--   sent_notifications_count       INT     — notifications with current status = 'sent'
--   delivered_notifications_count  INT     — notifications with current status = 'delivered'
--   failed_notifications_count     INT     — notifications with current status = 'failed'
--   cancelled_notifications_count  INT     — notifications with current status = 'cancelled'
--   read_notifications_count       INT     — notifications with current status = 'read'
--
-- GROUPING:
--   One row per (DATE(notifications.created_at), notifications.channel)
--
-- STATUS NOTE:
--   Status counts reflect the CURRENT notification_status at query time,
--   not the status at creation. This is a current-state distribution view.
--
-- SCOPE RULES (per DB-RA-01 freeze):
--   ✓ Read-only view — no table created
--   ✓ Source table: notifications only
--   ✓ No materialized view
--   ✗ No provider-specific metrics (provider_name aggregations)
--   ✗ No webhook analytics
--   ✗ No campaign / marketing analytics
--   ✗ No recipient-role drilldown (admin_user_id / client_id / owner_id)
--   ✗ No warehouse / fact / dimension tables
-- ============================================================================

CREATE OR REPLACE VIEW reporting_notifications_daily_summary AS
SELECT
    DATE(n.created_at)                                                          AS metric_date,
    n.channel                                                                   AS channel,
    COUNT(*)                                                                    AS notifications_created_count,
    COUNT(*) FILTER (WHERE n.notification_status = 'pending')                   AS pending_notifications_count,
    COUNT(*) FILTER (WHERE n.notification_status = 'queued')                    AS queued_notifications_count,
    COUNT(*) FILTER (WHERE n.notification_status = 'sent')                      AS sent_notifications_count,
    COUNT(*) FILTER (WHERE n.notification_status = 'delivered')                 AS delivered_notifications_count,
    COUNT(*) FILTER (WHERE n.notification_status = 'failed')                    AS failed_notifications_count,
    COUNT(*) FILTER (WHERE n.notification_status = 'cancelled')                 AS cancelled_notifications_count,
    COUNT(*) FILTER (WHERE n.notification_status = 'read')                      AS read_notifications_count
FROM notifications n
GROUP BY
    DATE(n.created_at),
    n.channel;

COMMENT ON VIEW reporting_notifications_daily_summary IS
    'Reports & Analytics read model: daily notification lifecycle counts by channel. '
    'Current-status distribution only — no provider/webhook/campaign analytics. '
    'Source: notifications. Scope frozen per DB-RA-01.';
