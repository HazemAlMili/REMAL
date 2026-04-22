using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Business.Models;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.Business.Interfaces;

/// <summary>
/// Business contract for daily notifications analytics queries.
/// Reads from the reporting_notifications_daily_summary view.
/// Current-status distribution only — no provider/webhook/campaign analytics.
/// Read-only — no write, insert, update, or delete operations.
/// Scope frozen per DB-RA-01 / docs/decisions/0014_reports_analytics_business_scope.md.
/// </summary>
public interface IReportingNotificationsAnalyticsService
{
    /// <summary>
    /// Returns the daily notifications summary rows matching the supplied filters.
    /// All parameters are optional. MetricDate is filtered inclusive on both ends.
    /// channel is an exact match filter when supplied.
    /// </summary>
    Task<IReadOnlyList<ReportingNotificationsDailySummary>> GetDailySummaryAsync(
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        string? channel = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns an aggregated notifications analytics summary over all daily rows
    /// matching the supplied filters.
    /// </summary>
    Task<NotificationsAnalyticsSummaryResult> GetSummaryAsync(
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        string? channel = null,
        CancellationToken cancellationToken = default);
}
