namespace RentalPlatform.API.DTOs.Requests.Units;

public record PublicUnitCatalogRequest
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public Guid? ProjectId { get; init; }
    public string? UnitType { get; init; }
    public int? MinGuests { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public string? Search { get; init; }
    public string? SortBy { get; init; }
    public string[] AmenityIds { get; init; } = Array.Empty<string>();
}