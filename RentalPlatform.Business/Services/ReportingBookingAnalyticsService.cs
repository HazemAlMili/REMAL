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
/// Read-only booking analytics service backed by the reporting_booking_daily_summary view.
/// No write operations, no raw SQL, no owner/unit/admin/CRM drilldowns.
/// Scope frozen per docs/decisions/0014_reports_analytics_business_scope.md.
/// </summary>
public class ReportingBookingAnalyticsService : IReportingBookingAnalyticsService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReportingBookingAnalyticsService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ReportingBookingDailySummary>> GetDailySummaryAsync(
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        string? bookingSource = null,
        CancellationToken cancellationToken = default)
    {
        ValidateFilters(dateFrom, dateTo, bookingSource);

        var query = BuildQuery(dateFrom, dateTo, bookingSource);

        return await query
            .OrderBy(r => r.MetricDate)
            .ThenBy(r => r.BookingSource)
            .ToListAsync(cancellationToken);
    }

    public async Task<BookingAnalyticsSummaryResult> GetSummaryAsync(
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        string? bookingSource = null,
        CancellationToken cancellationToken = default)
    {
        ValidateFilters(dateFrom, dateTo, bookingSource);

        var rows = await BuildQuery(dateFrom, dateTo, bookingSource)
            .ToListAsync(cancellationToken);

        return new BookingAnalyticsSummaryResult
        {
            DateFrom                     = dateFrom,
            DateTo                       = dateTo,
            BookingSource                = string.IsNullOrWhiteSpace(bookingSource) ? null : bookingSource.Trim(),
            TotalBookingsCreatedCount    = rows.Sum(r => r.BookingsCreatedCount),
            TotalPendingBookingsCount    = rows.Sum(r => r.PendingBookingsCount),
            TotalConfirmedBookingsCount  = rows.Sum(r => r.ConfirmedBookingsCount),
            TotalCancelledBookingsCount  = rows.Sum(r => r.CancelledBookingsCount),
            TotalCompletedBookingsCount  = rows.Sum(r => r.CompletedBookingsCount),
            TotalFinalAmount             = rows.Sum(r => r.TotalFinalAmount),
        };
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private static void ValidateFilters(DateOnly? dateFrom, DateOnly? dateTo, string? bookingSource)
    {
        if (dateFrom.HasValue && dateTo.HasValue && dateFrom.Value > dateTo.Value)
            throw new BusinessValidationException(
                $"dateFrom ({dateFrom.Value}) must not be later than dateTo ({dateTo.Value}).");

        if (bookingSource is not null && string.IsNullOrWhiteSpace(bookingSource))
            throw new BusinessValidationException(
                "bookingSource must not be blank when provided.");
    }

    private IQueryable<ReportingBookingDailySummary> BuildQuery(
        DateOnly? dateFrom,
        DateOnly? dateTo,
        string? bookingSource)
    {
        var query = _unitOfWork.ReportingBookingDailySummaries.AsQueryable();

        if (dateFrom.HasValue)
            query = query.Where(r => r.MetricDate >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(r => r.MetricDate <= dateTo.Value);

        if (!string.IsNullOrWhiteSpace(bookingSource))
            query = query.Where(r => r.BookingSource == bookingSource.Trim());

        return query;
    }
}
