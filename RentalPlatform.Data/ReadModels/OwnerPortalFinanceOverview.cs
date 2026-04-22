namespace RentalPlatform.Data.ReadModels;

/// <summary>
/// Keyless read model for the owner_portal_finance_overview SQL view.
/// Booking-level finance snapshot: invoice state, paid/remaining amounts, payout state.
/// No refund/tax/reconciliation/bank/per-payment fields. Read-only, no key.
/// Scope frozen per DB-OP-04 / DA-OP-04.
/// </summary>
public sealed class OwnerPortalFinanceOverview
{
    public Guid OwnerId { get; init; }
    public Guid BookingId { get; init; }
    public Guid UnitId { get; init; }
    public Guid? InvoiceId { get; init; }
    public string? InvoiceStatus { get; init; }
    public decimal InvoicedAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public Guid? PayoutId { get; init; }
    public string? PayoutStatus { get; init; }
    public decimal? PayoutAmount { get; init; }
    public DateTime? PayoutScheduledAt { get; init; }
    public DateTime? PayoutPaidAt { get; init; }
}
