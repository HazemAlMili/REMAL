using System;
using System.Collections.Generic;

namespace RentalPlatform.Business.Models;

public class UnitPricingResult
{
    public Guid UnitId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public IReadOnlyList<NightlyPriceBreakdownItem> Nights { get; set; } = Array.Empty<NightlyPriceBreakdownItem>();
}
