using System;

namespace RentalPlatform.Data.Entities;

public class UnitReviewSummary
{
    public Guid UnitId { get; set; }
    public int PublishedReviewCount { get; set; }
    public decimal AverageRating { get; set; }
    public DateTime? LastReviewPublishedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Unit Unit { get; set; } = null!;
}
