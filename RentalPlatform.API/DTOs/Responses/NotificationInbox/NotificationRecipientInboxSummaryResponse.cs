namespace RentalPlatform.API.DTOs.Responses.NotificationInbox;

public record NotificationRecipientInboxSummaryResponse(
    int TotalCount,
    int UnreadCount
);
