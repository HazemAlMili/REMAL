namespace RentalPlatform.Business.Models;

/// <summary>
/// Aggregated finance totals for an owner across all bookings.
/// Derived from owner_portal_finance_overview read model.
/// No refund/tax/bank/reconciliation fields.
/// Scope frozen per BZ-OP-01.
/// </summary>
public record OwnerPortalFinanceSummaryResult
{
    public Guid OwnerId { get; init; }
    public decimal TotalInvoicedAmount { get; init; }
    public decimal TotalPaidAmount { get; init; }
    public decimal TotalRemainingAmount { get; init; }
    public decimal TotalPendingPayoutAmount { get; init; }
    public decimal TotalScheduledPayoutAmount { get; init; }
    public decimal TotalPaidPayoutAmount { get; init; }
}
