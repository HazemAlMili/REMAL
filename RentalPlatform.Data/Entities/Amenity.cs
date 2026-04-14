using System;

namespace RentalPlatform.Data.Entities;

public class Amenity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
