namespace RentalPlatform.API.DTOs.Requests.PublicReviews;

public record GetPublishedReviewsByUnitRequest
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
