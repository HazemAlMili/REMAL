using System;
using System.Collections.Generic;

namespace RentalPlatform.API.DTOs.Requests.Notifications;

public record CreateAdminNotificationRequest(
    string TemplateCode,
    string Channel,
    IReadOnlyDictionary<string, string>? Variables,
    DateTime? ScheduledAt
);
