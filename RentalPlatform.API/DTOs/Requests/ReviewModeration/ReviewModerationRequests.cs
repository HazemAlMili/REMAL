namespace RentalPlatform.API.DTOs.Requests.ReviewModeration;

public record PublishReviewRequest
{
    public string? Notes { get; init; }
}

public record RejectReviewRequest
{
    public string? Notes { get; init; }
}

public record HideReviewRequest
{
    public string? Notes { get; init; }
}
