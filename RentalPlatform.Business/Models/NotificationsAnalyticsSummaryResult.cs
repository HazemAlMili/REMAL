using System;

namespace RentalPlatform.Business.Models;

/// <summary>
/// Aggregated notifications analytics summary over a date range and optional channel filter.
/// Produced by IReportingNotificationsAnalyticsService.GetSummaryAsync.
/// Current-status distribution only — no provider/webhook/campaign analytics.
/// Read-only result model — no write-side semantics.
/// Scope frozen per docs/decisions/0014_reports_analytics_business_scope.md.
/// </summary>
public record NotificationsAnalyticsSummaryResult
{
    public DateOnly? DateFrom { get; init; }
    public DateOnly? DateTo { get; init; }
    public string? Channel { get; init; }
    public int TotalNotificationsCreatedCount { get; init; }
    public int TotalPendingNotificationsCount { get; init; }
    public int TotalQueuedNotificationsCount { get; init; }
    public int TotalSentNotificationsCount { get; init; }
    public int TotalDeliveredNotificationsCount { get; init; }
    public int TotalFailedNotificationsCount { get; init; }
    public int TotalCancelledNotificationsCount { get; init; }
    public int TotalReadNotificationsCount { get; init; }
}
