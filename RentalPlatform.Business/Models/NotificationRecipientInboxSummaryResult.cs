namespace RentalPlatform.Business.Models;

public record NotificationRecipientInboxSummaryResult
{
    public int TotalCount { get; init; }
    public int UnreadCount { get; init; }
}
