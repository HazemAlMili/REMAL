using System;

namespace RentalPlatform.API.DTOs.Requests.Notifications;

public record GetNotificationsRequest(
    string? NotificationStatus,
    string? Channel,
    Guid? TemplateId,
    int Page = 1,
    int PageSize = 20
);
