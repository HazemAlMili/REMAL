using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.ToTable("notification_preferences");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(p => p.AdminUserId)
            .HasColumnName("admin_user_id")
            .IsRequired(false);

        builder.Property(p => p.ClientId)
            .HasColumnName("client_id")
            .IsRequired(false);

        builder.Property(p => p.OwnerId)
            .HasColumnName("owner_id")
            .IsRequired(false);

        builder.Property(p => p.Channel)
            .HasColumnName("channel")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(p => p.PreferenceKey)
            .HasColumnName("preference_key")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(p => p.IsEnabled)
            .HasColumnName("is_enabled")
            .IsRequired();

        builder.Property(p => p.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Relationships
        builder.HasOne(p => p.AdminUser)
            .WithMany()
            .HasForeignKey(p => p.AdminUserId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_notification_preferences_admin_user_id");

        builder.HasOne(p => p.Client)
            .WithMany()
            .HasForeignKey(p => p.ClientId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_notification_preferences_client_id");

        builder.HasOne(p => p.Owner)
            .WithMany()
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_notification_preferences_owner_id");
    }
}
