namespace RentalPlatform.API.DTOs.Requests.NotificationDispatch;

public record MarkNotificationDeliveredRequest(
    string? ProviderName,
    string? ProviderMessageId
);
