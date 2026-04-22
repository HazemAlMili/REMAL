using System;

namespace RentalPlatform.API.DTOs.Responses.OwnerPayouts;

public record OwnerPayoutResponse
{
    public Guid Id { get; init; }
    public Guid BookingId { get; init; }
    public Guid OwnerId { get; init; }
    public string PayoutStatus { get; init; } = string.Empty;
    public decimal GrossBookingAmount { get; init; }
    public decimal CommissionRate { get; init; }
    public decimal CommissionAmount { get; init; }
    public decimal PayoutAmount { get; init; }
    public DateTime? ScheduledAt { get; init; }
    public DateTime? PaidAt { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
