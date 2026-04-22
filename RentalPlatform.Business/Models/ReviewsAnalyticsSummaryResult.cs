using System;

namespace RentalPlatform.Business.Models;

/// <summary>
/// Aggregated reviews analytics summary over a date range.
/// Produced by IReportingReviewsAnalyticsService.GetSummaryAsync.
/// Only published reviews contribute — pending/rejected/hidden excluded by the view.
/// AverageRating is computed as the weighted average over all matched daily rows.
/// Read-only result model — no write-side semantics.
/// Scope frozen per docs/decisions/0014_reports_analytics_business_scope.md.
/// </summary>
public record ReviewsAnalyticsSummaryResult
{
    public DateOnly? DateFrom { get; init; }
    public DateOnly? DateTo { get; init; }
    public int TotalPublishedReviewsCount { get; init; }
    public decimal AverageRating { get; init; }
    public int TotalReviewsWithOwnerReplyCount { get; init; }
    public int TotalReviewsWithVisibleOwnerReplyCount { get; init; }
}
