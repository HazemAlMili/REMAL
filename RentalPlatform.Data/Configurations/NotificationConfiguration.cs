using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");

        builder.HasKey(n => n.Id);
        builder.Property(n => n.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(n => n.TemplateId)
            .HasColumnName("template_id")
            .IsRequired();

        builder.Property(n => n.AdminUserId)
            .HasColumnName("admin_user_id")
            .IsRequired(false);

        builder.Property(n => n.ClientId)
            .HasColumnName("client_id")
            .IsRequired(false);

        builder.Property(n => n.OwnerId)
            .HasColumnName("owner_id")
            .IsRequired(false);

        builder.Property(n => n.Channel)
            .HasColumnName("channel")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(n => n.NotificationStatus)
            .HasColumnName("notification_status")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(n => n.Subject)
            .HasColumnName("subject")
            .HasMaxLength(200)
            .IsRequired(false);

        builder.Property(n => n.Body)
            .HasColumnName("body")
            .IsRequired();

        builder.Property(n => n.ScheduledAt)
            .HasColumnName("scheduled_at")
            .IsRequired(false);

        builder.Property(n => n.SentAt)
            .HasColumnName("sent_at")
            .IsRequired(false);

        builder.Property(n => n.ReadAt)
            .HasColumnName("read_at")
            .IsRequired(false);

        builder.Property(n => n.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(n => n.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Relationships
        builder.HasOne(n => n.Template)
            .WithMany(t => t.Notifications)
            .HasForeignKey(n => n.TemplateId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_notifications_template_id");

        builder.HasOne(n => n.AdminUser)
            .WithMany()
            .HasForeignKey(n => n.AdminUserId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_notifications_admin_user_id");

        builder.HasOne(n => n.Client)
            .WithMany()
            .HasForeignKey(n => n.ClientId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_notifications_client_id");

        builder.HasOne(n => n.Owner)
            .WithMany()
            .HasForeignKey(n => n.OwnerId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("fk_notifications_owner_id");

        builder.HasMany(n => n.DeliveryLogs)
            .WithOne(d => d.Notification)
            .HasForeignKey(d => d.NotificationId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_notification_delivery_logs_notification_id");
    }
}
