using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class CrmAssignmentConfiguration : IEntityTypeConfiguration<CrmAssignment>
{
    public void Configure(EntityTypeBuilder<CrmAssignment> builder)
    {
        builder.ToTable("crm_assignments");

        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(e => e.BookingId)
            .HasColumnName("booking_id");

        builder.Property(e => e.CrmLeadId)
            .HasColumnName("crm_lead_id");

        builder.Property(e => e.AssignedAdminUserId)
            .HasColumnName("assigned_admin_user_id")
            .IsRequired();

        builder.Property(e => e.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(e => e.AssignedAt)
            .HasColumnName("assigned_at")
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Relationships
        builder.HasOne(e => e.Booking)
            .WithMany(b => b.CrmAssignments)
            .HasForeignKey(e => e.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.CrmLead)
            .WithMany(l => l.CrmAssignments)
            .HasForeignKey(e => e.CrmLeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.AssignedAdminUser)
            .WithMany()
            .HasForeignKey(e => e.AssignedAdminUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Note: The ck_crm_assignments_exactly_one_parent constraint is enforced at the DB level.
    }
}
