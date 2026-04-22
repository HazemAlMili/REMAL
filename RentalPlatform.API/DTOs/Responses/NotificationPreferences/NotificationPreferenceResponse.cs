using System;

namespace RentalPlatform.API.DTOs.Responses.NotificationPreferences;

public record NotificationPreferenceResponse(
    Guid Id,
    Guid? AdminUserId,
    Guid? ClientId,
    Guid? OwnerId,
    string Channel,
    string PreferenceKey,
    bool IsEnabled,
    DateTime UpdatedAt
);
