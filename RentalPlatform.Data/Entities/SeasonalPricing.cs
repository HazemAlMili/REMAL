using System;

namespace RentalPlatform.Data.Entities;

public class SeasonalPricing
{
    public Guid Id { get; set; }
    public Guid UnitId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal PricePerNight { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Unit Unit { get; set; } = null!;
}
