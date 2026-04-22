using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class NotificationDeliveryLogConfiguration : IEntityTypeConfiguration<NotificationDeliveryLog>
{
    public void Configure(EntityTypeBuilder<NotificationDeliveryLog> builder)
    {
        builder.ToTable("notification_delivery_logs");

        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(d => d.NotificationId)
            .HasColumnName("notification_id")
            .IsRequired();

        builder.Property(d => d.AttemptNumber)
            .HasColumnName("attempt_number")
            .IsRequired();

        builder.Property(d => d.DeliveryStatus)
            .HasColumnName("delivery_status")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(d => d.ProviderName)
            .HasColumnName("provider_name")
            .HasMaxLength(100)
            .IsRequired(false);

        builder.Property(d => d.ProviderMessageId)
            .HasColumnName("provider_message_id")
            .HasMaxLength(150)
            .IsRequired(false);

        builder.Property(d => d.ErrorMessage)
            .HasColumnName("error_message")
            .IsRequired(false);

        builder.Property(d => d.AttemptedAt)
            .HasColumnName("attempted_at")
            .IsRequired();

        // Relationship
        builder.HasOne(d => d.Notification)
            .WithMany(n => n.DeliveryLogs)
            .HasForeignKey(d => d.NotificationId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_notification_delivery_logs_notification_id");
    }
}
