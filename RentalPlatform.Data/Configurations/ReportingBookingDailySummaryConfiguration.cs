using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.Data.Configurations;

/// <summary>
/// Fluent API configuration for ReportingBookingDailySummary.
/// Maps to the reporting_booking_daily_summary SQL view.
/// Keyless and read-only — no table, no key, no write path.
/// Column names match the frozen DB view contract exactly (DB-RA-02).
/// </summary>
public sealed class ReportingBookingDailySummaryConfiguration
    : IEntityTypeConfiguration<ReportingBookingDailySummary>
{
    public void Configure(EntityTypeBuilder<ReportingBookingDailySummary> builder)
    {
        builder.ToView("reporting_booking_daily_summary");
        builder.HasNoKey();

        builder.Property(x => x.MetricDate)
            .HasColumnName("metric_date")
            .IsRequired();

        builder.Property(x => x.BookingSource)
            .HasColumnName("booking_source")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.BookingsCreatedCount)
            .HasColumnName("bookings_created_count")
            .IsRequired();

        builder.Property(x => x.PendingBookingsCount)
            .HasColumnName("pending_bookings_count")
            .IsRequired();

        builder.Property(x => x.ConfirmedBookingsCount)
            .HasColumnName("confirmed_bookings_count")
            .IsRequired();

        builder.Property(x => x.CancelledBookingsCount)
            .HasColumnName("cancelled_bookings_count")
            .IsRequired();

        builder.Property(x => x.CompletedBookingsCount)
            .HasColumnName("completed_bookings_count")
            .IsRequired();

        builder.Property(x => x.TotalFinalAmount)
            .HasColumnName("total_final_amount")
            .HasPrecision(14, 2)
            .IsRequired();
    }
}
