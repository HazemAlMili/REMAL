using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class UnitAmenityConfiguration : IEntityTypeConfiguration<UnitAmenity>
{
    public void Configure(EntityTypeBuilder<UnitAmenity> builder)
    {
        builder.ToTable("unit_amenities");

        builder.HasKey(x => new { x.UnitId, x.AmenityId })
            .HasName("pk_unit_amenities");

        builder.Property(x => x.UnitId)
            .HasColumnName("unit_id")
            .IsRequired();

        builder.Property(x => x.AmenityId)
            .HasColumnName("amenity_id")
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.HasOne(x => x.Unit)
            .WithMany(u => u.UnitAmenities)
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_unit_amenities_unit_id");

        builder.HasOne(x => x.Amenity)
            .WithMany()
            .HasForeignKey(x => x.AmenityId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_unit_amenities_amenity_id");
    }
}
