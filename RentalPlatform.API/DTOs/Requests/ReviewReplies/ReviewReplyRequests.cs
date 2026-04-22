namespace RentalPlatform.API.DTOs.Requests.ReviewReplies;

public record CreateOrUpdateReviewReplyRequest
{
    public string ReplyText { get; init; } = string.Empty;
    public bool IsVisible { get; init; }
}

public record SetReviewReplyVisibilityRequest
{
    public bool IsVisible { get; init; }
}
