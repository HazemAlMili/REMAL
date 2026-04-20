using System;

namespace RentalPlatform.API.DTOs.Responses.BookingLifecycle;

public record BookingStatusHistoryResponse
{
    public Guid Id { get; init; }
    public Guid BookingId { get; init; }
    public string? OldStatus { get; init; }
    public string NewStatus { get; init; } = string.Empty;
    public Guid ChangedByAdminUserId { get; init; }
    public string? Notes { get; init; }
    public DateTime ChangedAt { get; init; }
}
