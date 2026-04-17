using System;

namespace RentalPlatform.API.DTOs.Responses.UnitImages;

public record UnitImageResponse
{
    public Guid Id { get; init; }
    public Guid UnitId { get; init; }
    public string FileKey { get; init; } = string.Empty;
    public bool IsCover { get; init; }
    public int DisplayOrder { get; init; }
    public DateTime CreatedAt { get; init; }
}
