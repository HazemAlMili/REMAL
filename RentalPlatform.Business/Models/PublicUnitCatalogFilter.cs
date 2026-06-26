namespace RentalPlatform.Business.Models;

public sealed record PublicUnitCatalogFilter(
    int Page,
    int PageSize,
    Guid? ProjectId,
    string? UnitType,
    int? MinGuests,
    decimal? MinPrice,
    decimal? MaxPrice,
    string? Search,
    string? SortBy,
    IReadOnlyList<Guid> AmenityIds
);