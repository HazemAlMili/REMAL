using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentalPlatform.Data.Entities;

namespace RentalPlatform.Data.Configurations;

public class UnitReviewSummaryConfiguration : IEntityTypeConfiguration<UnitReviewSummary>
{
    public void Configure(EntityTypeBuilder<UnitReviewSummary> builder)
    {
        builder.ToTable("unit_review_summaries");

        builder.HasKey(e => e.UnitId);
        builder.Property(e => e.UnitId)
            .HasColumnName("unit_id")
            .ValueGeneratedNever();

        builder.Property(e => e.PublishedReviewCount)
            .HasColumnName("published_review_count")
            .IsRequired();

        builder.Property(e => e.AverageRating)
            .HasColumnName("average_rating")
            .HasColumnType("decimal(3,2)")
            .IsRequired();

        builder.Property(e => e.LastReviewPublishedAt)
            .HasColumnName("last_review_published_at");

        builder.Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Relationship
        builder.HasOne(e => e.Unit)
            .WithMany()
            .HasForeignKey(e => e.UnitId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
