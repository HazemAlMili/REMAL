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

        // FIXED: Don't filter by booking date - count ALL paid payments in the system
        // The finance summary should show total paid regardless of when booking was created
        
        // Get ALL active invoices (exclude cancelled AND superseded)
        var activeInvoicesQuery = _unitOfWork.Invoices.Query()
            .Where(i => i.InvoiceStatus != "cancelled" && i.InvoiceStatus != "superseded");

        // Get ALL paid payments in the system
        var paidPaymentsQuery = _unitOfWork.Payments.Query()
            .Where(p => p.PaymentStatus == "paid");

        // Get ALL payouts
        var payoutsQuery = _unitOfWork.OwnerPayouts.Query();

        // Apply date filters if provided (filter by booking creation date)
        if (dateFrom.HasValue || dateTo.HasValue)
        {
            var bookingsQuery = _unitOfWork.Bookings.Query();
            
            if (dateFrom.HasValue)
            {
                var dateFromDateTime = dateFrom.Value.ToDateTime(TimeOnly.MinValue);
                bookingsQuery = bookingsQuery.Where(b => b.CreatedAt >= dateFromDateTime);
            }
            
            if (dateTo.HasValue)
            {
                var dateToDateTime = dateTo.Value.ToDateTime(TimeOnly.MaxValue);
                bookingsQuery = bookingsQuery.Where(b => b.CreatedAt <= dateToDateTime);
            }

            var bookingIds = await bookingsQuery.Select(b => b.Id).ToListAsync(cancellationToken);

            // Filter invoices, payments, and payouts by booking IDs
            activeInvoicesQuery = activeInvoicesQuery.Where(i => bookingIds.Contains(i.BookingId));
            paidPaymentsQuery = paidPaymentsQuery.Where(p => bookingIds.Contains(p.BookingId));
            payoutsQuery = payoutsQuery.Where(op => bookingIds.Contains(op.BookingId));
        }

        var activeInvoices = await activeInvoicesQuery.ToListAsync(cancellationToken);
        var paidPayments = await paidPaymentsQuery.ToListAsync(cancellationToken);
        var payouts = await payoutsQuery.ToListAsync(cancellationToken);

        // Debug logging
        Console.WriteLine($"[FinanceAnalytics] Date range: {dateFrom} to {dateTo}");
        Console.WriteLine($"[FinanceAnalytics] Active invoices: {activeInvoices.Count}");
        Console.WriteLine($"[FinanceAnalytics] Paid payments: {paidPayments.Count}");
        Console.WriteLine($"[FinanceAnalytics] Total paid amount: {paidPayments.Sum(p => p.Amount)}");
        
        foreach (var payment in paidPayments)
        {
            Console.WriteLine($"[FinanceAnalytics] Payment: {payment.Id}, Amount: {payment.Amount}, BookingId: {payment.BookingId}, InvoiceId: {payment.InvoiceId}, Status: {payment.PaymentStatus}");
        }

        var totalInvoiced = activeInvoices.Sum(i => i.TotalAmount);
        var totalPaid = paidPayments.Sum(p => p.Amount);
        var totalRemaining = totalInvoiced - totalPaid;

        Console.WriteLine($"[FinanceAnalytics] RESULT - Invoiced: {totalInvoiced}, Paid: {totalPaid}, Remaining: {totalRemaining}");

        // Debug payout calculations
        Console.WriteLine($"[FinanceAnalytics] Total payouts: {payouts.Count}");
        foreach (var payout in payouts)
        {
            Console.WriteLine($"[FinanceAnalytics] Payout: {payout.Id}, BookingId: {payout.BookingId}, Status: '{payout.PayoutStatus}', Amount: {payout.PayoutAmount}");
        }

        var pendingPayouts = payouts.Where(p => p.PayoutStatus == "pending").ToList();
        var scheduledPayouts = payouts.Where(p => p.PayoutStatus == "scheduled").ToList();
        var paidPayouts = payouts.Where(p => p.PayoutStatus == "paid").ToList();

        Console.WriteLine($"[FinanceAnalytics] Pending payouts: {pendingPayouts.Count}, Total: {pendingPayouts.Sum(p => p.PayoutAmount)}");
        Console.WriteLine($"[FinanceAnalytics] Scheduled payouts: {scheduledPayouts.Count}, Total: {scheduledPayouts.Sum(p => p.PayoutAmount)}");
        Console.WriteLine($"[FinanceAnalytics] Paid payouts: {paidPayouts.Count}, Total: {paidPayouts.Sum(p => p.PayoutAmount)}");

        return new FinanceAnalyticsSummaryResult
        {
            DateFrom                        = dateFrom,
            DateTo                          = dateTo,
            TotalBookingsWithInvoiceCount   = activeInvoices.Select(i => i.BookingId).Distinct().Count(),
            TotalInvoicedAmount             = totalInvoiced,
            TotalPaidAmount                 = totalPaid,
            TotalRemainingAmount            = totalRemaining,
            TotalPendingPayoutAmount        = pendingPayouts.Sum(p => p.PayoutAmount),
            TotalScheduledPayoutAmount      = scheduledPayouts.Sum(p => p.PayoutAmount),
            TotalPaidPayoutAmount           = paidPayouts.Sum(p => p.PayoutAmount),
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
