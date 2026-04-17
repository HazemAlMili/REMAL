using System;

namespace RentalPlatform.Data.Entities;

public class UnitAmenity
{
    public Guid UnitId { get; set; }
    public Guid AmenityId { get; set; }
    public DateTime CreatedAt { get; set; }

    public Unit Unit { get; set; } = null!;
    public Amenity Amenity { get; set; } = null!;
}
