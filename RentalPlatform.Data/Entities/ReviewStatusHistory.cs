using System;

namespace RentalPlatform.Data.Entities;

public class ReviewStatusHistory
{
    public Guid Id { get; set; }
    public Guid ReviewId { get; set; }
    public string? OldStatus { get; set; }
    public string NewStatus { get; set; } = null!;
    public Guid? ChangedByAdminUserId { get; set; }
    public string? Notes { get; set; }
    public DateTime ChangedAt { get; set; }

    // Navigations
    public Review Review { get; set; } = null!;
    public AdminUser? ChangedByAdminUser { get; set; }
}
