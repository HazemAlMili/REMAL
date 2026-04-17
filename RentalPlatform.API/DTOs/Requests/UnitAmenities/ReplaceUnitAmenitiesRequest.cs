using System;

namespace RentalPlatform.API.DTOs.Requests.UnitAmenities;

public record ReplaceUnitAmenitiesRequest
{
    public Guid[] AmenityIds { get; init; } = Array.Empty<Guid>();
}
