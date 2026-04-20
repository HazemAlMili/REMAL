using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class InvoiceItemConfiguration : IEntityTypeConfiguration<InvoiceItem>
{
    public void Configure(EntityTypeBuilder<InvoiceItem> builder)
    {
        builder.ToTable("invoice_items");

        builder.HasKey(ii => ii.Id);
        builder.Property(ii => ii.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(ii => ii.InvoiceId)
            .HasColumnName("invoice_id")
            .IsRequired();

        builder.Property(ii => ii.LineType)
            .HasColumnName("line_type")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(ii => ii.Description)
            .HasColumnName("description")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(ii => ii.Quantity)
            .HasColumnName("quantity")
            .IsRequired();

        builder.Property(ii => ii.UnitAmount)
            .HasColumnName("unit_amount")
            .HasColumnType("decimal(12,2)")
            .IsRequired();

        builder.Property(ii => ii.LineTotal)
            .HasColumnName("line_total")
            .HasColumnType("decimal(12,2)")
            .IsRequired();

        builder.Property(ii => ii.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(ii => ii.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Relationships
        builder.HasOne(ii => ii.Invoice)
            .WithMany(i => i.InvoiceItems)
            .HasForeignKey(ii => ii.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
