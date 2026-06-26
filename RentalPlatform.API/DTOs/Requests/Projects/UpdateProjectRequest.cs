namespace RentalPlatform.API.DTOs.Requests.Areas;

public record UpdateAreaRequest(
    string Name,
    string? Description,
    bool IsActive
);
