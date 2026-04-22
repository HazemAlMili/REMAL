using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Business.Models;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.Business.Interfaces;

/// <summary>
/// Read-only owner-scoped finance overview queries for Owner Portal.
/// Every method is scoped to the provided ownerId — cross-owner access is never permitted.
/// No refund/tax/reconciliation/bank/per-payment detail in this service.
/// Scope frozen per BZ-OP-01 / 0010_owner_portal_business_scope decision note.
/// </summary>
public interface IOwnerPortalFinanceService
{
    /// <summary>
    /// Returns all booking-level finance snapshots for bookings belonging to <paramref name="ownerId"/>'s units.
    /// Optionally filtered by invoice status and/or payout status.
    /// </summary>
    Task<IReadOnlyList<OwnerPortalFinanceOverview>> GetAllByOwnerAsync(
        Guid ownerId,
        string? invoiceStatus = null,
        string? payoutStatus = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the finance snapshot for a single booking only if the booking belongs to
    /// a unit owned by <paramref name="ownerId"/>.
    /// </summary>
    Task<OwnerPortalFinanceOverview?> GetByOwnerAndBookingIdAsync(
        Guid ownerId,
        Guid bookingId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns aggregated finance totals for <paramref name="ownerId"/> across all bookings.
    /// </summary>
    Task<OwnerPortalFinanceSummaryResult> GetSummaryByOwnerAsync(
        Guid ownerId,
        CancellationToken cancellationToken = default);
}
