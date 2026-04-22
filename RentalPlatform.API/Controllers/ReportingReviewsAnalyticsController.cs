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
public class ReportingReviewsAnalyticsController : ControllerBase
{
    private readonly IReportingReviewsAnalyticsService _service;

    public ReportingReviewsAnalyticsController(IReportingReviewsAnalyticsService service)
    {
        _service = service;
    }

    // GET /api/internal/reports/reviews/daily
    [HttpGet("api/internal/reports/reviews/daily")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ReviewsAnalyticsDailySummaryResponse>>>> GetDailySummary(
        [FromQuery] GetReviewsAnalyticsRequest request,
        CancellationToken cancellationToken)
    {
        var rows = await _service.GetDailySummaryAsync(
            request.DateFrom,
            request.DateTo,
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
        return Ok(ApiResponse<IReadOnlyList<ReviewsAnalyticsDailySummaryResponse>>.CreateSuccess(paged, pagination: pagination));
    }

    // GET /api/internal/reports/reviews/summary
    [HttpGet("api/internal/reports/reviews/summary")]
    public async Task<ActionResult<ApiResponse<ReviewsAnalyticsSummaryResponse>>> GetSummary(
        [FromQuery] GetReviewsAnalyticsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.GetSummaryAsync(
            request.DateFrom,
            request.DateTo,
            cancellationToken);

        return Ok(ApiResponse<ReviewsAnalyticsSummaryResponse>.CreateSuccess(MapToSummaryResponse(result)));
    }

    // -----------------------------------------------------------------------
    // Private mappers — no read-model properties exposed directly
    // -----------------------------------------------------------------------

    private static ReviewsAnalyticsDailySummaryResponse MapToDailyResponse(
        RentalPlatform.Data.ReadModels.ReportingReviewsDailySummary row) =>
        new()
        {
            MetricDate                          = row.MetricDate,
            PublishedReviewsCount               = row.PublishedReviewsCount,
            AverageRating                       = row.AverageRating,
            ReviewsWithOwnerReplyCount          = row.ReviewsWithOwnerReplyCount,
            ReviewsWithVisibleOwnerReplyCount   = row.ReviewsWithVisibleOwnerReplyCount,
        };

    private static ReviewsAnalyticsSummaryResponse MapToSummaryResponse(
        RentalPlatform.Business.Models.ReviewsAnalyticsSummaryResult result) =>
        new()
        {
            DateFrom                                = result.DateFrom,
            DateTo                                  = result.DateTo,
            TotalPublishedReviewsCount              = result.TotalPublishedReviewsCount,
            AverageRating                           = result.AverageRating,
            TotalReviewsWithOwnerReplyCount         = result.TotalReviewsWithOwnerReplyCount,
            TotalReviewsWithVisibleOwnerReplyCount  = result.TotalReviewsWithVisibleOwnerReplyCount,
        };
}
