namespace RentalPlatform.Business.Models;

/// <summary>
/// Consolidated dashboard summary for an owner's portal home screen.
/// Aggregates unit, booking, and finance counts derived from existing read models.
/// No new source-of-truth tables — values are computed from read models and payout records.
/// Scope frozen per BZ-OP-01.
/// </summary>
public record OwnerPortalDashboardSummaryResult
{
    public Guid OwnerId { get; init; }
    public int TotalUnits { get; init; }
    public int ActiveUnits { get; init; }
    public int TotalBookings { get; init; }
    public int ConfirmedBookings { get; init; }
    public int CompletedBookings { get; init; }
    public decimal TotalPaidAmount { get; init; }
    public decimal TotalPendingPayoutAmount { get; init; }
    public decimal TotalPaidPayoutAmount { get; init; }
}
