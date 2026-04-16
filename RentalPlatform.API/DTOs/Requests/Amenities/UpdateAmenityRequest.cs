namespace RentalPlatform.API.DTOs.Requests.Amenities;

public record UpdateAmenityRequest(
    string Name,
    string? Icon
);
