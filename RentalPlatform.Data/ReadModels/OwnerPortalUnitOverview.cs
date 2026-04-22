namespace RentalPlatform.Data.ReadModels;

/// <summary>
/// Keyless read model for the owner_portal_units_overview SQL view.
/// Maps the owner-facing unit inventory for the Owner Portal.
/// Read-only — no write-side semantics, no key, no soft-delete.
/// Scope frozen per DB-OP-01 / DA-OP-02.
/// </summary>
public sealed class OwnerPortalUnitOverview
{
    public Guid OwnerId { get; init; }
    public Guid UnitId { get; init; }
    public Guid AreaId { get; init; }
    public string UnitName { get; init; } = string.Empty;
    public string UnitType { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public int Bedrooms { get; init; }
    public int Bathrooms { get; init; }
    public int MaxGuests { get; init; }
    public decimal BasePricePerNight { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
