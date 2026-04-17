using System;

namespace RentalPlatform.API.DTOs.Responses.SeasonalPricing;

public record SeasonalPricingResponse
{
    public Guid Id { get; init; }
    public Guid UnitId { get; init; }
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public decimal PricePerNight { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
