using System;

namespace RentalPlatform.Data.Entities;

public class UnitImage
{
    public Guid Id { get; set; }
    public Guid UnitId { get; set; }
    public string FileKey { get; set; } = string.Empty;
    public bool IsCover { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Unit Unit { get; set; } = null!;
}
