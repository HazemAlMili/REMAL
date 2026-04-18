using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class CrmNoteConfiguration : IEntityTypeConfiguration<CrmNote>
{
    public void Configure(EntityTypeBuilder<CrmNote> builder)
    {
        builder.ToTable("crm_notes");

        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(e => e.BookingId)
            .HasColumnName("booking_id");

        builder.Property(e => e.CrmLeadId)
            .HasColumnName("crm_lead_id");

        builder.Property(e => e.CreatedByAdminUserId)
            .HasColumnName("created_by_admin_user_id");

        builder.Property(e => e.NoteText)
            .HasColumnName("note_text")
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Relationships
        builder.HasOne(e => e.Booking)
            .WithMany(b => b.CrmNotes)
            .HasForeignKey(e => e.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.CrmLead)
            .WithMany(l => l.CrmNotes)
            .HasForeignKey(e => e.CrmLeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.CreatedByAdminUser)
            .WithMany()
            .HasForeignKey(e => e.CreatedByAdminUserId)
            .OnDelete(DeleteBehavior.SetNull);

        // Note: The ck_crm_notes_exactly_one_parent constraint is enforced at the database level.
        // We ensure both foreign keys are mapped as nullable in EF Core so that the objects can
        // properly satisfy only one side at runtime without breaking EF Core tracking rules.
    }
}
