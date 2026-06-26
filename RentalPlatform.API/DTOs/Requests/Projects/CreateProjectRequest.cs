namespace RentalPlatform.API.DTOs.Requests.Areas;

public record CreateAreaRequest(
    string Name,
    string? Description,
    bool IsActive
);
