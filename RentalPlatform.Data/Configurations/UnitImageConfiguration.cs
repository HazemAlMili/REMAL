using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class UnitImageConfiguration : IEntityTypeConfiguration<UnitImage>
{
    public void Configure(EntityTypeBuilder<UnitImage> builder)
    {
        builder.ToTable("unit_images");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.UnitId)
            .HasColumnName("unit_id")
            .IsRequired();

        builder.Property(x => x.FileKey)
            .HasColumnName("file_key")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.IsCover)
            .HasColumnName("is_cover")
            .IsRequired();

        builder.Property(x => x.DisplayOrder)
            .HasColumnName("display_order")
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        builder.HasOne(x => x.Unit)
            .WithMany(u => u.UnitImages)
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_unit_images_unit_id");
    }
}
