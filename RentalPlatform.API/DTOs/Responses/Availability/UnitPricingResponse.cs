using System;
using System.Collections.Generic;

namespace RentalPlatform.API.DTOs.Responses.Availability;

public record UnitPricingResponse
{
    public Guid UnitId { get; init; }
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public decimal TotalPrice { get; init; }
    public List<NightlyPriceItem> Nights { get; init; } = new();
}

public record NightlyPriceItem
{
    public DateOnly Date { get; init; }
    public decimal PricePerNight { get; init; }
    public string PriceSource { get; init; } = string.Empty;
}
