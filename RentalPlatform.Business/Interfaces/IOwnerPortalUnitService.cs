using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.Business.Interfaces;

/// <summary>
/// Read-only owner-scoped unit overview queries for Owner Portal.
/// Every method is scoped to the provided ownerId — cross-owner access is never permitted.
/// No write-side, availability, or booking/finance data in this service.
/// Scope frozen per BZ-OP-01 / 0010_owner_portal_business_scope decision note.
/// </summary>
public interface IOwnerPortalUnitService
{
    /// <summary>
    /// Returns all units belonging to <paramref name="ownerId"/>.
    /// Optionally filtered by active state and/or area.
    /// </summary>
    Task<IReadOnlyList<OwnerPortalUnitOverview>> GetAllByOwnerAsync(
        Guid ownerId,
        bool? isActive = null,
        Guid? areaId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns a single unit only if it belongs to <paramref name="ownerId"/>.
    /// Returns null (treated as not found in portal context) if the unit belongs to a different owner.
    /// </summary>
    Task<OwnerPortalUnitOverview?> GetByOwnerAndUnitIdAsync(
        Guid ownerId,
        Guid unitId,
        CancellationToken cancellationToken = default);
}
