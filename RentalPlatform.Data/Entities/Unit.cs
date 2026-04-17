using System;
using System.Collections.Generic;

namespace RentalPlatform.Data.Entities;

public class Unit
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public Guid AreaId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string UnitType { get; set; } = string.Empty;
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public int MaxGuests { get; set; }
    public decimal BasePricePerNight { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }

    public Owner Owner { get; set; } = null!;
    public Area Area { get; set; } = null!;

    public ICollection<UnitImage> UnitImages { get; set; } = new List<UnitImage>();
    public ICollection<UnitAmenity> UnitAmenities { get; set; } = new List<UnitAmenity>();
    public ICollection<SeasonalPricing> SeasonalPricings { get; set; } = new List<SeasonalPricing>();
    public ICollection<DateBlock> DateBlocks { get; set; } = new List<DateBlock>();
}
