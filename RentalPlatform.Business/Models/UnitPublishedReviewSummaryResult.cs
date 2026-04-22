using System;

namespace RentalPlatform.Business.Models;

public record UnitPublishedReviewSummaryResult
{
    public Guid UnitId { get; init; }
    public int PublishedReviewCount { get; init; }
    public decimal AverageRating { get; init; }
    public DateTime? LastReviewPublishedAt { get; init; }
}
