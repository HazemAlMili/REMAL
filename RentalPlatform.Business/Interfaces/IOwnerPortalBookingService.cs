using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.Business.Interfaces;

/// <summary>
/// Read-only owner-scoped booking overview queries for Owner Portal.
/// Every method is scoped to the provided ownerId — cross-owner access is never permitted.
/// No CRM notes, invoice/payment balance, or client PII beyond ClientId in this service.
/// Scope frozen per BZ-OP-01 / 0010_owner_portal_business_scope decision note.
/// </summary>
public interface IOwnerPortalBookingService
{
    /// <summary>
    /// Returns all bookings for units belonging to <paramref name="ownerId"/>.
    /// Optionally filtered by booking status and/or check-in date range.
    /// </summary>
    Task<IReadOnlyList<OwnerPortalBookingOverview>> GetAllByOwnerAsync(
        Guid ownerId,
        string? bookingStatus = null,
        DateOnly? checkInFrom = null,
        DateOnly? checkInTo = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns a single booking only if it belongs to a unit owned by <paramref name="ownerId"/>.
    /// Returns null (treated as not found in portal context) if the booking belongs to another owner's unit.
    /// </summary>
    Task<OwnerPortalBookingOverview?> GetByOwnerAndBookingIdAsync(
        Guid ownerId,
        Guid bookingId,
        CancellationToken cancellationToken = default);
}
