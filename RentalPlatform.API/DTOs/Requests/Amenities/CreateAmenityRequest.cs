namespace RentalPlatform.API.DTOs.Requests.Amenities;

public record CreateAmenityRequest(
    string Name,
    string? Icon
);
