using System;

namespace RentalPlatform.Business.Models;

public class NightlyPriceBreakdownItem
{
    public DateOnly Date { get; set; }
    public decimal PricePerNight { get; set; }
    public string PriceSource { get; set; } = string.Empty; // "base" or "seasonal"
}
