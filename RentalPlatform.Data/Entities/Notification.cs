using System;
using System.Collections.Generic;

namespace RentalPlatform.Data.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public Guid TemplateId { get; set; }
    public Guid? AdminUserId { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? OwnerId { get; set; }
    public string Channel { get; set; } = null!;
    public string NotificationStatus { get; set; } = null!;
    public string? Subject { get; set; }
    public string Body { get; set; } = null!;
    public DateTime? ScheduledAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigations
    public NotificationTemplate Template { get; set; } = null!;
    public AdminUser? AdminUser { get; set; }
    public Client? Client { get; set; }
    public Owner? Owner { get; set; }
    public ICollection<NotificationDeliveryLog> DeliveryLogs { get; set; } = new List<NotificationDeliveryLog>();
}
