namespace RentalPlatform.Data.ReadModels;

/// <summary>
/// Keyless read model for the reporting_notifications_daily_summary SQL view.
/// Exposes daily notification lifecycle counts grouped by creation date and
/// channel. Current-status distribution only.
/// Read-only — no write-side semantics, no key, no soft-delete.
/// Scope frozen per DB-RA-01 / DA-RA-01.
/// </summary>
public sealed class ReportingNotificationsDailySummary
{
    public DateOnly MetricDate { get; init; }
    public string Channel { get; init; } = string.Empty;
    public int NotificationsCreatedCount { get; init; }
    public int PendingNotificationsCount { get; init; }
    public int QueuedNotificationsCount { get; init; }
    public int SentNotificationsCount { get; init; }
    public int DeliveredNotificationsCount { get; init; }
    public int FailedNotificationsCount { get; init; }
    public int CancelledNotificationsCount { get; init; }
    public int ReadNotificationsCount { get; init; }
}
