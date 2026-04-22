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

public class OwnerPortalFinanceService : IOwnerPortalFinanceService
{
    private readonly IUnitOfWork _unitOfWork;

    public OwnerPortalFinanceService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<OwnerPortalFinanceOverview>> GetAllByOwnerAsync(
        Guid ownerId,
        string? invoiceStatus = null,
        string? payoutStatus = null,
        CancellationToken cancellationToken = default)
    {
        await ValidateOwnerAsync(ownerId, cancellationToken);

        var query = _unitOfWork.OwnerPortalFinanceOverview
            .Where(f => f.OwnerId == ownerId);

        if (!string.IsNullOrWhiteSpace(invoiceStatus))
            query = query.Where(f => f.InvoiceStatus == invoiceStatus);

        if (!string.IsNullOrWhiteSpace(payoutStatus))
            query = query.Where(f => f.PayoutStatus == payoutStatus);

        return await query
            .OrderBy(f => f.BookingId)
            .ToListAsync(cancellationToken);
    }

    public async Task<OwnerPortalFinanceOverview?> GetByOwnerAndBookingIdAsync(
        Guid ownerId,
        Guid bookingId,
        CancellationToken cancellationToken = default)
    {
        await ValidateOwnerAsync(ownerId, cancellationToken);

        var row = await _unitOfWork.OwnerPortalFinanceOverview
            .Where(f => f.OwnerId == ownerId && f.BookingId == bookingId)
            .FirstOrDefaultAsync(cancellationToken);

        if (row is null)
            throw new NotFoundException($"Finance overview for booking {bookingId} not found in owner portal context.");

        return row;
    }

    public async Task<OwnerPortalFinanceSummaryResult> GetSummaryByOwnerAsync(
        Guid ownerId,
        CancellationToken cancellationToken = default)
    {
        await ValidateOwnerAsync(ownerId, cancellationToken);

        var rows = await _unitOfWork.OwnerPortalFinanceOverview
            .Where(f => f.OwnerId == ownerId)
            .ToListAsync(cancellationToken);

        return new OwnerPortalFinanceSummaryResult
        {
            OwnerId                    = ownerId,
            TotalInvoicedAmount        = rows.Sum(f => f.InvoicedAmount),
            TotalPaidAmount            = rows.Sum(f => f.PaidAmount),
            TotalRemainingAmount       = rows.Sum(f => f.RemainingAmount),
            TotalPendingPayoutAmount   = rows
                .Where(f => f.PayoutStatus == "pending")
                .Sum(f => f.PayoutAmount ?? 0m),
            TotalScheduledPayoutAmount = rows
                .Where(f => f.PayoutStatus == "scheduled")
                .Sum(f => f.PayoutAmount ?? 0m),
            TotalPaidPayoutAmount      = rows
                .Where(f => f.PayoutStatus == "paid")
                .Sum(f => f.PayoutAmount ?? 0m),
        };
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private async Task ValidateOwnerAsync(Guid ownerId, CancellationToken cancellationToken)
    {
        var owner = await _unitOfWork.Owners.GetByIdAsync(ownerId, cancellationToken);

        if (owner is null)
            throw new NotFoundException($"Owner {ownerId} not found.");

        if (owner.Status != "active")
            throw new BusinessValidationException($"Owner {ownerId} is not active.");
    }
}
