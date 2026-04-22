using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.ReadModels;

namespace RentalPlatform.Data.Configurations;

/// <summary>
/// Fluent API configuration for ReportingReviewsDailySummary.
/// Maps to the reporting_reviews_daily_summary SQL view.
/// Keyless and read-only — no table, no key, no write path.
/// Column names match the frozen DB view contract exactly (DB-RA-04).
/// </summary>
public sealed class ReportingReviewsDailySummaryConfiguration
    : IEntityTypeConfiguration<ReportingReviewsDailySummary>
{
    public void Configure(EntityTypeBuilder<ReportingReviewsDailySummary> builder)
    {
        builder.ToView("reporting_reviews_daily_summary");
        builder.HasNoKey();

        builder.Property(x => x.MetricDate)
            .HasColumnName("metric_date")
            .IsRequired();

        builder.Property(x => x.PublishedReviewsCount)
            .HasColumnName("published_reviews_count")
            .IsRequired();

        builder.Property(x => x.AverageRating)
            .HasColumnName("average_rating")
            .HasPrecision(3, 2)
            .IsRequired();

        builder.Property(x => x.ReviewsWithOwnerReplyCount)
            .HasColumnName("reviews_with_owner_reply_count")
            .IsRequired();

        builder.Property(x => x.ReviewsWithVisibleOwnerReplyCount)
            .HasColumnName("reviews_with_visible_owner_reply_count")
            .IsRequired();
    }
}
