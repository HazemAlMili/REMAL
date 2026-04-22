using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RentalPlatform.Business.Exceptions;
using RentalPlatform.Business.Interfaces;
using RentalPlatform.Business.Models;
using RentalPlatform.Data;

namespace RentalPlatform.Business.Services;

public class FinanceSummaryService : IFinanceSummaryService
{
    private readonly IUnitOfWork _unitOfWork;

    public FinanceSummaryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<InvoiceBalanceResult> GetInvoiceBalanceAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default)
    {
        var invoice = await _unitOfWork.Invoices.GetByIdAsync(invoiceId, cancellationToken);
        if (invoice == null)
            throw new NotFoundException($"Invoice with ID {invoiceId} not found");

        var paidAmount = await _unitOfWork.Payments.Query()
            .Where(p => p.InvoiceId == invoiceId && p.PaymentStatus == "paid")
            .SumAsync(p => p.Amount, cancellationToken);

        var remaining = invoice.TotalAmount - paidAmount;
        if (remaining < 0)
            throw new ConflictException(
                $"Invoice {invoiceId} has a negative remaining balance ({remaining:F2}). Paid amount ({paidAmount:F2}) exceeds invoice total ({invoice.TotalAmount:F2}).");

        return new InvoiceBalanceResult
        {
            InvoiceId = invoiceId,
            TotalAmount = invoice.TotalAmount,
            PaidAmount = paidAmount,
            RemainingAmount = remaining,
            IsFullyPaid = remaining == 0
        };
    }

    public async Task<BookingFinanceSnapshotResult> GetBookingFinanceSnapshotAsync(
        Guid bookingId,
        CancellationToken cancellationToken = default)
    {
        var bookingExists = await _unitOfWork.Bookings.ExistsAsync(b => b.Id == bookingId, cancellationToken);
        if (!bookingExists)
            throw new NotFoundException($"Booking with ID {bookingId} not found");

        // Non-cancelled invoices only
        var invoice = await _unitOfWork.Invoices
            .FirstOrDefaultAsync(i => i.BookingId == bookingId && i.InvoiceStatus != "cancelled", cancellationToken);

        // All paid payments for the booking (booking-level view)
        var paidAmount = await _unitOfWork.Payments.Query()
            .Where(p => p.BookingId == bookingId && p.PaymentStatus == "paid")
            .SumAsync(p => p.Amount, cancellationToken);

        var payout = await _unitOfWork.OwnerPayouts
            .FirstOrDefaultAsync(op => op.BookingId == bookingId, cancellationToken);

        var invoicedAmount = invoice?.TotalAmount ?? 0m;

        // Remaining based on invoice-linked paid payments only
        decimal remaining = 0m;
        if (invoice != null)
        {
            var invoicePaidAmount = await _unitOfWork.Payments.Query()
                .Where(p => p.InvoiceId == invoice.Id && p.PaymentStatus == "paid")
                .SumAsync(p => p.Amount, cancellationToken);

            remaining = invoice.TotalAmount - invoicePaidAmount;
            if (remaining < 0) remaining = 0;
        }

        return new BookingFinanceSnapshotResult
        {
            BookingId = bookingId,
            InvoiceId = invoice?.Id,
            InvoiceStatus = invoice?.InvoiceStatus,
            InvoicedAmount = invoicedAmount,
            PaidAmount = paidAmount,
            RemainingAmount = remaining,
            OwnerPayoutStatus = payout?.PayoutStatus
        };
    }

    public async Task<OwnerPayoutSummaryResult> GetOwnerPayoutSummaryAsync(
        Guid ownerId,
        CancellationToken cancellationToken = default)
    {
        var ownerExists = await _unitOfWork.Owners.ExistsAsync(
            o => o.Id == ownerId && o.DeletedAt == null, cancellationToken);
        if (!ownerExists)
            throw new NotFoundException($"Active owner with ID {ownerId} not found");

        var payouts = await _unitOfWork.OwnerPayouts.Query()
            .Where(op => op.OwnerId == ownerId)
            .ToListAsync(cancellationToken);

        return new OwnerPayoutSummaryResult
        {
            OwnerId = ownerId,
            TotalPending = payouts.Where(op => op.PayoutStatus == "pending").Sum(op => op.PayoutAmount),
            TotalScheduled = payouts.Where(op => op.PayoutStatus == "scheduled").Sum(op => op.PayoutAmount),
            TotalPaid = payouts.Where(op => op.PayoutStatus == "paid").Sum(op => op.PayoutAmount)
        };
    }
}
