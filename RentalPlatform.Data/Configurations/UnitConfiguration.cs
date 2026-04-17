using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.ToTable("units");

        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.OwnerId)
            .HasColumnName("owner_id")
            .IsRequired();

        builder.Property(x => x.AreaId)
            .HasColumnName("area_id")
            .IsRequired();

        builder.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasColumnName("description");

        builder.Property(x => x.Address)
            .HasColumnName("address")
            .HasMaxLength(255);

        builder.Property(x => x.UnitType)
            .HasColumnName("unit_type")
            .HasMaxLength(50)
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

        builder.Property(x => x.IsActive)
            .HasColumnName("is_active")
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        builder.Property(x => x.DeletedAt)
            .HasColumnName("deleted_at");

        builder.HasQueryFilter(x => x.DeletedAt == null);

        builder.HasOne(x => x.Owner)
            .WithMany()
            .HasForeignKey(x => x.OwnerId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_units_owner_id");

        builder.HasOne(x => x.Area)
            .WithMany()
            .HasForeignKey(x => x.AreaId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_units_area_id");
    }
}
