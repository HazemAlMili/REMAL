using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Business.Models;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.Business.Interfaces;

/// <summary>
/// Business contract for daily reviews analytics queries.
/// Reads from the reporting_reviews_daily_summary view.
/// Only published reviews contribute — pending/rejected/hidden are excluded by the view.
/// Read-only — no write, insert, update, or delete operations.
/// Scope frozen per DB-RA-01 / docs/decisions/0014_reports_analytics_business_scope.md.
/// </summary>
public interface IReportingReviewsAnalyticsService
{
    /// <summary>
    /// Returns the daily reviews summary rows matching the supplied date range.
    /// All parameters are optional. MetricDate is filtered inclusive on both ends.
    /// </summary>
    Task<IReadOnlyList<ReportingReviewsDailySummary>> GetDailySummaryAsync(
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns an aggregated reviews analytics summary over all daily rows
    /// matching the supplied date range.
    /// </summary>
    Task<ReviewsAnalyticsSummaryResult> GetSummaryAsync(
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        CancellationToken cancellationToken = default);
}
