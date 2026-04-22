namespace RentalPlatform.API.DTOs.Requests.NotificationPreferences;

public record UpsertNotificationPreferenceRequest(
    string Channel,
    string PreferenceKey,
    bool IsEnabled
);
