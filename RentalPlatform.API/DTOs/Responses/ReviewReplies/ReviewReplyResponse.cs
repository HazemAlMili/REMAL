using System;

namespace RentalPlatform.API.DTOs.Responses.ReviewReplies;

public record ReviewReplyResponse
{
    public Guid Id { get; init; }
    public Guid ReviewId { get; init; }
    public Guid OwnerId { get; init; }
    public string ReplyText { get; init; } = string.Empty;
    public bool IsVisible { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
