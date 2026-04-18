using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class BookingStatusHistoryConfiguration : IEntityTypeConfiguration<BookingStatusHistory>
{
    public void Configure(EntityTypeBuilder<BookingStatusHistory> builder)
    {
        builder.ToTable("booking_status_history");

        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(e => e.BookingId)
            .HasColumnName("booking_id")
            .IsRequired();

        builder.Property(e => e.OldStatus)
            .HasColumnName("old_status")
            .HasMaxLength(50); // nullable by C# property type

        builder.Property(e => e.NewStatus)
            .HasColumnName("new_status")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.ChangedByAdminUserId)
            .HasColumnName("changed_by_admin_user_id");

        builder.Property(e => e.Notes)
            .HasColumnName("notes");

        builder.Property(e => e.ChangedAt)
            .HasColumnName("changed_at")
            .IsRequired();

        // Relationships
        builder.HasOne(e => e.Booking)
            .WithMany(b => b.StatusHistory)
            .HasForeignKey(e => e.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.ChangedByAdminUser)
            .WithMany()
            .HasForeignKey(e => e.ChangedByAdminUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
