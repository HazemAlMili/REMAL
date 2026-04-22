using System;

namespace RentalPlatform.API.DTOs.Responses.NotificationDispatch;

public record NotificationDeliveryLogResponse(
    Guid Id,
    Guid NotificationId,
    int AttemptNumber,
    string DeliveryStatus,
    string? ProviderName,
    string? ProviderMessageId,
    string? ErrorMessage,
    DateTime AttemptedAt
);
