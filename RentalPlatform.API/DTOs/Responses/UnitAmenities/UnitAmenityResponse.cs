using System;

namespace RentalPlatform.API.DTOs.Responses.UnitAmenities;

public record UnitAmenityResponse
{
    public Guid AmenityId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Icon { get; init; } = string.Empty;
}
