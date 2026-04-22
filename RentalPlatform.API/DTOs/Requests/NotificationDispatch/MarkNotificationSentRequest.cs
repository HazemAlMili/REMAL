namespace RentalPlatform.API.DTOs.Requests.NotificationDispatch;

public record MarkNotificationSentRequest(
    string? ProviderName,
    string? ProviderMessageId
);
