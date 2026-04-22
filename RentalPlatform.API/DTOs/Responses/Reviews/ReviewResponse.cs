using System;

namespace RentalPlatform.API.DTOs.Responses.Reviews;

public record ReviewResponse
{
    public Guid Id { get; init; }
    public Guid BookingId { get; init; }
    public Guid UnitId { get; init; }
    public Guid ClientId { get; init; }
    public Guid OwnerId { get; init; }
    public int Rating { get; init; }
    public string? Title { get; init; }
    public string? Comment { get; init; }
    public string ReviewStatus { get; init; } = string.Empty;
    public DateTime SubmittedAt { get; init; }
    public DateTime? PublishedAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
