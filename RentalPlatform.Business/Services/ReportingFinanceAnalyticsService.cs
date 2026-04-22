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
/// Read-only finance analytics service backed by the reporting_finance_daily_summary view.
/// Cancelled invoices and non-paid payments are excluded by the underlying view.
/// No write operations, no raw SQL, no refund/tax/reconciliation/per-owner/per-unit drilldowns.
/// Scope frozen per docs/decisions/0014_reports_analytics_business_scope.md.
/// </summary>
public class ReportingFinanceAnalyticsService : IReportingFinanceAnalyticsService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReportingFinanceAnalyticsService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ReportingFinanceDailySummary>> GetDailySummaryAsync(
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        CancellationToken cancellationToken = default)
    {
        ValidateDateRange(dateFrom, dateTo);

        return await BuildQuery(dateFrom, dateTo)
            .OrderBy(r => r.MetricDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<FinanceAnalyticsSummaryResult> GetSummaryAsync(
        DateOnly? dateFrom = null,
        DateOnly? dateTo = null,
        CancellationToken cancellationToken = default)
    {
        ValidateDateRange(dateFrom, dateTo);

        var rows = await BuildQuery(dateFrom, dateTo)
            .ToListAsync(cancellationToken);

        return new FinanceAnalyticsSummaryResult
        {
            DateFrom                        = dateFrom,
            DateTo                          = dateTo,
            TotalBookingsWithInvoiceCount   = rows.Sum(r => r.BookingsWithInvoiceCount),
            TotalInvoicedAmount             = rows.Sum(r => r.TotalInvoicedAmount),
            TotalPaidAmount                 = rows.Sum(r => r.TotalPaidAmount),
            TotalRemainingAmount            = rows.Sum(r => r.TotalRemainingAmount),
            TotalPendingPayoutAmount        = rows.Sum(r => r.TotalPendingPayoutAmount),
            TotalScheduledPayoutAmount      = rows.Sum(r => r.TotalScheduledPayoutAmount),
            TotalPaidPayoutAmount           = rows.Sum(r => r.TotalPaidPayoutAmount),
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

    private IQueryable<ReportingFinanceDailySummary> BuildQuery(DateOnly? dateFrom, DateOnly? dateTo)
    {
        var query = _unitOfWork.ReportingFinanceDailySummaries.AsQueryable();

        if (dateFrom.HasValue)
            query = query.Where(r => r.MetricDate >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(r => r.MetricDate <= dateTo.Value);

        return query;
    }
}
