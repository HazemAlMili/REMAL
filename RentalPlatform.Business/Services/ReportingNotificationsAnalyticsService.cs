using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Business.Models;
using RentalPlatform.Data;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.Business.Services;

/// <summary>
/// Read-only notifications analytics service backed by the
/// reporting_notifications_daily_summary view.
/// Current-status distribution only — no provider/webhook/campaign/recipient analytics.
/// No write operations, no raw SQL.
/// Scope frozen per docs/decisions/0014_reports_analytics_business_scope.md.
/// </summary>
public class ReportingNotificationsAnalyticsService : IReportingNotificationsAnalyticsService
{
    private static readonly string[] AllowedChannels =
        ["in_app", "email", "sms", "whatsapp"];

    private readonly IUnitOfWork _unitOfWork;

    public ReportingNotificationsAnalyticsService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ReportingNotificationsDailySummary>> GetDailySummaryAsync(
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        string? channel = null,
        CancellationToken cancellationToken = default)
    {
        ValidateFilters(dateFrom, dateTo, channel);

        var query = BuildQuery(dateFrom, dateTo, channel);

        return await query
            .OrderBy(r => r.MetricDate)
            .ThenBy(r => r.Channel)
            .ToListAsync(cancellationToken);
    }

    public async Task<NotificationsAnalyticsSummaryResult> GetSummaryAsync(
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        string? channel = null,
        CancellationToken cancellationToken = default)
    {
        ValidateFilters(dateFrom, dateTo, channel);

        var rows = await BuildQuery(dateFrom, dateTo, channel)
            .ToListAsync(cancellationToken);

        return new NotificationsAnalyticsSummaryResult
        {
            DateFrom                            = dateFrom,
            DateTo                              = dateTo,
            Channel                             = string.IsNullOrWhiteSpace(channel) ? null : channel.Trim(),
            TotalNotificationsCreatedCount      = rows.Sum(r => r.NotificationsCreatedCount),
            TotalPendingNotificationsCount      = rows.Sum(r => r.PendingNotificationsCount),
            TotalQueuedNotificationsCount       = rows.Sum(r => r.QueuedNotificationsCount),
            TotalSentNotificationsCount         = rows.Sum(r => r.SentNotificationsCount),
            TotalDeliveredNotificationsCount    = rows.Sum(r => r.DeliveredNotificationsCount),
            TotalFailedNotificationsCount       = rows.Sum(r => r.FailedNotificationsCount),
            TotalCancelledNotificationsCount    = rows.Sum(r => r.CancelledNotificationsCount),
            TotalReadNotificationsCount         = rows.Sum(r => r.ReadNotificationsCount),
        };
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private static void ValidateFilters(DateOnly? dateFrom, DateOnly? dateTo, string? channel)
    {
        if (dateFrom.HasValue && dateTo.HasValue && dateFrom.Value > dateTo.Value)
            throw new BusinessValidationException(
                $"dateFrom ({dateFrom.Value}) must not be later than dateTo ({dateTo.Value}).");

        if (channel is not null)
        {
            if (string.IsNullOrWhiteSpace(channel))
                throw new BusinessValidationException(
                    "channel must not be blank when provided.");

            var normalised = channel.Trim().ToLowerInvariant();
            if (!AllowedChannels.Contains(normalised))
                throw new BusinessValidationException(
                    $"Invalid channel '{channel}'. Allowed values: {string.Join(", ", AllowedChannels)}.");
        }
    }

    private IQueryable<ReportingNotificationsDailySummary> BuildQuery(
        DateOnly? dateFrom,
        DateOnly? dateTo,
        string? channel)
    {
        var query = _unitOfWork.ReportingNotificationsDailySummaries.AsQueryable();

        if (dateFrom.HasValue)
            query = query.Where(r => r.MetricDate >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(r => r.MetricDate <= dateTo.Value);

        if (!string.IsNullOrWhiteSpace(channel))
            query = query.Where(r => r.Channel == channel.Trim());

        return query;
    }
}
