using System;

namespace RentalPlatform.API.DTOs.Requests.UnitAmenities;

public record AssignUnitAmenityRequest
{
    public Guid AmenityId { get; init; }
}
