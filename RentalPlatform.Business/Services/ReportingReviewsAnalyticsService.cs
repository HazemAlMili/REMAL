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
/// Read-only reviews analytics service backed by the reporting_reviews_daily_summary view.
/// Only published reviews contribute — pending/rejected/hidden are excluded by the view.
/// AverageRating in GetSummaryAsync is a weighted average (weighted by PublishedReviewsCount
/// per day) to avoid the "average of averages" fallacy.
/// No write operations, no raw SQL, no helpfulness/report/media/sentiment/owner/unit drilldowns.
/// Scope frozen per docs/decisions/0014_reports_analytics_business_scope.md.
/// </summary>
public class ReportingReviewsAnalyticsService : IReportingReviewsAnalyticsService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReportingReviewsAnalyticsService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ReportingReviewsDailySummary>> GetDailySummaryAsync(
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        CancellationToken cancellationToken = default)
    {
        ValidateDateRange(dateFrom, dateTo);

        return await BuildQuery(dateFrom, dateTo)
            .OrderBy(r => r.MetricDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<ReviewsAnalyticsSummaryResult> GetSummaryAsync(
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        CancellationToken cancellationToken = default)
    {
        ValidateDateRange(dateFrom, dateTo);

        var rows = await BuildQuery(dateFrom, dateTo)
            .ToListAsync(cancellationToken);

        var totalPublishedReviewsCount               = rows.Sum(r => r.PublishedReviewsCount);
        var totalReviewsWithOwnerReplyCount          = rows.Sum(r => r.ReviewsWithOwnerReplyCount);
        var totalReviewsWithVisibleOwnerReplyCount   = rows.Sum(r => r.ReviewsWithVisibleOwnerReplyCount);

        // Weighted average: SUM(daily_avg * daily_count) / SUM(daily_count)
        // Falls back to 0.00 when there are no published reviews in range.
        var weightedAverageRating = totalPublishedReviewsCount == 0
            ? 0.00m
            : Math.Round(
                rows.Sum(r => r.AverageRating * r.PublishedReviewsCount) / totalPublishedReviewsCount,
                2,
                MidpointRounding.AwayFromZero);

        return new ReviewsAnalyticsSummaryResult
        {
            DateFrom                                = dateFrom,
            DateTo                                  = dateTo,
            TotalPublishedReviewsCount              = totalPublishedReviewsCount,
            AverageRating                           = weightedAverageRating,
            TotalReviewsWithOwnerReplyCount         = totalReviewsWithOwnerReplyCount,
            TotalReviewsWithVisibleOwnerReplyCount  = totalReviewsWithVisibleOwnerReplyCount,
        };
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private static void ValidateDateRange(DateOnly? dateFrom, DateOnly? dateTo)
    {
        if (dateFrom.HasValue && dateTo.HasValue && dateFrom.Value > dateTo.Value)
            throw new BusinessValidationException(
                $"dateFrom ({dateFrom.Value}) must not be later than dateTo ({dateTo.Value}).");
    }

    private IQueryable<ReportingReviewsDailySummary> BuildQuery(DateOnly? dateFrom, DateOnly? dateTo)
    {
        var query = _unitOfWork.ReportingReviewsDailySummaries.AsQueryable();

        if (dateFrom.HasValue)
            query = query.Where(r => r.MetricDate >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(r => r.MetricDate <= dateTo.Value);

        return query;
    }
}
