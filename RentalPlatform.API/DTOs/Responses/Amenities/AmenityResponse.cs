using System;

namespace RentalPlatform.API.DTOs.Responses.Amenities;

public record AmenityResponse(
    Guid Id,
    string Name,
    string? Icon,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
