using System;
using System.Collections.Generic;

namespace RentalPlatform.Data.Entities;

public class NotificationTemplate
{
    public Guid Id { get; set; }
    public string TemplateCode { get; set; } = null!;
    public string Channel { get; set; } = null!;
    public string RecipientRole { get; set; } = null!;
    public string? SubjectTemplate { get; set; }
    public string BodyTemplate { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigations
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
