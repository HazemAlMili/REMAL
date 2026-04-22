using System;

namespace RentalPlatform.Data.Entities;

public class NotificationDeliveryLog
{
    public Guid Id { get; set; }
    public Guid NotificationId { get; set; }
    public int AttemptNumber { get; set; }
    public string DeliveryStatus { get; set; } = null!;
    public string? ProviderName { get; set; }
    public string? ProviderMessageId { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime AttemptedAt { get; set; }

    // Navigation
    public Notification Notification { get; set; } = null!;
}
