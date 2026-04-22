using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalPlatform.API.DTOs.Requests.ReportsAnalytics;
using RentalPlatform.API.DTOs.Responses.ReportsAnalytics;
using RentalPlatform.API.Models;
using RentalPlatform.Business.Interfaces;

namespace RentalPlatform.API.Controllers;

[ApiController]
[Authorize(Policy = "InternalAnalyticsRead")]
public class ReportingNotificationsAnalyticsController : ControllerBase
{
    private readonly IReportingNotificationsAnalyticsService _service;

    public ReportingNotificationsAnalyticsController(IReportingNotificationsAnalyticsService service)
    {
        _service = service;
    }

    // GET /api/internal/reports/notifications/daily
    [HttpGet("api/internal/reports/notifications/daily")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<NotificationsAnalyticsDailySummaryResponse>>>> GetDailySummary(
        [FromQuery] GetNotificationsAnalyticsRequest request,
        CancellationToken cancellationToken)
    {
        var rows = await _service.GetDailySummaryAsync(
            request.DateFrom,
            request.DateTo,
            request.Channel,
            cancellationToken);

        var totalCount = rows.Count;
        var paged = rows
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(MapToDailyResponse)
            .ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);
        if (totalPages == 0) totalPages = 1;

        var pagination = new PaginationMeta(totalCount, request.Page, request.PageSize, totalPages);
        return Ok(ApiResponse<IReadOnlyList<NotificationsAnalyticsDailySummaryResponse>>.CreateSuccess(paged, pagination: pagination));
    }

    // GET /api/internal/reports/notifications/summary
    [HttpGet("api/internal/reports/notifications/summary")]
    public async Task<ActionResult<ApiResponse<NotificationsAnalyticsSummaryResponse>>> GetSummary(
        [FromQuery] GetNotificationsAnalyticsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.GetSummaryAsync(
            request.DateFrom,
            request.DateTo,
            request.Channel,
            cancellationToken);

        return Ok(ApiResponse<NotificationsAnalyticsSummaryResponse>.CreateSuccess(MapToSummaryResponse(result)));
    }

    // -----------------------------------------------------------------------
    // Private mappers — no read-model properties exposed directly
    // -----------------------------------------------------------------------

    private static NotificationsAnalyticsDailySummaryResponse MapToDailyResponse(
        RentalPlatform.Data.ReadModels.ReportingNotificationsDailySummary row) =>
        new()
        {
            MetricDate                      = row.MetricDate,
            Channel                         = row.Channel,
            NotificationsCreatedCount       = row.NotificationsCreatedCount,
            PendingNotificationsCount       = row.PendingNotificationsCount,
            QueuedNotificationsCount        = row.QueuedNotificationsCount,
            SentNotificationsCount          = row.SentNotificationsCount,
            DeliveredNotificationsCount     = row.DeliveredNotificationsCount,
            FailedNotificationsCount        = row.FailedNotificationsCount,
            CancelledNotificationsCount     = row.CancelledNotificationsCount,
            ReadNotificationsCount          = row.ReadNotificationsCount,
        };

    private static NotificationsAnalyticsSummaryResponse MapToSummaryResponse(
        RentalPlatform.Business.Models.NotificationsAnalyticsSummaryResult result) =>
        new()
        {
            DateFrom                            = result.DateFrom,
            DateTo                              = result.DateTo,
            Channel                             = result.Channel,
            TotalNotificationsCreatedCount      = result.TotalNotificationsCreatedCount,
            TotalPendingNotificationsCount      = result.TotalPendingNotificationsCount,
            TotalQueuedNotificationsCount       = result.TotalQueuedNotificationsCount,
            TotalSentNotificationsCount         = result.TotalSentNotificationsCount,
            TotalDeliveredNotificationsCount    = result.TotalDeliveredNotificationsCount,
            TotalFailedNotificationsCount       = result.TotalFailedNotificationsCount,
            TotalCancelledNotificationsCount    = result.TotalCancelledNotificationsCount,
            TotalReadNotificationsCount         = result.TotalReadNotificationsCount,
        };
}
