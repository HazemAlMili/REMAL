using System;

namespace RentalPlatform.API.DTOs.Requests.Units;

public record CreateUnitRequest
{
    public Guid OwnerId { get; init; }
    public Guid AreaId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Address { get; init; }
    public string UnitType { get; init; } = string.Empty;
    public int Bedrooms { get; init; }
    public int Bathrooms { get; init; }
    public int MaxGuests { get; init; }
    public decimal BasePricePerNight { get; init; }
    public bool IsActive { get; init; }
}
