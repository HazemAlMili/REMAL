using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class SeasonalPricingConfiguration : IEntityTypeConfiguration<SeasonalPricing>
{
    public void Configure(EntityTypeBuilder<SeasonalPricing> builder)
    {
        builder.ToTable("seasonal_pricing");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.UnitId)
            .HasColumnName("unit_id")
            .IsRequired();

        builder.Property(x => x.StartDate)
            .HasColumnName("start_date")
            .IsRequired();

        builder.Property(x => x.EndDate)
            .HasColumnName("end_date")
            .IsRequired();

        builder.Property(x => x.PricePerNight)
            .HasColumnName("price_per_night")
            .HasColumnType("decimal(12,2)")
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        builder.HasOne(x => x.Unit)
            .WithMany(u => u.SeasonalPricings)
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_seasonal_pricing_unit_id");
    }
}
