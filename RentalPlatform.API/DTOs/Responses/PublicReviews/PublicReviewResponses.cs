using System;

namespace RentalPlatform.API.DTOs.Responses.PublicReviews;

public record UnitPublishedReviewSummaryResponse
{
    public Guid UnitId { get; init; }
    public int PublishedReviewCount { get; init; }
    public decimal AverageRating { get; init; }
    public DateTime? LastReviewPublishedAt { get; init; }
}

public record PublishedReviewListItemResponse
{
    public Guid ReviewId { get; init; }
    public Guid UnitId { get; init; }
    public int Rating { get; init; }
    public string? Title { get; init; }
    public string? Comment { get; init; }
    public DateTime PublishedAt { get; init; }
    public string? OwnerReplyText { get; init; }
    public DateTime? OwnerReplyUpdatedAt { get; init; }
}
