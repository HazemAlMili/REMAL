namespace RentalPlatform.API.DTOs.Requests.UnitImages;

public record AddUnitImageRequest
{
    public string FileKey { get; init; } = string.Empty;
    public bool IsCover { get; init; }
    public int DisplayOrder { get; init; }
}
