using System;

namespace RentalPlatform.API.DTOs.Requests.SeasonalPricing;

public record UpdateSeasonalPricingRequest
{
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public decimal PricePerNight { get; init; }
}
