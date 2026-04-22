using System.Threading;
using System.Threading.Tasks;
using RentalPlatform.Business.Models;

namespace RentalPlatform.Business.Interfaces;

/// <summary>
/// Read-only owner-scoped dashboard summary for Owner Portal.
/// Aggregates unit, booking, and finance counts for the owner's home screen.
/// Values are derived from existing read models and payout records — no new source-of-truth tables.
/// Scope frozen per BZ-OP-01 / 0010_owner_portal_business_scope decision note.
/// </summary>
public interface IOwnerPortalDashboardService
{
    /// <summary>
    /// Returns a consolidated dashboard summary for <paramref name="ownerId"/>.
    /// </summary>
    Task<OwnerPortalDashboardSummaryResult> GetSummaryAsync(
        Guid ownerId,
        CancellationToken cancellationToken = default);
}
