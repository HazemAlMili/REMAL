using System;

namespace RentalPlatform.API.DTOs.Responses.ReviewModeration;

public record ReviewStatusHistoryResponse
{
    public Guid Id { get; init; }
    public Guid ReviewId { get; init; }
    public string? OldStatus { get; init; }
    public string NewStatus { get; init; } = string.Empty;
    public Guid? ChangedByAdminUserId { get; init; }
    public string? Notes { get; init; }
    public DateTime ChangedAt { get; init; }
}
