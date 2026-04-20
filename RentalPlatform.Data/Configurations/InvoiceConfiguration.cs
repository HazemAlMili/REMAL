using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("invoices");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(i => i.BookingId)
            .HasColumnName("booking_id")
            .IsRequired();

        builder.Property(i => i.InvoiceNumber)
            .HasColumnName("invoice_number")
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(i => i.InvoiceNumber)
            .IsUnique();

        builder.Property(i => i.InvoiceStatus)
            .HasColumnName("invoice_status")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(i => i.SubtotalAmount)
            .HasColumnName("subtotal_amount")
            .HasColumnType("decimal(12,2)")
            .IsRequired();

        builder.Property(i => i.TotalAmount)
            .HasColumnName("total_amount")
            .HasColumnType("decimal(12,2)")
            .IsRequired();

        builder.Property(i => i.IssuedAt)
            .HasColumnName("issued_at");

        builder.Property(i => i.DueDate)
            .HasColumnName("due_date");

        builder.Property(i => i.Notes)
            .HasColumnName("notes");

        builder.Property(i => i.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(i => i.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Relationships
        builder.HasOne(i => i.Booking)
            .WithMany()
            .HasForeignKey(i => i.BookingId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
