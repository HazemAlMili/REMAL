using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class DateBlockConfiguration : IEntityTypeConfiguration<DateBlock>
{
    public void Configure(EntityTypeBuilder<DateBlock> builder)
    {
        builder.ToTable("date_blocks");

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

        builder.Property(x => x.Reason)
            .HasColumnName("reason")
            .HasMaxLength(100);

        builder.Property(x => x.Notes)
            .HasColumnName("notes");

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        builder.HasOne(x => x.Unit)
            .WithMany(u => u.DateBlocks)
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_date_blocks_unit_id");
    }
}
