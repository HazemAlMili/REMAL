using System;

namespace RentalPlatform.API.DTOs.Responses.NotificationInbox;

public record NotificationListItemResponse(
    Guid NotificationId,
    string Channel,
    string NotificationStatus,
    string? Subject,
    string Body,
    DateTime CreatedAt,
    DateTime? SentAt,
    DateTime? ReadAt
);
