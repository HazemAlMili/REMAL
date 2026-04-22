namespace RentalPlatform.Data.ReadModels;

/// <summary>
/// Keyless read model for the reporting_reviews_daily_summary SQL view.
/// Exposes daily published-review counts, average rating, and owner-reply
/// participation grouped by review publication date.
/// Only published reviews contribute — pending/rejected/hidden are excluded.
/// Read-only — no write-side semantics, no key, no soft-delete.
/// Scope frozen per DB-RA-01 / DA-RA-01.
/// </summary>
public sealed class ReportingReviewsDailySummary
{
    public DateOnly MetricDate { get; init; }
    public int PublishedReviewsCount { get; init; }
    public decimal AverageRating { get; init; }
    public int ReviewsWithOwnerReplyCount { get; init; }
    public int ReviewsWithVisibleOwnerReplyCount { get; init; }
}
