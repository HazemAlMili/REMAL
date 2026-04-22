using System;

namespace RentalPlatform.API.DTOs.Requests.Reviews;

public record CreateReviewRequest
{
    public Guid BookingId { get; init; }
    public int Rating { get; init; }
    public string? Title { get; init; }
    public string? Comment { get; init; }
}

public record UpdatePendingReviewRequest
{
    public int Rating { get; init; }
    public string? Title { get; init; }
    public string? Comment { get; init; }
}
