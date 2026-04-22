using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.Data.Configurations;

/// <summary>
/// Fluent API configuration for OwnerPortalUnitOverview.
/// Maps to the owner_portal_units_overview SQL view.
/// Keyless and read-only — no table, no key, no write path.
/// Column names match the frozen DB view contract exactly (DB-OP-02).
/// </summary>
public sealed class OwnerPortalUnitOverviewConfiguration
    : IEntityTypeConfiguration<OwnerPortalUnitOverview>
{
    public void Configure(EntityTypeBuilder<OwnerPortalUnitOverview> builder)
    {
        builder.ToView("owner_portal_units_overview");
        builder.HasNoKey();

        builder.Property(x => x.OwnerId)
            .HasColumnName("owner_id")
            .IsRequired();

        builder.Property(x => x.UnitId)
            .HasColumnName("unit_id")
            .IsRequired();

        builder.Property(x => x.AreaId)
            .HasColumnName("area_id")
            .IsRequired();

        builder.Property(x => x.UnitName)
            .HasColumnName("unit_name")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.UnitType)
            .HasColumnName("unit_type")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .HasColumnName("is_active")
            .IsRequired();

        builder.Property(x => x.Bedrooms)
            .HasColumnName("bedrooms")
            .IsRequired();

        builder.Property(x => x.Bathrooms)
            .HasColumnName("bathrooms")
            .IsRequired();

        builder.Property(x => x.MaxGuests)
            .HasColumnName("max_guests")
            .IsRequired();

        builder.Property(x => x.BasePricePerNight)
            .HasColumnName("base_price_per_night")
            .HasColumnType("decimal(12,2)")
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();
    }
}
