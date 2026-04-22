using System;

namespace RentalPlatform.Business.Models;

public record PublishedReviewListItemResult
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
