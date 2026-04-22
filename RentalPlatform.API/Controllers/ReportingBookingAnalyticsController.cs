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
public class ReportingBookingAnalyticsController : ControllerBase
{
    private readonly IReportingBookingAnalyticsService _service;

    public ReportingBookingAnalyticsController(IReportingBookingAnalyticsService service)
    {
        _service = service;
    }

    // GET /api/internal/reports/bookings/daily
    [HttpGet("api/internal/reports/bookings/daily")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BookingAnalyticsDailySummaryResponse>>>> GetDailySummary(
        [FromQuery] GetBookingAnalyticsRequest request,
        CancellationToken cancellationToken)
    {
        var rows = await _service.GetDailySummaryAsync(
            request.DateFrom,
            request.DateTo,
            request.BookingSource,
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
        return Ok(ApiResponse<IReadOnlyList<BookingAnalyticsDailySummaryResponse>>.CreateSuccess(paged, pagination: pagination));
    }

    // GET /api/internal/reports/bookings/summary
    [HttpGet("api/internal/reports/bookings/summary")]
    public async Task<ActionResult<ApiResponse<BookingAnalyticsSummaryResponse>>> GetSummary(
        [FromQuery] GetBookingAnalyticsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.GetSummaryAsync(
            request.DateFrom,
            request.DateTo,
            request.BookingSource,
            cancellationToken);

        return Ok(ApiResponse<BookingAnalyticsSummaryResponse>.CreateSuccess(MapToSummaryResponse(result)));
    }

    // -----------------------------------------------------------------------
    // Private mappers — no read-model properties exposed directly
    // -----------------------------------------------------------------------

    private static BookingAnalyticsDailySummaryResponse MapToDailyResponse(
        RentalPlatform.Data.ReadModels.ReportingBookingDailySummary row) =>
        new()
        {
            MetricDate               = row.MetricDate,
            BookingSource            = row.BookingSource,
            BookingsCreatedCount     = row.BookingsCreatedCount,
            PendingBookingsCount     = row.PendingBookingsCount,
            ConfirmedBookingsCount   = row.ConfirmedBookingsCount,
            CancelledBookingsCount   = row.CancelledBookingsCount,
            CompletedBookingsCount   = row.CompletedBookingsCount,
            TotalFinalAmount         = row.TotalFinalAmount,
        };

    private static BookingAnalyticsSummaryResponse MapToSummaryResponse(
        RentalPlatform.Business.Models.BookingAnalyticsSummaryResult result) =>
        new()
        {
            DateFrom                    = result.DateFrom,
            DateTo                      = result.DateTo,
            BookingSource               = result.BookingSource,
            TotalBookingsCreatedCount   = result.TotalBookingsCreatedCount,
            TotalPendingBookingsCount   = result.TotalPendingBookingsCount,
            TotalConfirmedBookingsCount = result.TotalConfirmedBookingsCount,
            TotalCancelledBookingsCount = result.TotalCancelledBookingsCount,
            TotalCompletedBookingsCount = result.TotalCompletedBookingsCount,
            TotalFinalAmount            = result.TotalFinalAmount,
        };
}
