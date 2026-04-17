using System;

namespace RentalPlatform.API.DTOs.Responses.DateBlocks;

public record DateBlockResponse
{
    public Guid Id { get; init; }
    public Guid UnitId { get; init; }
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public string? Reason { get; init; }
    public string? Notes { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
