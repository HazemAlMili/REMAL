using System;

namespace RentalPlatform.Data.Entities;

public class NotificationPreference
{
    public Guid Id { get; set; }
    public Guid? AdminUserId { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? OwnerId { get; set; }
    public string Channel { get; set; } = null!;
    public string PreferenceKey { get; set; } = null!;
    public bool IsEnabled { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigations
    public AdminUser? AdminUser { get; set; }
    public Client? Client { get; set; }
    public Owner? Owner { get; set; }
}
