using System;

namespace RentalPlatform.API.DTOs.Responses.Units;

public record UnitListItemResponse
{
    public Guid Id { get; init; }
    public Guid OwnerId { get; init; }
    public Guid AreaId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string UnitType { get; init; } = string.Empty;
    public int Bedrooms { get; init; }
    public int Bathrooms { get; init; }
    public int MaxGuests { get; init; }
    public decimal BasePricePerNight { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
}
