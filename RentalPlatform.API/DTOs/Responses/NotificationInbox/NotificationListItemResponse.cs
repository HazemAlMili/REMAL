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
    DateTime? ReadAt,
    /// <summary>
    /// Application-layer sender label. Either the dispatching admin's display name
    /// or the platform system fallback. Never null or empty.
    /// </summary>
    string SenderLabel
);

