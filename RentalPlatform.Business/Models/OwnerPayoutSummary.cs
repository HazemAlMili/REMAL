using System;

namespace RentalPlatform.Business.Models;

public record OwnerPayoutSummaryResult
{
    public Guid OwnerId { get; init; }
    public decimal TotalPending { get; init; }
    public decimal TotalScheduled { get; init; }
    public decimal TotalPaid { get; init; }
}
