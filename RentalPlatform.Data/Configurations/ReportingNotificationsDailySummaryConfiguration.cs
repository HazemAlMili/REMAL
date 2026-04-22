using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.Data.Configurations;

/// <summary>
/// Fluent API configuration for ReportingNotificationsDailySummary.
/// Maps to the reporting_notifications_daily_summary SQL view.
/// Keyless and read-only — no table, no key, no write path.
/// Column names match the frozen DB view contract exactly (DB-RA-05).
/// </summary>
public sealed class ReportingNotificationsDailySummaryConfiguration
    : IEntityTypeConfiguration<ReportingNotificationsDailySummary>
{
    public void Configure(EntityTypeBuilder<ReportingNotificationsDailySummary> builder)
    {
        builder.ToView("reporting_notifications_daily_summary");
        builder.HasNoKey();

        builder.Property(x => x.MetricDate)
            .HasColumnName("metric_date")
            .IsRequired();

        builder.Property(x => x.Channel)
            .HasColumnName("channel")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.NotificationsCreatedCount)
            .HasColumnName("notifications_created_count")
            .IsRequired();

        builder.Property(x => x.PendingNotificationsCount)
            .HasColumnName("pending_notifications_count")
            .IsRequired();

        builder.Property(x => x.QueuedNotificationsCount)
            .HasColumnName("queued_notifications_count")
            .IsRequired();

        builder.Property(x => x.SentNotificationsCount)
            .HasColumnName("sent_notifications_count")
            .IsRequired();

        builder.Property(x => x.DeliveredNotificationsCount)
            .HasColumnName("delivered_notifications_count")
            .IsRequired();

        builder.Property(x => x.FailedNotificationsCount)
            .HasColumnName("failed_notifications_count")
            .IsRequired();

        builder.Property(x => x.CancelledNotificationsCount)
            .HasColumnName("cancelled_notifications_count")
            .IsRequired();

        builder.Property(x => x.ReadNotificationsCount)
            .HasColumnName("read_notifications_count")
            .IsRequired();
    }
}
