namespace RentalPlatform.API.DTOs.Requests.NotificationDispatch;

public record MarkNotificationFailedRequest(
    string? ErrorMessage,
    string? ProviderName,
    string? ProviderMessageId
);
