using System;

namespace RentalPlatform.API.DTOs.Requests.DateBlocks;

public record CreateDateBlockRequest
{
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public string? Reason { get; init; }
    public string? Notes { get; init; }
}
