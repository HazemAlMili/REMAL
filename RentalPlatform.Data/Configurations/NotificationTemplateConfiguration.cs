using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class NotificationTemplateConfiguration : IEntityTypeConfiguration<NotificationTemplate>
{
    public void Configure(EntityTypeBuilder<NotificationTemplate> builder)
    {
        builder.ToTable("notification_templates");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(t => t.TemplateCode)
            .HasColumnName("template_code")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(t => t.Channel)
            .HasColumnName("channel")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.RecipientRole)
            .HasColumnName("recipient_role")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.SubjectTemplate)
            .HasColumnName("subject_template")
            .HasMaxLength(200)
            .IsRequired(false);

        builder.Property(t => t.BodyTemplate)
            .HasColumnName("body_template")
            .IsRequired();

        builder.Property(t => t.IsActive)
            .HasColumnName("is_active")
            .IsRequired();

        builder.Property(t => t.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(t => t.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Relationships
        builder.HasMany(t => t.Notifications)
            .WithOne(n => n.Template)
            .HasForeignKey(n => n.TemplateId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_notifications_template_id");
    }
}
