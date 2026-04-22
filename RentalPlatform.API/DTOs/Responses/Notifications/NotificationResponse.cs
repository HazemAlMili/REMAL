using System;

namespace RentalPlatform.API.DTOs.Responses.Notifications;

public record NotificationResponse(
    Guid Id,
    Guid TemplateId,
    Guid? AdminUserId,
    Guid? ClientId,
    Guid? OwnerId,
    string Channel,
    string NotificationStatus,
    string? Subject,
    string Body,
    DateTime? ScheduledAt,
    DateTime? SentAt,
    DateTime? ReadAt,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
