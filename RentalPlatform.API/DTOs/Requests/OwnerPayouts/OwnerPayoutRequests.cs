using System;

namespace RentalPlatform.API.DTOs.Requests.OwnerPayouts;

public record CreateOrUpdateOwnerPayoutRequest
{
    public Guid BookingId { get; init; }
    public decimal CommissionRate { get; init; }
    public string? Notes { get; init; }
}

public record SetOwnerPayoutScheduledRequest
{
    public string? Notes { get; init; }
}

public record MarkOwnerPayoutPaidRequest
{
    public string? Notes { get; init; }
}

public record CancelOwnerPayoutRequest
{
    public string? Notes { get; init; }
}
